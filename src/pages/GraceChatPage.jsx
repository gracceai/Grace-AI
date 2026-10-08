import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { createGraceReply } from "../lib/graceCompanion";

const STORAGE_KEY = "graceai-open-chat";
const WELCOME = "How are you feeling?";
const STARTERS = [
  { icon: "waves", text: "I'm feeling overwhelmed" },
  { icon: "psychology_alt", text: "I feel anxious" },
  { icon: "bedtime", text: "I can't sleep" },
  { icon: "person", text: "I feel alone" },
  { icon: "work", text: "Work is a lot right now" },
  { icon: "chat_bubble", text: "I just need to talk" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const MAX_STORED_MESSAGES = 300;

function loadChat() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.messages;
    return Array.isArray(list) ? list.filter(isMessage) : [];
  } catch {
    return [];
  }
}

function saveChat(messages) {
  let kept = messages
    .slice(-MAX_STORED_MESSAGES)
    .map(({ id, role, text, support }) => (support ? { id, role, text, support } : { id, role, text }));

  while (true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, messages: kept }));
      return true;
    } catch {
      if (kept.length <= 10) return false;
      kept = kept.slice(Math.floor(kept.length / 2));
    }
  }
}

function isMessage(message) {
  return message && (message.role === "user" || message.role === "grace") && typeof message.text === "string";
}

function latestSupportId(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "grace" && messages[index].support) return messages[index].id;
  }
  return null;
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `grace-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function GraceMark({ className = "h-8 w-8" }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}>
      <img alt="" className="h-[152%] w-[152%] max-w-none" src="/favicon.png" />
    </span>
  );
}

function GraceChatPage() {
  const inputId = useId();
  const stageRef = useRef(null);
  const stored = useRef(loadChat());
  const [messages, setMessages] = useState(stored.current);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  const generation = useRef(0);
  const stickToBottom = useRef(true);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Grace — a place to talk";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const viewport = window.visualViewport;
    if (!stage || !viewport) return undefined;

    const sync = () => {
      stage.style.height = `${viewport.height}px`;
    };

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => saveChat(messages), 250);
    const flush = () => saveChat(messagesRef.current);
    window.addEventListener("pagehide", flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
    };
  }, [messages]);

  useEffect(() => {
    if (stickToBottom.current) scrollToLatest();
  }, [messages, thinking]);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const scrollToLatest = (smooth = true) => {
    const scroller = threadRef.current;
    if (!scroller) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" });
  };

  const onThreadScroll = (event) => {
    const el = event.currentTarget;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickToBottom.current = near;
    setAtBottom(near);
  };

  useEffect(() => {
    let cancelled = false;
    const initial = messagesRef.current;
    if (initial.at(-1)?.role !== "user") return undefined;

    const turn = generation.current + 1;
    generation.current = turn;
    respond(initial, () => cancelled || generation.current !== turn);

    return () => {
      cancelled = true;
    };
  }, []);

  const reveal = async (text, onUpdate, cancelled) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onUpdate(text);
      return;
    }

    const parts = text.split(/(\s+)/);
    let built = "";
    for (const part of parts) {
      if (cancelled()) return;
      built += part;
      onUpdate(built);
      if (part.trim()) await sleep(24);
    }
  };

  const respond = async (history, cancelled) => {
    setThinking(true);
    setBusy(true);
    try {
      const result = await createGraceReply(history);
      if (cancelled()) return;
      if (!result.text?.trim()) throw new Error("empty");
      const support = Boolean(result.support);

      const userId = [...history].reverse().find((message) => message.role === "user")?.id ?? makeId();
      const id = `reply-${userId}`;

      await reveal(
        result.text,
        (partial) => {
          if (cancelled()) return;
          setThinking(false);
          setMessages((current) => {
            if (current.some((message) => message.id === id)) {
              return current.map((message) =>
                message.id === id ? { ...message, text: partial } : message
              );
            }
            return [...current, support ? { id, role: "grace", text: partial, support } : { id, role: "grace", text: partial }];
          });
        },
        cancelled
      );
      if (!cancelled()) setThinking(false);
    } catch {
      if (cancelled()) return;
      setThinking(false);
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "grace",
          text: "I am still here. Say that once more, in any words you have.",
        },
      ]);
    } finally {
      if (!cancelled()) setBusy(false);
    }
  };

  const send = (value) => {
    const text = value.trim();
    if (!text || busy) return;

    const userMessage = { id: makeId(), role: "user", text: text.slice(0, 1500) };
    const history = [...messagesRef.current, userMessage];
    const turn = generation.current + 1;
    generation.current = turn;

    stickToBottom.current = true;
    setAtBottom(true);
    setMessages(history);
    setDraft("");
    setMenuOpen(false);
    if (inputRef.current) inputRef.current.style.height = "auto";
    respond(history, () => generation.current !== turn);
  };

  const clearChat = () => {
    generation.current += 1;
    setMessages([]);
    setDraft("");
    setThinking(false);
    setBusy(false);
    setConfirmClear(false);
    setMenuOpen(false);
    localStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const onDraftChange = (event) => {
    const field = event.target;
    setDraft(field.value);
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 160)}px`;
  };

  const started = messages.length > 0;
  const thread = [{ id: "welcome", role: "grace", text: WELCOME }, ...messages];
  const supportId = latestSupportId(messages);

  return (
    <div
      className="grace-chat-bg flex h-dvh flex-col overflow-hidden text-slate-900 dark:text-white"
      ref={stageRef}
    >
      <div className="hidden lg:block">
        <SiteHeader />
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col lg:pt-[84px]">
        <div className="relative z-20 flex items-center gap-1.5 border-b border-slate-200/70 bg-[#ffffff]/70 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl sm:gap-2 sm:px-4 lg:border-0 lg:bg-transparent lg:px-6 lg:py-3 lg:backdrop-blur-none dark:border-white/10 dark:bg-[#0d0914]/70 lg:dark:bg-transparent">
          <Link
            aria-label="Back to GraceAI home"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
            to="/"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Link>

          <span className="relative shrink-0">
            <GraceMark className="h-9 w-9 lg:h-10 lg:w-10" />
            <span
              className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#ffffff] dark:ring-[#0d0914] ${
                busy ? "animate-pulse" : ""
              }`}
            />
          </span>
          <div className="ml-1 min-w-0 flex-1">
            <p className="font-plus-jakarta text-[15px] font-bold leading-tight text-slate-950 dark:text-white">Grace</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {thinking ? "Writing…" : busy ? "Listening" : "Here with you · private"}
            </p>
          </div>

          {started && (
            <button
              aria-label="New chat"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-primary sm:border sm:border-slate-200/80 sm:bg-[#ffffff] sm:px-3.5 sm:shadow-sm dark:text-slate-300 dark:hover:bg-white/10 sm:dark:border-white/10 sm:dark:bg-white/5"
              onClick={() => {
                setMenuOpen(true);
                setConfirmClear(true);
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">edit_square</span>
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}

          <button
            aria-expanded={menuOpen}
            aria-label="Chat options"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            onClick={() => {
              setMenuOpen((open) => !open);
              setConfirmClear(false);
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">more_vert</span>
          </button>

          {menuOpen && (
            <>
              <button
                aria-label="Close chat options"
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setMenuOpen(false)}
                type="button"
              />
              <div className="grace-pop absolute right-2 top-full z-30 mt-1 w-[min(18rem,calc(100vw-1rem))] rounded-2xl border border-slate-200 bg-[#ffffff] p-2 text-left shadow-xl sm:right-4 lg:right-6 dark:border-white/10 dark:bg-[#14101c]">
                {confirmClear ? (
                  <div className="p-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Start a new chat?</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      This conversation only lives on this device and will be cleared for good.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="min-h-10 flex-1 rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200"
                        onClick={() => setMenuOpen(false)}
                        type="button"
                      >
                        Keep it
                      </button>
                      <button
                        className="min-h-10 flex-1 rounded-full bg-primary px-3 text-xs font-bold text-white hover:bg-primary-container"
                        onClick={clearChat}
                        type="button"
                      >
                        Clear & start
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {started && (
                      <MenuItem icon="edit_square" onClick={() => setConfirmClear(true)}>
                        New chat
                      </MenuItem>
                    )}
                    <MenuItem as={Link} icon="health_and_safety" iconClass="text-red-600" to="/crisis-support">
                      Crisis support
                    </MenuItem>
                    <MenuItem as={Link} icon="shield_lock" to="/privacy-policy">
                      Privacy
                    </MenuItem>
                    <div className="lg:hidden">
                      <MenuItem icon={dark ? "light_mode" : "dark_mode"} onClick={toggleTheme}>
                        {dark ? "Light mode" : "Dark mode"}
                      </MenuItem>
                      <MenuItem as={Link} icon="home" to="/">
                        GraceAI home
                      </MenuItem>
                    </div>
                    <p className="mt-1 border-t border-slate-100 px-3 pb-1 pt-2.5 text-[11px] leading-5 text-slate-500 dark:border-white/10 dark:text-slate-400">
                      No account needed. This conversation is saved only on this device and picks up where you left off.
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative min-h-0 flex-1">
          {started ? (
            <div
              aria-live="polite"
              className="grace-scroll h-full overflow-y-auto overscroll-contain px-4 pb-6 pt-2 sm:px-6"
              onScroll={onThreadScroll}
              ref={threadRef}
            >
              <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Today
              </p>
              <div className="space-y-1.5">
                {thread.map((message, index) => {
                  const next = thread[index + 1];
                  const prev = thread[index - 1];
                  const lastInGroup = !next || next.role !== message.role;
                  const firstInGroup = !prev || prev.role !== message.role;
                  return (
                    <div className={firstInGroup && index > 0 ? "pt-3" : ""} key={message.id}>
                      {message.role === "user" ? (
                        <UserBubble last={lastInGroup} text={message.text} />
                      ) : (
                        <>
                          <GraceBubble last={lastInGroup && !(thinking && !next)} text={message.text} />
                          {message.id === supportId && <SupportContacts />}
                        </>
                      )}
                    </div>
                  );
                })}
                {thinking && (
                  <div className={thread.at(-1)?.role === "grace" ? "" : "pt-3"}>
                    <TypingBubble />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grace-scroll flex h-full flex-col overflow-y-auto px-4 py-6 sm:px-6">
              <div className="grace-rise m-auto w-full max-w-xl text-center">
                <div className="relative mx-auto h-20 w-20">
                  <span className="absolute inset-0 rounded-full bg-primary/20 blur-2xl dark:bg-[#d6baff]/25" />
                  <GraceMark className="relative h-20 w-20" />
                </div>
                <p className="mt-5 text-sm font-semibold text-primary/70 dark:text-primary-fixed/80">{greeting()}</p>
                <h1 className="mt-1 font-plus-jakarta text-[28px] font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl dark:text-white">
                  How are you feeling today?
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-[15px] dark:text-slate-400">
                  Say it in your own words, or start with one of these. No account, no judgement.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-2.5 text-left">
                  {STARTERS.map((starter, index) => (
                    <button
                      className="grace-rise group flex min-h-[3.25rem] items-center gap-2.5 text-left rounded-2xl border border-slate-200/80 bg-[#ffffff]/80 px-3 py-2.5 text-[13px] font-semibold leading-snug text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-[#ffffff] hover:text-primary hover:shadow-md active:translate-y-0 disabled:opacity-50 sm:px-4 sm:text-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
                      disabled={busy}
                      key={starter.text}
                      onClick={() => send(starter.text)}
                      style={{ animationDelay: `${80 + index * 40}ms` }}
                      type="button"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary transition group-hover:bg-primary group-hover:text-white dark:bg-white/10 dark:text-primary-fixed">
                        <span className="material-symbols-outlined text-[18px]">{starter.icon}</span>
                      </span>
                      {starter.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {started && !atBottom && (
            <button
              aria-label="Jump to latest message"
              className="grace-pop absolute inset-x-0 bottom-3 mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-[#ffffff] text-slate-700 shadow-lg transition hover:text-primary dark:border-white/10 dark:bg-[#1b1626] dark:text-slate-200"
              onClick={() => {
                stickToBottom.current = true;
                scrollToLatest();
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
            </button>
          )}
        </div>

        <div className="px-3 sm:px-6">
          <form
            className="grace-composer pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <div className="flex items-end gap-2 rounded-[26px] border border-slate-200/90 bg-[#ffffff] p-1.5 pl-4 shadow-[0_18px_44px_-30px_rgba(49,11,99,0.55)] transition focus-within:border-primary/30 focus-within:shadow-[0_18px_44px_-24px_rgba(49,11,99,0.5)] focus-within:ring-4 focus-within:ring-primary/[0.06] dark:border-white/10 dark:bg-[#15111d] dark:shadow-none dark:focus-within:border-[#d6baff]/30 dark:focus-within:ring-[#d6baff]/10">
              <label className="sr-only" htmlFor={inputId}>
                Message Grace
              </label>
              <textarea
                className="max-h-40 min-h-11 flex-1 resize-none border-0 bg-transparent py-2.5 text-base leading-6 shadow-none outline-none ring-0 focus:border-0 focus:ring-0"
                enterKeyHint="send"
                id={inputId}
                maxLength={1500}
                onChange={onDraftChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send(draft);
                  }
                }}
                placeholder={started ? "Reply to Grace…" : "I'm feeling…"}
                ref={inputRef}
                rows={1}
                value={draft}
              />
              <button
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/25 transition hover:bg-primary-container active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:bg-[#d6baff] dark:text-[#270057] dark:disabled:bg-white/10 dark:disabled:text-slate-500"
                disabled={busy || !draft.trim()}
                type="submit"
              >
                {thinking ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-[#270057]/30 dark:border-t-[#270057]" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                )}
              </button>
            </div>
            <p className="mt-2 px-2 text-center text-[11px] leading-4 text-slate-400 dark:text-slate-500">
              Grace is a companion, not a clinician or emergency service.
              <span className="hidden sm:inline"> · Shift + Enter for a new line</span>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

function MenuItem({ as: Component = "button", children, icon, iconClass = "text-primary dark:text-primary-fixed", ...props }) {
  return (
    <Component
      className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-white/5"
      type={Component === "button" ? "button" : undefined}
      {...props}
    >
      <span className={`material-symbols-outlined text-[19px] ${iconClass}`}>{icon}</span>
      {children}
    </Component>
  );
}

function GraceBubble({ text, last }) {
  if (!text) return null;
  return (
    <div className="grace-rise flex items-end gap-2.5">
      {last ? <GraceMark className="h-7 w-7" /> : <span className="w-7 shrink-0" />}
      <p
        className={`max-w-[min(82%,36rem)] whitespace-pre-wrap break-words rounded-[20px] border border-slate-200/70 bg-[#ffffff] px-4 py-2.5 text-left text-[15px] leading-relaxed text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.07] dark:text-slate-100 ${
          last ? "rounded-bl-md" : ""
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function UserBubble({ text, last }) {
  return (
    <div className="grace-rise flex justify-end pl-10">
      <p
        className={`max-w-[min(82%,36rem)] whitespace-pre-wrap break-words rounded-[20px] bg-primary px-4 py-2.5 text-left text-[15px] leading-relaxed text-white shadow-sm shadow-primary/20 dark:bg-[#d6baff] dark:text-[#270057] dark:shadow-none ${
          last ? "rounded-br-md" : ""
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function SupportContacts() {
  return (
    <div className="grace-rise ml-[2.375rem] mt-2 max-w-[min(82%,36rem)] rounded-2xl border border-rose-200/80 bg-[#fff7f8] p-3 text-left dark:border-rose-300/15 dark:bg-rose-950/30">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-900 dark:text-rose-100">
        <span className="material-symbols-outlined text-[16px] text-rose-500 dark:text-rose-300">favorite</span>
        If you ever want a person with you right now
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <a
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-rose-600 px-3 text-sm font-bold text-white transition hover:bg-rose-700"
          href="tel:10111"
        >
          <span className="material-symbols-outlined text-[17px]">call</span>
          10111
        </a>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-rose-200 bg-[#ffffff] px-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-300/20 dark:bg-transparent dark:text-rose-100 dark:hover:bg-white/5"
          to="/crisis-support"
        >
          More support
        </Link>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-rose-900/60 dark:text-rose-100/50">10111 is Namibia's emergency services line.</p>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="grace-rise flex items-end gap-2.5">
      <GraceMark className="h-7 w-7" />
      <div
        aria-hidden="true"
        className="flex h-10 items-center gap-1 rounded-[20px] rounded-bl-md border border-slate-200/70 bg-[#ffffff] px-4 dark:border-white/[0.08] dark:bg-white/[0.07]"
      >
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.2s] dark:bg-primary-fixed" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.1s] dark:bg-primary-fixed" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 dark:bg-primary-fixed" />
      </div>
      <span className="sr-only">Grace is writing</span>
    </div>
  );
}

export default GraceChatPage;
