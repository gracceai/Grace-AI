import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";
import EmojiPicker from 'emoji-picker-react';

const MOOD_DATA = {
  1: { emoji: "😫", label: "Terrible" },
  2: { emoji: "😔", label: "Down" },
  3: { emoji: "😐", label: "Neutral" },
  4: { emoji: "🙂", label: "Good" },
  5: { emoji: "😄", label: "Great" }
};

function ViewJournalEntryPage({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = session?.user ?? null;
  
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", moodScore: 3 });
  const [feedback, setFeedback] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadEntry();
  }, [id, user]);

  const loadEntry = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      navigate("/journal");
    } else {
      setEntry(data);
      setForm({
        title: data.title || "",
        content: data.content,
        moodScore: data.mood_score
      });
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("journal_entries")
      .update({
        title: form.title.trim() || null,
        content: form.content.trim(),
        mood_score: form.moodScore
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setFeedback("Reflection updated ✨");
      setIsEditing(false);
      loadEntry();
      setTimeout(() => setFeedback(""), 3000);
    } else {
      setFeedback("Error updating entry. ⚠️");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background">
      <SiteHeader />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/dashboard/journal" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Journal
          </Link>

          <article className="bg-white rounded-[40px] border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0"></div>
            
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-primary outline-none text-lg font-bold text-primary"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Your Thoughts</label>
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-slate-400 hover:text-primary"
                    >
                      <span className="material-symbols-outlined">mood</span>
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute right-0 bottom-full mb-4 z-50">
                        <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)}></div>
                        <EmojiPicker onEmojiClick={(e) => setForm({...form, content: form.content + e.emoji})} />
                      </div>
                    )}
                  </div>
                  <textarea
                    className="w-full min-h-[300px] rounded-[32px] border border-slate-200 p-8 focus:ring-2 focus:ring-primary outline-none text-slate-700 leading-relaxed"
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6">
                   <div className="flex gap-2">
                     {[1,2,3,4,5].map(s => (
                       <button 
                        key={s}
                        type="button"
                        onClick={() => setForm({...form, moodScore: s})}
                        className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${form.moodScore === s ? 'bg-primary/10 border-2 border-primary scale-110' : 'bg-slate-50 border-2 border-transparent opacity-50'}`}
                       >
                         {MOOD_DATA[s].emoji}
                       </button>
                     ))}
                   </div>
                   <div className="flex gap-3">
                     <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                     <button type="submit" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">Save Changes</button>
                   </div>
                </div>
              </form>
            ) : (
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                      {entry.title || "Untitled Reflection"}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      <span>{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}</span>
                      <span>•</span>
                      <span>{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <span className="text-3xl">{MOOD_DATA[entry.mood_score]?.emoji}</span>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{MOOD_DATA[entry.mood_score]?.label}</span>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 text-lg leading-[1.8] whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>

                {feedback && (
                   <div className="mt-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-sm text-center animate-in fade-in slide-in-from-bottom-2">
                     {feedback}
                   </div>
                )}
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}

export default ViewJournalEntryPage;
