import { useEffect, useState, useRef } from "react";
import { Navigate, useSearchParams, useNavigate, Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const aiApiUrl = (import.meta.env.VITE_AI_API_URL ?? "https://api.openai.com/v1/chat/completions").trim();
const aiApiKey = (import.meta.env.VITE_AI_API_KEY ?? "").trim();
const aiModel = (import.meta.env.VITE_AI_MODEL ?? "gpt-4o-mini").trim();

const geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY ?? "").trim();
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const SUGGESTION_PILLS = [
  { label: "Managing Stress", bg: "bg-[#ebdfff]", text: "text-[#8061c4]" },
  { label: "Relationship Advice", bg: "bg-[#d8ece6]", text: "text-[#628b80]" },
  { label: "Better Sleep", bg: "bg-[#c4e6ff]", text: "text-[#4a84ba]" },
  { label: "Anxiety Relief", bg: "bg-[#e8e8e8]", text: "text-[#5e5e5e]" },
];

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

function AISupportChatPage({ session }) {
  const user = session?.user ?? null;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [activeThread, setActiveThread] = useState([]);
  const [activeBranchSelections, setActiveBranchSelections] = useState({});
  
  const [chatInput, setChatInput] = useState("");
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [chatInput]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageValue, setEditingMessageValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedFiles((prev) => {
      const currentCount = prev.length;
      const allowedCount = Math.max(0, 5 - currentCount);
      const filesToAdd = files.slice(0, allowedCount);
      
      const newFiles = filesToAdd.map((f) => ({
        file: f,
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      }));
      
      if (filesToAdd.length < files.length) {
         setFeedback("Maximum 5 files allowed.");
      }
      
      return [...prev, ...newFiles];
    });
    
    setShowUploadMenu(false);
    
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeAttachment = (indexToRemove) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(indexToRemove, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return newFiles;
    });
  };

  const clearAllAttachments = () => {
    selectedFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setSelectedFiles([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const loadSessions = async () => {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, session_title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const rows = data ?? [];
    setChatSessions(rows);
    setSelectedSessionId((prev) => prev ?? rows[0]?.id ?? null);
  };

  const loadMessages = async (sessionId) => {
    if (!supabase || !user || !sessionId) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("id, sender, message, created_at, attachments, parent_id")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    setChatMessages(data ?? []);
  };

  // Branching Logic
  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0) {
      setActiveThread([]);
      return;
    }
    
    const sorted = [...chatMessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    for (let i = 1; i < sorted.length; i++) {
        if (!sorted[i].parent_id) sorted[i].parent_id = sorted[i-1].id;
    }

    const childrenByParent = { root: [] };
    sorted.forEach(msg => {
        const pId = msg.parent_id || 'root';
        if (!childrenByParent[pId]) childrenByParent[pId] = [];
        childrenByParent[pId].push(msg);
    });

    const thread = [];
    let parentId = 'root';
    
    while (true) {
        const siblings = childrenByParent[parentId];
        if (!siblings || siblings.length === 0) break;
        
        let selectedChildId = activeBranchSelections[parentId];
        let currentMsg = siblings.find(c => c.id === selectedChildId);
        
        if (!currentMsg) {
            currentMsg = siblings[siblings.length - 1]; 
        }

        currentMsg.branchIndex = siblings.findIndex(s => s.id === currentMsg.id) + 1;
        currentMsg.branchCount = siblings.length;
        currentMsg.siblings = siblings;

        thread.push(currentMsg);
        parentId = currentMsg.id; 
    }

    setActiveThread(thread);
  }, [chatMessages, activeBranchSelections]);

  const handleBranchSwitch = (parentId, childId) => {
    setActiveBranchSelections(prev => ({
      ...prev,
      [parentId || 'root']: childId
    }));
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    const sessionIdFromQuery = searchParams.get("sessionId");
    if (sessionIdFromQuery) {
      setSelectedSessionId(sessionIdFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedSessionId) loadMessages(selectedSessionId);
  }, [selectedSessionId]);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) setChatInput(prompt);
  }, [searchParams]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeThread]);


  const createAssistantResponse = async (message) => {
    if (!aiApiKey) return "I hear you. Thank you for opening up. Let's work through this one step at a time. 💙";
    try {
      const response = await fetch(aiApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            {
              role: "system",
              content:
                "You are GraceAI, empathetic and non-judgmental. You support wellbeing but do not diagnose or replace clinicians.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error("AI request failed");
      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || "I'm here with you. 💙";
    } catch (_e) {
      return "I'm here with you. Tell me more about what feels hardest right now. 💙";
    }
  };

  const handleCreateSession = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        session_title: `Support chat ${new Date().toLocaleDateString()}`,
        status: "active",
      })
      .select("id")
      .single();
    if (!error && data?.id) {
      setSelectedSessionId(data.id);
      setFeedback("New chat created ✨");
      loadSessions();
      loadMessages(data.id);
    }
  };

  const handleDeleteSession = async (sessionIdToDelete) => {
    const id = sessionIdToDelete || selectedSessionId;
    if (!supabase || !id) return;
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (!error) {
      setFeedback("Chat deleted.");
      if (selectedSessionId === id) {
        setSelectedSessionId(null);
        setChatMessages([]);
      }
      loadSessions();
    } else {
      setFeedback(error.message || "Could not delete session.");
    }
  };

  const handleRenameSession = async (sessionId) => {
    if (!supabase || !editingSessionTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    const { error } = await supabase
      .from("chat_sessions")
      .update({ session_title: editingSessionTitle.trim() })
      .eq("id", sessionId)
      .eq("user_id", user.id);
      
    if (!error) {
      setFeedback("Chat renamed.");
      loadSessions();
    } else {
      setFeedback(error.message || "Could not rename session.");
    }
    setEditingSessionId(null);
  };

  const streamAssistantResponse = async (userMsgId, promptText, imageParts, currentSessionId) => {
    const tempAssistantId = "assistant-" + Date.now();
    
    setChatMessages(prev => [...prev, { 
      id: tempAssistantId, 
      sender: "assistant", 
      message: "...", 
      created_at: new Date().toISOString(),
      parent_id: userMsgId
    }]);
    setIsStreaming(true);

    let assistantReply = "";
    
    if (genAI && imageParts.length > 0) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = promptText || "Please describe these attachments.";
        const result = await model.generateContentStream([prompt, ...imageParts]);
        for await (const chunk of result.stream) {
          assistantReply += chunk.text();
          setChatMessages(prev => prev.map(m => m.id === tempAssistantId ? { ...m, message: assistantReply } : m));
        }
      } catch (err) {
        assistantReply = "I'm sorry, I had trouble reading those files.";
        setChatMessages(prev => prev.map(m => m.id === tempAssistantId ? { ...m, message: assistantReply } : m));
      }
    } else if (genAI) {
      try {
         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
         const result = await model.generateContentStream(promptText);
         for await (const chunk of result.stream) {
           assistantReply += chunk.text();
           setChatMessages(prev => prev.map(m => m.id === tempAssistantId ? { ...m, message: assistantReply } : m));
         }
      } catch(err) {
         assistantReply = await createAssistantResponse(promptText); 
         setChatMessages(prev => prev.map(m => m.id === tempAssistantId ? { ...m, message: assistantReply } : m));
      }
    } else {
      assistantReply = await createAssistantResponse(promptText);
      setChatMessages(prev => prev.map(m => m.id === tempAssistantId ? { ...m, message: assistantReply } : m));
    }

    setIsStreaming(false);
    
    if (user) {
      await supabase.from("chat_messages").insert({ 
        session_id: currentSessionId, 
        sender: "assistant", 
        message: assistantReply,
        parent_id: userMsgId
      });
      loadMessages(currentSessionId);
    }
  };

  const handleSendMessage = async (event) => {
    if (event) event.preventDefault();
    if (isStreaming || (!chatInput.trim() && selectedFiles.length === 0)) return;
    
    let currentSessionId = selectedSessionId;
    if (user && !currentSessionId) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          session_title: `Support chat ${new Date().toLocaleDateString()}`,
          status: "active",
        })
        .select("id")
        .single();
      if (!error && data?.id) {
        currentSessionId = data.id;
        setSelectedSessionId(data.id);
        loadSessions();
      } else {
        return; 
      }
    }

    const userMessage = chatInput.trim();
    const currentFiles = [...selectedFiles];
    
    setChatInput("");
    clearAllAttachments();

    const uploadedAttachments = [];
    if (currentFiles.length > 0) {
      for (const item of currentFiles) {
        const file = item.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${currentSessionId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('chat_attachments')
            .getPublicUrl(filePath);
            
          uploadedAttachments.push({
            name: file.name,
            url: publicUrlData.publicUrl,
            type: file.type
          });
        }
      }
    }

    let messageText = userMessage || (uploadedAttachments.length > 0 ? "" : " ");

    const activeLeaf = activeThread.length > 0 ? activeThread[activeThread.length - 1] : null;
    const parentId = activeLeaf ? activeLeaf.id : null;

    if (user) {
      const { data: newUserMsg } = await supabase.from("chat_messages").insert({ 
        session_id: currentSessionId, 
        sender: "user", 
        message: messageText,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : [],
        parent_id: parentId
      }).select().single();
      
      if (newUserMsg) {
        setActiveBranchSelections(prev => ({
          ...prev,
          [parentId || 'root']: newUserMsg.id
        }));

        const imageParts = [];
        if (currentFiles.length > 0 && genAI) {
          for (const item of currentFiles) {
            const base64Data = await fileToBase64(item.file);
            imageParts.push({ inlineData: { data: base64Data, mimeType: item.file.type } });
          }
        }

        await streamAssistantResponse(newUserMsg.id, messageText, imageParts, currentSessionId);
      }
    } else {
      // Guest Mode Logic
      if (guestMessageCount >= 5) {
        setFeedback("Message limit reached for guests. Please log in to continue. 💙");
        return;
      }

      const tempUserMsgId = "guest-user-" + Date.now();
      const newUserMsg = {
        id: tempUserMsgId,
        sender: "user",
        message: messageText,
        attachments: [], // No file uploads for guests to save storage/bandwidth
        created_at: new Date().toISOString(),
        parent_id: parentId
      };

      setChatMessages(prev => [...prev, newUserMsg]);
      setGuestMessageCount(prev => prev + 1);

      const imageParts = []; // Skip images for guests for now as they require processing
      await streamAssistantResponse(tempUserMsgId, messageText, imageParts, null);
    }
  };

  const handleDictate = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        if (audioBlob.size > 1000) { // Only transcribe if there's actual audio
          await transcribeAudio(audioBlob);
        }
      };

      recorder.start();
      setIsRecording(true);
      setInterimTranscript("");
    } catch (err) {
      console.error("Microphone access error:", err);
      setFeedback("Microphone access denied. 🛑");
    }
  };

  const transcribeAudio = async (audioBlob) => {
    if (!aiApiKey) {
      setFeedback("OpenAI API key missing for transcription.");
      return;
    }

    setIsTranscribing(true);
    setInterimTranscript("Transcribing...");

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model", "whisper-1");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");
      
      const data = await response.json();
      const text = data.text;
      
      if (text) {
        setChatInput((prev) => prev + (prev.trim() ? " " : "") + text);
      }
    } catch (err) {
      console.error("Whisper Error:", err);
      setFeedback("Error transcribing audio. ⚠️");
    } finally {
      setIsTranscribing(false);
      setInterimTranscript("");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setFeedback("Copied to clipboard!");
    setTimeout(() => setFeedback(""), 2000);
  };

  const handleRegenerate = async (messageId) => {
    if (isStreaming) return;
    const assistantMsg = chatMessages.find(m => m.id === messageId);
    if (!assistantMsg) return;
    
    const userMsgObj = chatMessages.find(m => m.id === assistantMsg.parent_id);
    if (!userMsgObj) return;

    await streamAssistantResponse(userMsgObj.id, userMsgObj.message, [], selectedSessionId);
  };

  const saveEditedMessage = async () => {
    if (!editingMessageId || !editingMessageValue.trim()) return;

    if (!user) {
      setChatMessages((prev) =>
        prev.map((message) =>
          message.id === editingMessageId ? { ...message, message: editingMessageValue.trim() } : message
        )
      );
      setEditingMessageId(null);
      setEditingMessageValue("");
      setFeedback("Message updated.");
      return;
    }

    if (!supabase || !selectedSessionId) return;
    const { error } = await supabase
      .from("chat_messages")
      .update({ message: editingMessageValue.trim() })
      .eq("id", editingMessageId)
      .eq("session_id", selectedSessionId)
      .eq("sender", "user");

    if (error) {
      setFeedback(error.message || "Could not edit this message.");
      return;
    }

    setEditingMessageId(null);
    setEditingMessageValue("");
    setFeedback("Message updated.");
    loadMessages(selectedSessionId);
  };

  const deleteMessage = async (messageId) => {
    if (!user) {
      setChatMessages((prev) => prev.filter((message) => message.id !== messageId));
      setFeedback("Message deleted.");
      return;
    }

    if (!supabase || !selectedSessionId) return;
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId)
      .eq("session_id", selectedSessionId);
      
    if (!error) {
      setFeedback("Message deleted.");
      loadMessages(selectedSessionId);
    } else {
      setFeedback(error.message || "Could not delete this message.");
    }
  };

  const renderInputBar = () => (
    <div className="w-full min-w-0 relative bg-[#f4f4f5] dark:bg-slate-800 rounded-[28px] focus-within:bg-white transition-all border border-transparent flex flex-col p-1.5 px-2">
      
      {selectedFiles.length > 0 && (
         <div className="px-3 pt-2 pb-1 flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-bottom-2">
            {selectedFiles.map((item, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 w-16 h-16 bg-white flex items-center justify-center shrink-0 shadow-sm" title={item.file.name}>
                {item.previewUrl ? (
                   <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                   <div className="flex flex-col items-center justify-center p-1">
                     <span className="material-symbols-outlined text-slate-400 text-2xl">description</span>
                     <span className="text-[9px] text-slate-500 font-medium truncate w-12 text-center mt-0.5">{item.file.name.split('.').pop() || "doc"}</span>
                   </div>
                )}
                <button type="button" onClick={() => removeAttachment(idx)} className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
         </div>
      )}

      <div className="flex items-end gap-1 sm:gap-2 min-w-0 w-full pl-1 sm:pl-2">
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            disabled={selectedFiles.length >= 5}
            className={`text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer ${selectedFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`} 
            title={selectedFiles.length >= 5 ? "Maximum 5 files reached" : "Add Attachment"}
          >
            <span className="material-symbols-outlined text-[24px] sm:text-[28px] font-light">add</span>
          </button>
          
          {showUploadMenu && selectedFiles.length < 5 && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUploadMenu(false)}></div>
              <div className="absolute bottom-[calc(100%+12px)] left-0 bg-white rounded-xl shadow-lg border border-slate-200 py-2 w-52 z-50 animate-in fade-in slide-in-from-bottom-2">
                <button 
                  onClick={() => { imageInputRef.current?.click(); setShowUploadMenu(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-3 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-500">image</span>
                  Upload Image
                </button>
                <button 
                  onClick={() => { docInputRef.current?.click(); setShowUploadMenu(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-3 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-500">description</span>
                  Upload Document
                </button>
              </div>
            </>
          )}
        </div>

        <input 
          type="file" 
          multiple
          className="hidden" 
          ref={imageInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
        />
        
        <input 
          type="file" 
          multiple
          className="hidden" 
          ref={docInputRef} 
          onChange={handleFileUpload} 
          accept=".pdf,.doc,.docx,.txt" 
        />
        
        <textarea
          ref={textareaRef}
          rows={1}
          value={chatInput}
          onChange={(e) => {
            setChatInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask anything"
          className="flex-1 min-w-0 bg-transparent border-0 focus:border-0 focus:ring-0 outline-none text-slate-800 placeholder:text-slate-500 py-2.5 sm:py-3 resize-none max-h-60 overflow-y-auto text-sm sm:text-[15px] leading-relaxed"
        />
        
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <button 
            type="button" 
            onClick={handleDictate}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-500 hover:text-slate-800'}`} 
            title={isRecording ? "Listening..." : "Dictate"}
          >
            <span className="material-symbols-outlined text-[24px]">mic</span>
          </button>
          
          {(!chatInput.trim() && selectedFiles.length === 0) ? (
            <button type="button" className="bg-white text-slate-800 p-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center shrink-0 w-[38px] h-[38px] border border-slate-200">
              <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
            </button>
          ) : (
            <button 
              onClick={handleSendMessage}
              disabled={isStreaming}
              className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center shrink-0 w-[38px] h-[38px] disabled:opacity-50"
              title="Send"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">arrow_upward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden w-full max-w-[100vw]">
      <SiteHeader />
      
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {feedback}
        </div>
      )}

      <main className="flex-1 flex overflow-hidden pt-20 sm:pt-24 md:pt-28 min-w-0">
        
        {/* Left Sidebar */}
        <div className="hidden md:flex w-[260px] flex-col bg-[#f9f9f9] border-r border-slate-200 shrink-0">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0">
                <img src="/GraceAI Companion Logo Icon.png" alt="GraceAI" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-h3 text-base text-primary leading-tight">GraceAI</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Companion</span>
              </div>
            </div>
          </div>
          <div className="p-3 space-y-3">
            <button onClick={handleCreateSession} className="w-full flex items-center justify-between bg-white border border-slate-200 hover:bg-slate-50 transition-colors p-3 rounded-xl shadow-sm text-slate-800 font-medium">
              <span className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[20px] text-primary">add</span>
                 New Chat
              </span>
              <span className="material-symbols-outlined text-[18px] text-slate-400">edit_square</span>
            </button>

            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                placeholder="Search chats..."
                value={sessionSearchQuery}
                onChange={(e) => setSessionSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {sessionSearchQuery ? "Search Results" : "Recents"}
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-hide">
            {chatSessions
              .filter(s => {
                const query = sessionSearchQuery.toLowerCase();
                const titleMatch = (s.session_title || "").toLowerCase().includes(query);
                const dateMatch = new Date(s.created_at).toLocaleDateString().toLowerCase().includes(query);
                return titleMatch || dateMatch;
              })
              .map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  if (editingSessionId !== item.id) setSelectedSessionId(item.id);
                }}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition-colors flex justify-between items-center group ${selectedSessionId === item.id ? 'bg-[#ebebeb] text-slate-900' : 'hover:bg-[#f4f4f5] text-slate-700'}`}
              >
                {editingSessionId === item.id ? (
                  <input
                    type="text"
                    value={editingSessionTitle}
                    onChange={(e) => setEditingSessionTitle(e.target.value)}
                    onBlur={() => handleRenameSession(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSession(item.id);
                      if (e.key === "Escape") setEditingSessionId(null);
                    }}
                    autoFocus
                    className="w-full bg-white text-sm font-medium text-slate-900 px-2 py-1 rounded outline-none ring-1 ring-primary/50"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="truncate text-sm font-medium pr-2 flex-1">{item.session_title}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0">
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingSessionId(item.id); 
                          setEditingSessionTitle(item.session_title); 
                        }}
                        className="text-slate-400 hover:text-primary transition-opacity p-1"
                        title="Rename Session"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDeleteSession(item.id); 
                        }}
                        className="text-slate-400 hover:text-red-500 transition-opacity p-1"
                        title="Delete Session"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-200 mt-auto bg-[#f9f9f9]">
            {/* Journal prompt removed */}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative h-full">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between gap-2 px-3 py-3 border-b border-slate-100 bg-white z-10 shrink-0 min-w-0">
             <select className="flex-1 min-w-0 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 truncate" onChange={(e) => setSelectedSessionId(e.target.value)} value={selectedSessionId || ""}>
                {chatSessions.map(item => (
                   <option key={item.id} value={item.id}>{item.session_title}</option>
                ))}
             </select>
             <button onClick={handleCreateSession} className="text-slate-600 p-2"><span className="material-symbols-outlined">edit_square</span></button>
          </div>

          {activeThread.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-4 max-w-3xl mx-auto w-full min-w-0 h-full overflow-y-auto overflow-x-hidden">
              {!user && (
                <div className="w-full mb-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-4 text-left">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">info</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-primary mb-1">Chatting as Guest</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          Your responses won't be saved. Guests are limited to 5 messages.
                        </p>
                      </div>
                    </div>
                    <Link 
                      to="/login" 
                      className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-all whitespace-nowrap active:scale-95"
                    >
                      Log In to Save
                    </Link>
                  </div>
                </div>
              )}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 mb-6 sm:mb-8 text-center break-words w-full px-1">
                What can I help with?
              </h1>
              
              <div className="w-full min-w-0">
                {renderInputBar()}
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center mt-4 sm:mt-6 w-full">
                {SUGGESTION_PILLS.map((pill, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setChatInput(pill.label)}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[15px] font-medium transition-opacity hover:opacity-80 text-center ${pill.bg} ${pill.text}`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat State */
            <>
              <div className="flex-1 overflow-y-auto w-full pb-40" ref={chatContainerRef}>
                {!user && (
                  <div className="max-w-3xl mx-auto w-full p-4 md:p-6 mt-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary">info</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-primary mb-1">Chatting as Guest</h4>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            Your responses won't be saved and your journey won't be synced across devices. 
                            Guests are limited to 5 messages.
                          </p>
                        </div>
                      </div>
                      <Link 
                        to="/login" 
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-all whitespace-nowrap active:scale-95"
                      >
                        Log In to Save
                      </Link>
                    </div>
                  </div>
                )}
                <div className="max-w-3xl mx-auto w-full min-w-0 p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
                  {activeThread.map((message) => (
                    <div key={message.id} className={`flex gap-4 w-full group ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                      
                      {message.sender === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <img src="/GraceAI Companion Logo Icon.png" alt="GraceAI" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className={`w-full max-w-full md:max-w-[85%] flex flex-col relative ${message.sender === "user" ? "items-end" : "items-start"}`}>
                        
                        {editingMessageId === message.id ? (
                           <div className="w-full min-w-0 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <textarea className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" onChange={(event) => setEditingMessageValue(event.target.value)} value={editingMessageValue} rows="3" />
                             <div className="flex gap-2 justify-end">
                               <button className="px-4 py-2 rounded-lg bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all border border-slate-200" onClick={() => setEditingMessageId(null)}>Cancel</button>
                               <button className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all" onClick={saveEditedMessage}>Save & Submit</button>
                             </div>
                           </div>
                        ) : (
                           <div className={`flex flex-col gap-2 w-full ${message.sender === "user" ? "items-end" : "items-start"}`}>
                             
                             {message.attachments && message.attachments.length > 0 && (
                               <div className={`flex flex-wrap gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                 {message.attachments.map((att, idx) => (
                                   att.type?.startsWith("image/") ? (
                                     <a href={att.url} target="_blank" rel="noreferrer" key={idx} className="block hover:opacity-90 transition-opacity">
                                       <img src={att.url} alt={att.name} className="w-40 h-40 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                     </a>
                                   ) : (
                                     <a href={att.url} target="_blank" rel="noreferrer" key={idx} className="flex items-center gap-2 p-2.5 px-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors max-w-[220px]">
                                       <span className="material-symbols-outlined text-slate-400 text-2xl">description</span>
                                       <span className="text-sm text-slate-700 truncate font-medium">{att.name}</span>
                                     </a>
                                   )
                                 ))}
                               </div>
                             )}

                             {message.message && message.message.trim() && (
                               <div className={`p-3.5 px-4 text-[15px] leading-relaxed relative group max-w-full ${message.sender === "user" ? "bg-[#f4f4f5] text-slate-900 rounded-3xl rounded-br-sm" : "bg-transparent text-slate-800 w-full"}`}>
                                 
                                 {message.sender === "assistant" ? (
                                   <div className="w-full break-words text-slate-800">
                                     <ReactMarkdown
                                       components={{
                                         p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                         ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                                         ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                                         li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                         h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
                                         h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-4" {...props} />,
                                         h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3" {...props} />,
                                         strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                                         code({node, inline, className, children, ...props}) {
                                           const match = /language-(\w+)/.exec(className || '')
                                           return !inline && match ? (
                                             <div className="rounded-lg overflow-hidden my-4 border border-slate-200">
                                                <div className="flex justify-between items-center bg-slate-800 text-slate-300 px-4 py-1 text-xs font-mono">
                                                 <span>{match[1]}</span>
                                                 <button onClick={() => navigator.clipboard.writeText(String(children))} className="hover:text-white transition-colors">Copy</button>
                                               </div>
                                               <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{margin: 0, padding: '1rem', fontSize: '0.85rem'}}>
                                                 {String(children).replace(/\n$/, '')}
                                               </SyntaxHighlighter>
                                             </div>
                                           ) : (
                                             <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded-md text-[0.9em] font-mono" {...props}>
                                               {children}
                                             </code>
                                           )
                                         }
                                       }}
                                     >
                                       {message.message}
                                     </ReactMarkdown>
                                     
                                     {/* Action Buttons for Assistant */}
                                     {!isStreaming && (
                                       <div className="flex items-center gap-4 mt-2 transition-opacity">
                                         
                                         {/* Action Icons */}
                                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                           <button onClick={() => handleCopy(message.message)} className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded hover:bg-slate-100" title="Copy response">
                                             <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                           </button>
                                           <button onClick={() => handleRegenerate(message.id)} className="flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded hover:bg-slate-100" title="Regenerate response">
                                             <span className="material-symbols-outlined text-[16px]">refresh</span>
                                           </button>
                                         </div>

                                         {/* Branch Navigation for Assistant */}
                                         {message.branchCount > 1 && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                              <button disabled={message.branchIndex <= 1} onClick={() => handleBranchSwitch(message.parent_id, message.siblings[message.branchIndex - 2].id)} className="p-1 hover:text-slate-800 disabled:opacity-30"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                                              <span>{message.branchIndex} / {message.branchCount}</span>
                                              <button disabled={message.branchIndex >= message.branchCount} onClick={() => handleBranchSwitch(message.parent_id, message.siblings[message.branchIndex].id)} className="p-1 hover:text-slate-800 disabled:opacity-30"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
                                            </div>
                                         )}

                                       </div>
                                     )}
                                   </div>
                                 ) : (
                                  <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                 )}
                                 
                                 {message.sender === "user" && (
                                   <>
                                    <div className="absolute top-1/2 -left-12 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                       <button type="button" className="text-slate-400 hover:text-primary p-1 bg-white rounded-full shadow-sm border border-slate-100" onClick={() => { setEditingMessageId(message.id); setEditingMessageValue(message.message); }} title="Edit"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                                       <button type="button" className="text-slate-400 hover:text-red-500 p-1 bg-white rounded-full shadow-sm border border-slate-100" onClick={() => deleteMessage(message.id)} title="Delete"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                                     </div>
                                   </>
                                 )}
                               </div>
                             )}

                             {/* Branch Navigation for User */}
                             {message.sender === "user" && message.branchCount > 1 && (
                                <div className="flex items-center justify-end w-full">
                                   <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                     <button disabled={message.branchIndex <= 1} onClick={() => handleBranchSwitch(message.parent_id, message.siblings[message.branchIndex - 2].id)} className="p-1 hover:text-slate-700 disabled:opacity-30"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                                     <span>{message.branchIndex} / {message.branchCount}</span>
                                     <button disabled={message.branchIndex >= message.branchCount} onClick={() => handleBranchSwitch(message.parent_id, message.siblings[message.branchIndex].id)} className="p-1 hover:text-slate-700 disabled:opacity-30"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
                                   </div>
                                </div>
                             )}

                           </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Input Area */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-4 sm:pb-6 px-3 sm:px-4 shrink-0 min-w-0">
                <div className="max-w-3xl mx-auto w-full min-w-0">
                  {renderInputBar()}
                  <div className="text-center mt-2">
                     <p className="text-[11px] text-slate-400">GraceAI can make mistakes. Consider verifying important information.</p>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
      {/* Dictation Overlay (ChatGPT style) */}
      {isRecording && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="max-w-xl w-full flex flex-col items-center text-center space-y-10">
              {/* Waveform Animation */}
              <div className="flex items-center gap-1.5 h-16">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-primary rounded-full animate-bounce" 
                      style={{ 
                        height: `${Math.random() * 100 + 20}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }}
                    ></div>
                 ))}
              </div>

              <div className="space-y-4">
                <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight min-h-[3.5em]">
                   {interimTranscript || (isTranscribing ? "Processing..." : "Listening...")}
                </p>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
                  {isTranscribing ? "GraceAI is transcribing" : "GraceAI is listening"}
                </p>
              </div>

              <div className="flex items-center gap-8">
                 <button 
                  onClick={() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                       mediaRecorderRef.current.stop();
                    }
                    setIsRecording(false);
                  }}
                  disabled={isTranscribing}
                  className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group disabled:opacity-50"
                 >
                    {isTranscribing ? (
                       <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl group-hover:hidden">stop</span>
                        <span className="material-symbols-outlined text-4xl hidden group-hover:block">done</span>
                      </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default AISupportChatPage;
