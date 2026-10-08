import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie } from 'recharts';

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const moodPalette = {
  low: { label: "Low", color: "bg-red-200", text: "text-red-700" },
  balanced: { label: "Balanced", color: "bg-amber-200", text: "text-amber-700" },
  good: { label: "Good", color: "bg-emerald-200", text: "text-emerald-700" },
  great: { label: "Great", color: "bg-primary-fixed", text: "text-primary" },
};

function getMoodBucket(score) {
  if (score <= 2) return "low";
  if (score === 3) return "balanced";
  if (score === 4) return "good";
  return "great";
}

const PRESET_GOALS = [
  { title: "Meditate 10m", target: 1, icon: "🧘" },
  { title: "Drink 2L Water", target: 2, icon: "💧" },
  { title: "Walk 30 mins", target: 30, icon: "🚶" },
  { title: "No Social Media", target: 1, icon: "📵" },
];

function DashboardPage({ session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moodTrend, setMoodTrend] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [stats, setStats] = useState({
    streakDays: 0,
    reflectionsCount: 0,
    supportSessions: 0,
  });
  const [wellnessGoals, setWellnessGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({ title: "", targetValue: "1" });
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalFilter, setGoalFilter] = useState('all'); // all, active, completed
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [recentConversations, setRecentConversations] = useState([]);

  const user = session?.user ?? null;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend";

  const loadDashboardData = async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFeedback("");

    try {
      const [moodsResult, journalResult, sessionsResult, goalsResult] = await Promise.all([
        supabase
          .from("mood_logs")
          .select("id, mood_score, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("journal_entries")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("chat_sessions")
          .select("id, session_title, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("wellness_goals")
          .select("id, title, target_value, current_value")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const moodRows = moodsResult.error ? [] : moodsResult.data ?? [];
      const journalRows = journalResult.error ? [] : journalResult.data ?? [];
      const sessionRows = sessionsResult.error ? [] : sessionsResult.data ?? [];
      const goalRows = goalsResult.error ? [] : goalsResult.data ?? [];

      const grouped = new Map();
      moodRows.forEach((row) => {
        const date = new Date(row.created_at);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const current = grouped.get(key) ?? { day: dayLabels[date.getDay()], total: 0, count: 0, ts: date.getTime() };
        current.total += Number(row.mood_score ?? 3);
        current.count += 1;
        grouped.set(key, current);
      });

      const trend = Array.from(grouped.values())
        .sort((a, b) => a.ts - b.ts)
        .slice(-7)
        .map((item) => ({ day: item.day, score: Math.min(5, Math.max(1, Math.round(item.total / item.count))) }));

      setMoodTrend(trend);
      setWellnessGoals(goalRows);
      setRecentConversations(sessionRows.slice(0, 3));
      setStats({
        streakDays: trend.length,
        reflectionsCount: journalRows.length,
        supportSessions: sessionRows.length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const moodAverage = useMemo(() => {
    if (moodTrend.length === 0) return null;
    const total = moodTrend.reduce((sum, item) => sum + item.score, 0);
    return Number((total / moodTrend.length).toFixed(1));
  }, [moodTrend]);

  const moodState = moodAverage ? moodPalette[getMoodBucket(Math.round(moodAverage))] : null;

  const pieData = useMemo(() => {
    return [
      { name: 'Low', emoji: '😫', value: moodTrend.filter(m => getMoodBucket(m.score) === 'low').length, fill: '#fca5a5' },
      { name: 'Balanced', emoji: '😐', value: moodTrend.filter(m => getMoodBucket(m.score) === 'balanced').length, fill: '#fcd34d' },
      { name: 'Good', emoji: '🙂', value: moodTrend.filter(m => getMoodBucket(m.score) === 'good').length, fill: '#6ee7b7' },
      { name: 'Great', emoji: '✨', value: moodTrend.filter(m => getMoodBucket(m.score) === 'great').length, fill: '#4a154b' },
    ].filter(d => d.value > 0);
  }, [moodTrend]);

  if (!user) return <Navigate replace to="/login" />;

  const handleGoalSubmit = async (event) => {
    event.preventDefault();
    if (!supabase || !user) return;
    const { error } = await supabase.from("wellness_goals").insert({
      user_id: user.id,
      title: goalForm.title.trim(),
      target_value: Number(goalForm.targetValue) || 100,
      current_value: 0,
    });
    if (!error) {
      setGoalForm({ title: "", targetValue: "100" });
      setFeedback("Focus area added.");
      loadDashboardData();
    }
  };

  const handleGoalProgress = async (goalId, nextValue) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("wellness_goals")
      .update({ current_value: Number(nextValue) || 0 })
      .eq("id", goalId)
      .eq("user_id", user.id);
    if (!error) loadDashboardData();
  };

  const handleGoalDelete = async (goalId) => {
    if (!supabase) return;
    const { error } = await supabase.from("wellness_goals").delete().eq("id", goalId).eq("user_id", user.id);
    if (!error) {
      setFeedback("Focus area removed.");
      setShowDeleteModal(false);
      setGoalToDelete(null);
      loadDashboardData();
    }
  };

  const confirmDelete = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const handleGoalEditSave = async (event) => {
    event.preventDefault();
    if (!supabase || !editingGoal) return;
    const { error } = await supabase
      .from("wellness_goals")
      .update({ 
        title: editingGoal.title.trim(), 
        target_value: Number(editingGoal.target_value) || 1 
      })
      .eq("id", editingGoal.id)
      .eq("user_id", user.id);
    
    if (!error) {
      setEditingGoal(null);
      setFeedback("Changes saved.");
      loadDashboardData();
    }
  };

  const getGoalIcon = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes('water') || t.includes('drink')) return '💧';
    if (t.includes('meditate') || t.includes('breath') || t.includes('yoga')) return '🧘';
    if (t.includes('walk') || t.includes('run') || t.includes('gym') || t.includes('step')) return '🚶';
    if (t.includes('social') || t.includes('phone') || t.includes('media')) return '📵';
    if (t.includes('journal') || t.includes('write')) return '✍️';
    if (t.includes('sleep') || t.includes('bed')) return '😴';
    if (t.includes('read') || t.includes('book')) return '📚';
    return '🎯';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-medium shadow-lg">
          {`${payload[0].payload.day || payload[0].name}: ${payload[0].value} ${payload[0].name ? 'days' : '/ 5'}`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="bg-gradient-to-r from-primary to-primary-container rounded-[28px] p-6 sm:p-8 text-white shadow-2xl">
            <p className="text-primary-fixed text-sm tracking-wide uppercase mb-2">GraceAI Dashboard</p>
            <h1 className="font-h1 text-[30px] sm:text-[38px] leading-tight mb-3">
              Welcome back, {displayName}. Your wellness progress overview.
            </h1>
            <p className="text-primary-fixed max-w-3xl">
              Use the navigation bar to open Journal, Quick Mood Check-in, AI Support Chat, and Stigma-Sensitive Health Support.
            </p>
          </section>
          {feedback ? <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">{feedback}</section> : null}

          <section className="grid md:grid-cols-3 gap-4">
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-on-surface-variant mb-2">Current Mood Pattern</p>
              {moodState ? (
                <div className="flex items-center gap-3">
                  <span className={`h-10 w-10 rounded-xl ${moodState.color}`} />
                  <div>
                    <p className={`font-semibold ${moodState.text}`}>{moodState.label}</p>
                    <p className="text-sm text-on-surface-variant">Weekly score: {moodAverage} / 5</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">No mood logs recorded yet.</p>
              )}
            </article>
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-on-surface-variant">Streak</p>
              <p className="font-h2 text-h2 text-primary mt-2">{stats.streakDays} days</p>
              <p className="text-sm text-on-surface-variant mt-1">You are building healthy consistency.</p>
            </article>
            <article className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-on-surface-variant">Support Sessions</p>
              <p className="font-h2 text-h2 text-primary mt-2">{stats.supportSessions}</p>
              <p className="text-sm text-on-surface-variant mt-1">Total guided AI conversations.</p>
            </article>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-h3 text-h3 text-primary">Recent Conversations</h2>
              <button
                className="text-sm font-semibold text-primary hover:underline"
                type="button"
                onClick={() => navigate("/dashboard/ai-support-chat")}
              >
                View all
              </button>
            </div>
            {recentConversations.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No conversations yet. Start your first chat now.</p>
            ) : (
              <div className="grid gap-3">
                {recentConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/ai-support-chat?sessionId=${encodeURIComponent(conversation.id)}`)
                    }
                    className="text-left p-4 rounded-2xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <p className="font-semibold text-primary truncate">
                      {conversation.session_title || "Untitled conversation"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(conversation.created_at).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="grid lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm h-[380px] flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
                <h2 className="font-h3 text-h3 text-primary flex items-center gap-2">
                   Mood Trend (Last 7 Days)
                   {loading && <span className="text-xs font-normal text-slate-400">Refreshing...</span>}
                </h2>
                
                {/* Chart Type Toggle */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button 
                     onClick={() => setChartType('bar')} 
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${chartType === 'bar' ? 'active-filter bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                     Bar
                  </button>
                  <button 
                     onClick={() => setChartType('line')} 
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${chartType === 'line' ? 'active-filter bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <span className="material-symbols-outlined text-[18px]">show_chart</span>
                     Line
                  </button>
                  <button 
                     onClick={() => setChartType('pie')} 
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${chartType === 'pie' ? 'active-filter bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                     Pie
                  </button>
                </div>
              </div>
              
              <div className="flex-grow min-h-0 w-full mt-6">
                {moodTrend.length > 0 ? (
                  <>
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moodTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} 
                          dy={10} 
                          interval={0}
                          padding={{ left: 20, right: 20 }}
                        />
                        <YAxis hide domain={[0, 5]} />
                        <Tooltip cursor={{ fill: 'rgba(74, 21, 75, 0.05)' }} content={<CustomTooltip />} />
                        <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={44}>
                          {moodTrend.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#4a154b" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    )}
                    {chartType === 'line' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodTrend} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} 
                          dy={15} 
                          interval={0}
                          padding={{ left: 30, right: 30 }}
                        />
                        <YAxis hide domain={[0, 5]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="score" stroke="#4a154b" strokeWidth={4} dot={{ r: 6, fill: '#4a154b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    )}
                    {chartType === 'pie' && (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 h-full w-full">
                        {/* Pie Chart Side */}
                        <div className="flex-grow h-full min-w-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
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
                        
                        {/* Legend Side */}
                        <div className="flex flex-row md:flex-col flex-wrap md:flex-nowrap justify-center gap-3 w-full md:w-44 shrink-0 md:border-l border-slate-100 md:pl-6 pt-2 md:pt-0">
                          {pieData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100" style={{ backgroundColor: `${item.fill}20` }}>
                                {item.emoji}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider truncate">{item.name}</span>
                                <span className="text-[12px] text-slate-500 font-bold leading-none">{item.value} {item.value === 1 ? 'entry' : 'entries'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-on-surface-variant bg-slate-50 px-6 py-3 rounded-full">No mood trend data yet. Log your first check-in!</p>
                  </div>
                )}
              </div>
            </article>

            <article className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-h3 text-h3 text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">target</span>
                Focus Areas
              </h2>
              <p className="text-sm text-on-surface-variant mb-4">Set simple daily goals to build resilience.</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {PRESET_GOALS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoalForm({ title: preset.title, targetValue: preset.target })}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all active:scale-95"
                  >
                    <span>{preset.icon}</span>
                    {preset.title}
                  </button>
                ))}
              </div>

              <form className="space-y-4 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100" onSubmit={handleGoalSubmit}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Goal Name</label>
                  <input 
                    className="w-full rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-sm p-3" 
                    onChange={(event) => setGoalForm((prev) => ({ ...prev, title: event.target.value }))} 
                    placeholder="What do you want to focus on?" 
                    required 
                    value={goalForm.title} 
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Target</label>
                    <input 
                      className="w-full rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-sm p-3" 
                      min={1} 
                      onChange={(event) => setGoalForm((prev) => ({ ...prev, targetValue: event.target.value }))} 
                      type="number" 
                      value={goalForm.targetValue} 
                    />
                  </div>
                  <button 
                    className="bg-primary text-on-primary h-[46px] px-6 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap" 
                    type="submit"
                  >
                    Add Goal
                  </button>
                </div>
              </form>
              
              {/* Goal Filters */}
              {wellnessGoals.length > 0 && (
                <div className="flex items-center gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button 
                    onClick={() => setGoalFilter('all')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${goalFilter === 'all' ? 'active-filter bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    All ({wellnessGoals.length})
                  </button>
                  <button 
                    onClick={() => setGoalFilter('active')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${goalFilter === 'active' ? 'active-filter bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    In Progress ({wellnessGoals.filter(g => g.current_value < g.target_value).length})
                  </button>
                  <button 
                    onClick={() => setGoalFilter('completed')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${goalFilter === 'completed' ? 'active-filter bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Completed ({wellnessGoals.filter(g => g.current_value >= g.target_value).length})
                  </button>
                </div>
              )}

              {wellnessGoals.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-on-surface-variant">No focus areas yet. Add your first one above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                          {wellnessGoals
                            .filter(goal => {
                              if (goalFilter === 'active') return goal.current_value < goal.target_value;
                              if (goalFilter === 'completed') return goal.current_value >= goal.target_value;
                              return true;
                            })
                            .map((goal) => {
                            const target = Math.max(1, Number(goal.target_value) || 1);
                            const current = Math.max(0, Number(goal.current_value) || 0);
                            const isCompleted = current >= target;
                            const isBinary = target === 1;
                            const isEditing = editingGoal?.id === goal.id;

                            if (isEditing) {
                              return (
                                <form key={goal.id} onSubmit={handleGoalEditSave} className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                                  <input 
                                    className="w-full rounded-xl border-slate-200 text-sm" 
                                    value={editingGoal.title} 
                                    onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
                                    required
                                  />
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="number" 
                                      className="w-20 rounded-xl border-slate-200 text-sm" 
                                      value={editingGoal.target_value}
                                      min={1}
                                      onChange={(e) => setEditingGoal({...editingGoal, target_value: e.target.value})}
                                    />
                                    <button type="submit" className="ml-auto bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold">Save</button>
                                    <button type="button" onClick={() => setEditingGoal(null)} className="text-slate-500 text-xs font-bold">Cancel</button>
                                  </div>
                                </form>
                              );
                            }

                            return (
                              <div key={goal.id} className={`group relative p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                                {/* Action Buttons (Visible on hover) */}
                                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                                  <button 
                                    onClick={() => setEditingGoal(goal)}
                                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button 
                                    onClick={() => confirmDelete(goal)}
                                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <button 
                                      onClick={() => handleGoalProgress(goal.id, isCompleted ? 0 : target)}
                                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                    >
                                      <span className="material-symbols-outlined text-[20px]">
                                        {isCompleted ? 'check' : 'circle'}
                                      </span>
                                    </button>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xl shrink-0">{getGoalIcon(goal.title)}</span>
                                      <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm truncate ${isCompleted ? 'text-primary' : 'text-slate-700'}`}>
                                          {goal.title}
                                        </span>
                                        {!isBinary && (
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            Progress: {current} / {target}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {!isBinary && (
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0 mr-12 group-hover:mr-16 transition-all">
                                      <button 
                                        onClick={() => handleGoalProgress(goal.id, Math.max(0, current - 1))}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm text-slate-500 transition-all active:scale-90"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                      </button>
                                      <button 
                                        onClick={() => handleGoalProgress(goal.id, Math.min(target, current + 1))}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm text-primary font-bold transition-all active:scale-90"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                                
                                {!isBinary && (
                                  <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all duration-500 ease-out" 
                                      style={{ width: `${Math.min(100, (current / target) * 100)}%` }} 
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
              )}
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
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Remove Focus Area?</h3>
            <p className="text-slate-500 text-center text-sm mb-8">
              Are you sure you want to delete <span className="font-bold text-slate-700">"{goalToDelete?.title}"</span>? This action cannot be undone.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleGoalDelete(goalToDelete.id)}
                className="w-full bg-red-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98]"
              >
                Yes, Delete Goal
              </button>
              <button 
                onClick={() => { setShowDeleteModal(false); setGoalToDelete(null); }}
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

export default DashboardPage;
