import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const listenerMessage =
  "Hello. I'm here to listen. How are you feeling after today's walk near the dunes?";
const senderMessage = "It was peaceful, but I'm still feeling a bit overwhelmed with work.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function TypingChatCard() {
  const navigate = useNavigate();
  const [listenerTyped, setListenerTyped] = useState("");
  const [senderTyped, setSenderTyped] = useState("");
  const [listenerTyping, setListenerTyping] = useState(false);
  const [senderTyping, setSenderTyping] = useState(false);

  useEffect(() => {
    let active = true;

    const typeMessage = async (text, setter, setTyping, speed) => {
      setTyping(true);
      setter("");

      for (let index = 1; index <= text.length && active; index += 1) {
        setter(text.slice(0, index));
        await sleep(speed);
      }

      setTyping(false);
    };

    const runAnimation = async () => {
      while (active) {
        setListenerTyped("");
        setSenderTyped("");
        setListenerTyping(false);
        setSenderTyping(false);

        await sleep(320);
        await typeMessage(listenerMessage, setListenerTyped, setListenerTyping, 30);
        await sleep(520);
        await typeMessage(senderMessage, setSenderTyped, setSenderTyping, 24);
        await sleep(2000);
      }
    };

    runAnimation();

    return () => {
      active = false;
    };
  }, []);

  const typingStatus = listenerTyping || senderTyping ? "Typing..." : "Online";
  const hasSenderBubble = senderTyping || senderTyped.length > 0;

  return (
    <div className="bg-[#f6f7ef]/80 backdrop-blur-xl border border-white/70 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden max-w-[780px]">
      <div className="flex items-center gap-4 mb-xl">
        <div className="w-14 h-14 bg-white rounded-full overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm">
          <img src="/GraceAI Companion Logo Icon.png" alt="GraceAI" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-h3 text-h3 text-primary">Grace Companion</h3>
          <p className="text-body-sm text-slate-500">{typingStatus}</p>
        </div>
      </div>

      <div className="space-y-md min-h-[220px]">
        <div className="bg-[#c4cec0]/85 p-5 rounded-[22px] rounded-tl-sm max-w-[86%] text-body-lg text-[#2a4f4a] leading-relaxed">
          {listenerTyped}
          {listenerTyping && <span className="chat-caret">▋</span>}
        </div>

        {hasSenderBubble && (
          <div className="bg-primary text-white p-5 rounded-[22px] rounded-tr-sm max-w-[86%] ml-auto text-body-lg font-semibold leading-relaxed">
            {senderTyped}
            {senderTyping && <span className="chat-caret">▋</span>}
          </div>
        )}
      </div>

      <div 
        className="mt-xl flex items-center gap-3 py-3 px-4 bg-white/90 rounded-full border border-slate-200 cursor-pointer hover:bg-white transition-all active:scale-[0.98]"
        onClick={() => navigate("/dashboard/ai-support-chat")}
      >
        <span className="material-symbols-outlined text-slate-400 text-[28px]">add_circle</span>
        <span className="text-slate-400 flex-grow text-base">Message Grace...</span>
        <span className="material-symbols-outlined text-primary text-[30px]">send</span>
      </div>
    </div>
  );
}

export default TypingChatCard;
