import { useEffect, useState } from "react";

const listenerMessage =
  "Hello. I'm here to listen. How are you feeling after today's walk near the dunes?";
const senderMessage = "It was peaceful, but I'm still feeling a bit overwhelmed with work.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function TypingChatCard() {
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
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setListenerTyped(listenerMessage);
        setSenderTyped(senderMessage);
        return;
      }

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
    <div className="relative w-full overflow-hidden rounded-[28px] border border-white/35 bg-white/[0.92] p-5 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-7 md:rounded-[32px] md:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="mb-7 flex items-center gap-3.5">
        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <img src="/graceaicompanionlogoicon.png" alt="GraceAI" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="font-plus-jakarta text-base font-bold text-slate-950">Grace Companion</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {typingStatus}
          </p>
        </div>
        <span className="material-symbols-outlined ml-auto text-[20px] text-slate-400">more_horiz</span>
      </div>

      <div className="min-h-[210px] space-y-4 sm:min-h-[230px]">
        <div className="max-w-[92%] rounded-[20px] rounded-tl-md bg-[#edf3f1] p-4 text-sm leading-6 text-[#294841] sm:max-w-[86%] sm:text-[15px]">
          {listenerTyped}
          {listenerTyping && <span className="chat-caret">▋</span>}
        </div>

        {hasSenderBubble && (
          <div className="ml-auto max-w-[92%] rounded-[20px] rounded-tr-md bg-primary p-4 text-sm font-medium leading-6 text-white shadow-lg shadow-primary/15 sm:max-w-[86%] sm:text-[15px]">
            {senderTyped}
            {senderTyping && <span className="chat-caret">▋</span>}
          </div>
        )}
      </div>

      <button
        className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-primary/20 hover:bg-white active:scale-[0.99]"
        onClick={() => window.open("https://wa.me/264836796445", "_blank", "noopener,noreferrer")}
        type="button"
      >
        <span className="material-symbols-outlined text-[21px] text-slate-400">add_circle</span>
        <span className="flex-grow text-sm text-slate-400">Message Grace...</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
          <span className="material-symbols-outlined text-[17px]">arrow_upward</span>
        </span>
      </button>
    </div>
  );
}

export default TypingChatCard;
