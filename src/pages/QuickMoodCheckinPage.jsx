import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import MoodSelector from "../components/MoodSelector";
import { supabase } from "../lib/supabase";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie } from 'recharts';

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOOD_DATA = {
  1: { emoji: "😫", label: "Terrible", color: "text-red-600", tip: "**It's okay to feel this way.** Try the '5-4-3-2-1' grounding technique. Focus on 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste." },
  2: { emoji: "😔", label: "Down", color: "text-orange-600", tip: "**Take it slow.** A 10-minute walk outside or some light stretching can help shift your perspective. Remember, small steps are still progress." },
  3: { emoji: "😐", label: "Neutral", color: "text-yellow-600", tip: "**Stay present.** This is a neutral ground. Try a quick mindfulness exercise or write down one thing you're grateful for today to boost your mood." },
  4: { emoji: "🙂", label: "Good", color: "text-lime-600", tip: "**Keep the momentum!** You're doing well. Take a moment to acknowledge a recent win, no matter how small." },
  5: { emoji: "😄", label: "Great", color: "text-emerald-600", tip: "**Radiate positivity!** You're in a great headpace. Use this energy to tackle a challenge or reach out and support a friend." }
};

function QuickMoodCheckinPage({ session }) {
  const user = session?.user ?? null;
  const [form, setForm] = useState({ moodScore: 3, notes: "" });
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  function getMoodBucket(score) {
    if (score <= 2) return "low";
    if (score === 3) return "balanced";
    if (score === 4) return "good";
    return "great";
  }

  const loadLogs = async () => {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from("mood_logs")
      .select("id, mood_score, notes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setLogs(data ?? []);
  };

  useEffect(() => {
    loadLogs();
  }, [user]);

  const trend = useMemo(() => {
    const grouped = new Map();
    logs.forEach((row) => {
      const date = new Date(row.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const current = grouped.get(key) ?? { day: dayLabels[date.getDay()], total: 0, count: 0, ts: date.getTime() };
      current.total += Number(row.mood_score ?? 3);
      current.count += 1;
      grouped.set(key, current);
    });
    return Array.from(grouped.values())
      .sort((a, b) => a.ts - b.ts)
      .slice(-7)
      .map((item) => ({ day: item.day, score: Math.round(item.total / item.count) }));
  }, [logs]);

  const pieData = useMemo(() => {
    return [
      { name: 'Low', emoji: '😫', value: trend.filter(m => getMoodBucket(m.score) === 'low').length, fill: '#fca5a5' },
      { name: 'Balanced', emoji: '😐', value: trend.filter(m => getMoodBucket(m.score) === 'balanced').length, fill: '#fcd34d' },
      { name: 'Good', emoji: '🙂', value: trend.filter(m => getMoodBucket(m.score) === 'good').length, fill: '#6ee7b7' },
      { name: 'Great', emoji: '✨', value: trend.filter(m => getMoodBucket(m.score) === 'great').length, fill: '#4a154b' },
    ].filter(d => d.value > 0);
  }, [trend]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-medium shadow-lg">
          {`${payload[0].payload.day || payload[0].name}: ${payload[0].value} ${payload[0].name ? 'entries' : '/ 5'}`}
        </div>
      );
    }
    return null;
  };

  if (!user) return <Navigate replace to="/login" />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!supabase || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback("");

    const { error } = await supabase.from("mood_logs").insert({
      user_id: user.id,
      mood_score: Number(form.moodScore),
      notes: form.notes.trim() || null,
      source: "dashboard",
    });

    if (!error) {
      setForm({ moodScore: 3, notes: "" });
      setFeedback("Mood saved 🌈");
      loadLogs();
      setTimeout(() => setFeedback(""), 3000);
    } else {
      console.error("Supabase Save Error:", error);
      setFeedback(`Error: ${error.message || "Unable to save"}. ⚠️`);
    }
    setIsSubmitting(false);
  };

  const handleDeleteLog = async (logId) => {
    if (!supabase) return;
    const { error } = await supabase.from("mood_logs").delete().eq("id", logId).eq("user_id", user.id);
    if (!error) {
      setFeedback("Reflection removed.");
      setShowDeleteModal(false);
      setLogToDelete(null);
      loadLogs();
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleUpdateNote = async (logId) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("mood_logs")
      .update({ notes: editNote.trim() || null })
      .eq("id", logId)
      .eq("user_id", user.id);
    
    if (!error) {
      setEditingLogId(null);
      setFeedback("Reflection updated.");
      loadLogs();
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const confirmDeleteLog = (log) => {
    setLogToDelete(log);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <section className="bg-white rounded-[32px] border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm">
            <h1 className="font-h2 text-xl sm:text-h2 text-primary mb-6 sm:mb-8 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🌈</span> Quick Mood Check-in
            </h1>
            
            <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-6">
                <label className="text-base sm:text-lg font-bold text-on-surface">How are you feeling right now?</label>
                <MoodSelector
                  value={form.moodScore}
                  onChange={(score) => setForm((prev) => ({ ...prev, moodScore: score }))}
                />
              </div>

              {/* Dynamic Guidelines */}
              <div className={`p-4 sm:p-6 rounded-[24px] border-2 transition-all duration-500 shadow-sm ${
                form.moodScore <= 2 ? 'bg-red-50 border-red-100' : 
                form.moodScore === 3 ? 'bg-amber-50 border-amber-100' : 
                'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="flex gap-4">
                  <span className="text-3xl mt-1">💡</span>
                  <div>
                    <h3 className="font-bold text-on-surface mb-1 text-lg">Guided Tip for You:</h3>
                    <p className="text-on-surface-variant leading-relaxed">
                      {MOOD_DATA[form.moodScore].tip.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant ml-1">Add a note (Optional)</label>
                <textarea
                  className="w-full min-h-32 rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="What's making you feel this way? Share your thoughts... ✍️"
                  value={form.notes}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
                <button 
                  className="w-full sm:w-auto bg-primary text-on-primary px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save My Mood"}
                </button>
                {feedback ? (
                  <span className={`text-sm font-bold animate-in fade-in slide-in-from-left-2 duration-300 ${feedback.includes('⚠️') ? 'text-red-500' : 'text-emerald-600'}`}>
                    {feedback}
                  </span>
                ) : null}
              </div>
            </form>
          </section>


          <section className="grid lg:grid-cols-5 gap-6">
            {/* Mood Trend - Takes up 2 columns */}
            <article className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm h-[380px] flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <h2 className="font-bold text-slate-800">Weekly Pattern</h2>
                {/* Chart Type Toggle */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button 
                    onClick={() => setChartType('bar')} 
                    className={`p-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${chartType === 'bar' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight pr-1">Bar</span>
                  </button>
                  <button 
                    onClick={() => setChartType('line')} 
                    className={`p-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${chartType === 'line' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">show_chart</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight pr-1">Line</span>
                  </button>
                  <button 
                    onClick={() => setChartType('pie')} 
                    className={`p-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${chartType === 'pie' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight pr-1">Pie</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow min-h-0">
                {trend.length > 0 ? (
                  <>
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                            dy={10} 
                            interval={0}
                            padding={{ left: 20, right: 20 }}
                          />
                          <YAxis hide domain={[0, 5]} />
                          <Tooltip cursor={{ fill: 'rgba(74, 21, 75, 0.05)' }} content={<CustomTooltip />} />
                          <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={28}>
                            {trend.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="#4a154b" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'line' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                            dy={10} 
                            interval={0}
                            padding={{ left: 30, right: 30 }}
                          />
                          <YAxis hide domain={[0, 5]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="score" stroke="#4a154b" strokeWidth={3} dot={{ r: 4, fill: '#4a154b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                    {chartType === 'pie' && (
                      <div className="flex flex-col items-center justify-center h-full w-full py-2">
                        <div className="w-full h-[150px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2 px-2">
                          {pieData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shadow-sm border border-slate-100" style={{ backgroundColor: `${item.fill}20` }}>
                                {item.emoji}
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full">Log your first mood to see the trend!</p>
                  </div>
                )}
              </div>
            </article>

            {/* Recent Reflections - Takes up 3 columns */}
            <article className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-h3 text-h3 text-primary">Your Recent Reflections</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">History</span>
              </div>
              
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">Your reflection history is empty. <br/>Start your journey today! ✨</p>
                  </div>
                ) : (
                  logs.map((log) => {
                    const isEditing = editingLogId === log.id;
                    return (
                      <div className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors group relative" key={log.id}>
                        {/* Action Buttons */}
                        {!isEditing && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingLogId(log.id); setEditNote(log.notes || ""); }}
                              className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-primary hover:shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button 
                              onClick={() => confirmDeleteLog(log)}
                              className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        )}

                        <div className="bg-white h-14 w-14 rounded-xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
                          {MOOD_DATA[log.mood_score]?.emoji || "😐"}
                        </div>
                        <div className="flex-grow space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-primary">{MOOD_DATA[log.mood_score]?.label}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <textarea 
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdateNote(log.id)} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold">Save</button>
                                <button onClick={() => setEditingLogId(null)} className="text-slate-500 text-xs font-bold">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-on-surface-variant leading-relaxed pr-16">
                              {log.notes || <span className="text-slate-400 italic">Checked in without a note.</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>
        </div>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl scale-in-center border border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6 mx-auto">
              <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Remove Reflection?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this mood log? This will remove it from your weekly patterns.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleDeleteLog(logToDelete.id)}
                className="w-full bg-red-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98]"
              >
                Yes, Delete it
              </button>
              <button 
                onClick={() => { setShowDeleteModal(false); setLogToDelete(null); }}
                className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickMoodCheckinPage;
