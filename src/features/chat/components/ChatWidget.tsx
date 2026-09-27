import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { useChat } from '../hooks/useChat';

const GREETING = "Bonjour ! Je suis l'assistant Good Food. Posez-moi une question sur votre commande, un menu, ou le service — je suis là pour vous aider.";

/** Floating support chat, bottom-right on every page. Only shown to logged-in
 *  customers: the assistant's value is answering about *their* orders. */
export function ChatWidget() {
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);
  const isOpen = useChatStore((s) => s.isOpen);
  const toggle = useChatStore((s) => s.toggle);
  const { messages, sendMessage, isPending } = useChat();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [isOpen, messages, isPending]);

  if (!isLoggedIn) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || isPending) return;
    sendMessage(draft);
    setDraft('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between bg-brand px-4 py-3">
            <p className="font-display font-bold text-white">Assistant Good Food</p>
            <button
              onClick={toggle}
              aria-label="Fermer le chat"
              className="grid h-7 w-7 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <ChatBubble role="assistant" content={GREETING} />
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}
            {isPending && <TypingIndicator />}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-brand/10 p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Écrivez votre message…"
              className="flex-1"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !draft.trim()} className="shrink-0 px-3">
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={toggle}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
        className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-[var(--shadow-lift)] transition active:scale-95 hover:bg-brand-dark"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

/** "L'assistant écrit…" — three dots bouncing in sequence. */
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-brand-pale px-4 py-3">
        {[0, 150, 300].map((delayMs) => (
          <span
            key={delayMs}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand/50"
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
          isUser ? 'bg-brand text-white' : 'bg-brand-pale text-neutral-700'
        }`}
      >
        {content}
      </p>
    </div>
  );
}
