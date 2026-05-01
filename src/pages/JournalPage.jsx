import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";
import EmojiPicker from 'emoji-picker-react';

const MOOD_DATA = {
  1: { emoji: "😫", label: "Terrible", tip: "Journaling is a great way to release heavy emotions. Just write whatever comes to mind, no matter how dark." },
  2: { emoji: "😔", label: "Down", tip: "Try writing about one small thing that went okay today, even if most of it felt difficult." },
  3: { emoji: "😐", label: "Neutral", tip: "Steady days are good for reflection. What's one thing you'd like to focus on tomorrow?" },
  4: { emoji: "🙂", label: "Good", tip: "Record this positive moment! What specifically made you feel good today?" },
  5: { emoji: "😄", label: "Great", tip: "You're thriving! Write down this feeling of success and what led you here to inspire your future self." }
};

function JournalPage({ session }) {
  const user = session?.user ?? null;
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", moodScore: 3 });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [journalFilter, setJournalFilter] = useState('all'); // all, archived
  const [searchQuery, setSearchQuery] = useState("");

  const loadEntries = async () => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, title, content, mood_score, created_at, is_archived")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error && error.code === '42703') { // Column does not exist
      const { data: fallbackData } = await supabase
        .from("journal_entries")
        .select("id, title, content, mood_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEntries(fallbackData?.map(e => ({ ...e, is_archived: false })) ?? []);
    } else {
      setEntries(data ?? []);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  if (!user) return <Navigate replace to="/login" />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!supabase || isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedback("");

    const payload = {
      user_id: user.id,
      title: form.title.trim() || null,
      content: form.content.trim(),
      mood_score: Number(form.moodScore),
    };

    let result;
    if (editingId) {
      result = await supabase
        .from("journal_entries")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", user.id);
    } else {
      result = await supabase.from("journal_entries").insert(payload);
    }

    if (!result.error) {
      setForm({ title: "", content: "", moodScore: 3 });
      setEditingId(null);
      setFeedback(editingId ? "Reflection updated ✨" : "Reflection saved ✨");
      loadEntries();
      setTimeout(() => setFeedback(""), 3000);
    } else {
      setFeedback(`Error: ${result.error.message || "Unable to save"}. ⚠️`);
    }
    setIsSubmitting(false);
  };

  const handleEdit = (entry) => {
    setForm({
      title: entry.title || "",
      content: entry.content,
      moodScore: entry.mood_score
    });
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setEntryToDelete(id);
  };

  const confirmDelete = async () => {
    if (!supabase || !entryToDelete) return;
    
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryToDelete)
      .eq("user_id", user.id);

    if (!error) {
      setFeedback("Entry deleted.");
      loadEntries();
      setTimeout(() => setFeedback(""), 3000);
    } else {
      alert(`Delete failed: ${error.message}`);
    }
    setEntryToDelete(null);
  };

  const handleArchive = async (id, isArchived) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("journal_entries")
      .update({ is_archived: !isArchived })
      .eq("id", id)
      .eq("user_id", user.id);
    
    if (!error) {
      setFeedback(!isArchived ? "Reflection archived." : "Reflection restored.");
      loadEntries();
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <SiteHeader />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <section className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <h1 className="font-h2 text-h2 text-primary mb-6 flex items-center gap-2">
              <span className="text-3xl">📓</span> {editingId ? "Edit Journal Entry" : "Personal Journal"}
            </h1>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1">Title (Optional)</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Give your reflection a name..."
                  value={form.title}
                />
              </div>

              <div className="space-y-2 relative">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Your Thoughts</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border ${showEmojiPicker ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'}`}
                      title="Add Emoji"
                    >
                      <span className="material-symbols-outlined text-[20px]">mood</span>
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute z-50 right-0 top-full mt-2 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                        <div className="fixed inset-0 z-[-1]" onClick={() => setShowEmojiPicker(false)}></div>
                        <EmojiPicker 
                          onEmojiClick={(emojiData) => {
                            setForm(prev => ({ ...prev, content: prev.content + emojiData.emoji }));
                          }}
                          emojiStyle="apple"
                          autoFocusSearch={false}
                          theme="light"
                          width={320}
                          height={400}
                          skinTonesDisabled
                          searchPlaceHolder="Search emojis..."
                          previewConfig={{ showPreview: false }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  className="w-full min-h-44 rounded-[24px] border border-slate-200 p-5 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none text-slate-700 leading-relaxed placeholder:text-slate-400"
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  placeholder="What's on your mind? Be honest, this is your private space. 💭"
                  required
                  value={form.content}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-on-surface-variant ml-1">How's your mood for this entry?</label>
                <div className="flex justify-between gap-2 max-w-lg">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, moodScore: score }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        form.moodScore === score 
                        ? 'bg-primary/5 border-primary scale-105' 
                        : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-3xl ${form.moodScore === score ? 'animate-bounce-subtle' : ''}`}>
                        {MOOD_DATA[score].emoji}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${form.moodScore === score ? 'text-primary' : 'text-slate-400'}`}>
                        {MOOD_DATA[score].label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm italic text-on-surface-variant/70 pl-1">
                  💡 {MOOD_DATA[form.moodScore].tip}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button 
                  className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer active:scale-95 disabled:opacity-50" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : (editingId ? "Update Entry" : "Save Entry")}
                </button>
                {editingId && (
                  <button 
                    className="text-slate-500 font-bold hover:underline cursor-pointer" 
                    onClick={() => { setEditingId(null); setForm({ title: "", content: "", moodScore: 3 }); }}
                    type="button"
                  >
                    Cancel Edit
                  </button>
                )}
                {feedback ? (
                  <span className={`text-sm font-medium ${feedback.includes('⚠️') || feedback.includes('failed') ? 'text-red-500' : 'text-emerald-600'} animate-in fade-in slide-in-from-left-2`}>
                    {feedback}
                  </span>
                ) : null}
              </div>
            </form>
          </section>

          <section className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="space-y-4 w-full md:w-auto">
                <h2 className="font-h3 text-h3 text-primary">Journal entries</h2>
                <div className="relative w-full md:w-80 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                    placeholder="Search by title or date..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto self-end md:self-auto">
                <button 
                  onClick={() => setJournalFilter('all')}
                  className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${journalFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  All ({entries.length})
                </button>
                <button 
                  onClick={() => setJournalFilter('archived')}
                  className={`flex-1 sm:px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${journalFilter === 'archived' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Archived ({entries.filter(e => e.is_archived).length})
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {entries.filter(e => {
                const matchesFilter = journalFilter === 'archived' ? e.is_archived : true;
                const dateStr = new Date(e.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'}).toLowerCase();
                const titleStr = (e.title || "").toLowerCase();
                const query = searchQuery.toLowerCase();
                const matchesSearch = titleStr.includes(query) || dateStr.includes(query);
                return matchesFilter && matchesSearch;
              }).length === 0 ? (
                <div className="col-span-2 text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-on-surface-variant font-medium">
                    {searchQuery 
                      ? "No reflections match your search. 🔍" 
                      : (journalFilter === 'archived' ? "No archived reflections yet. 📁" : "Your journal is empty. ✨")}
                  </p>
                </div>
              ) : (
                entries
                  .filter(e => {
                    const matchesFilter = journalFilter === 'archived' ? e.is_archived : true;
                    const dateStr = new Date(e.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'}).toLowerCase();
                    const titleStr = (e.title || "").toLowerCase();
                    const query = searchQuery.toLowerCase();
                    const matchesSearch = titleStr.includes(query) || dateStr.includes(query);
                    return matchesFilter && matchesSearch;
                  })
                  .map((entry) => (
                  <article className="rounded-2xl border border-slate-100 bg-slate-50 hover:border-primary/20 transition-all group relative overflow-hidden" key={entry.id}>
                    <Link to={`/dashboard/journal/${entry.id}`} className="block p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-primary text-lg group-hover:text-primary/80 transition-colors">{entry.title || "Untitled reflection"}</h3>
                          <time className="text-[10px] text-slate-400 block uppercase tracking-widest font-bold">
                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}
                          </time>
                        </div>
                        <span className="text-3xl" title={MOOD_DATA[entry.mood_score]?.label}>
                          {MOOD_DATA[entry.mood_score]?.emoji || "😐"}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-3">{entry.content}</p>
                    </Link>
                    
                    <div className="flex gap-4 px-6 pb-4 pt-2 border-t border-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                        to={`/dashboard/journal/${entry.id}`}
                      >
                        View & Edit
                      </Link>
                      <button 
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:underline cursor-pointer"
                        onClick={() => handleArchive(entry.id, entry.is_archived)}
                        type="button"
                      >
                        {entry.is_archived ? "Restore" : "Archive"}
                      </button>
                      <button 
                        className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:underline cursor-pointer ml-auto"
                        onClick={() => handleDeleteClick(entry.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Custom Delete Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEntryToDelete(null)}>
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-[20px] bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
              <span className="material-symbols-outlined text-3xl text-red-500">delete</span>
            </div>
            <h3 className="font-h3 text-xl text-center text-primary mb-2">Delete entry?</h3>
            <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setEntryToDelete(null)}
                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalPage;
