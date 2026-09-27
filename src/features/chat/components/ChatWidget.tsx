import { useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuthStore } from '../../../store/authStore';
import { useChatStore } from '../../../store/chatStore';
import { useCheckout } from '../../orders/hooks/useOrders';
import { formatPrice } from '../../../utils/format';
import { useChat } from '../hooks/useChat';
import type { ChatMessage } from '../types/chat.types';

const GREETING = "Bonjour ! Je suis l'assistant Good Food. Posez-moi une question sur votre commande, un menu, ou le service — je suis là pour vous aider.";

/** Floating support chat, bottom-right on every page. Only shown to logged-in
 *  customers: the assistant's value is answering about *their* orders. */
export function ChatWidget() {
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);
  const isOpen = useChatStore((s) => s.isOpen);
  const toggle = useChatStore((s) => s.toggle);
  const reset = useChatStore((s) => s.reset);
  const { messages, sendMessage, isPending } = useChat();
  const [draft, setDraft] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  const confirmingResetRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const resetClick = () => {
    if (messages.length === 0) return;
    // Guard on a ref, not the confirmingReset state: two clicks fired in
    // quick succession can both read the same stale state closure before
    // React re-renders, which would make the second click re-arm the
    // confirmation instead of actually resetting.
    if (!confirmingResetRef.current) {
      confirmingResetRef.current = true;
      setConfirmingReset(true);
      setTimeout(() => {
        confirmingResetRef.current = false;
        setConfirmingReset(false);
      }, 3000);
      return;
    }
    confirmingResetRef.current = false;
    setConfirmingReset(false);
    reset();
    setConfirmingReset(false);
  };

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
            <div className="flex items-center gap-1.5">
              {confirmingReset && <span className="text-xs text-white/80">Sûr ? Recliquez</span>}
              <button
                onClick={resetClick}
                aria-label="Réinitialiser la conversation"
                title="Réinitialiser la conversation"
                className={`grid h-7 w-7 place-items-center rounded-lg transition hover:bg-white/10 ${
                  confirmingReset ? 'text-accent' : 'text-white/80 hover:text-white'
                }`}
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={toggle}
                aria-label="Fermer le chat"
                className="grid h-7 w-7 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <ChatBubble role="assistant" content={GREETING} />
            {messages.map((m) => (
              <div key={m.id}>
                <ChatBubble role={m.role} content={m.content} />
                {m.proposal && m.proposalStatus === 'pending' && <OrderProposalCard message={m} />}
              </div>
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

/** The assistant only ever *proposes* an order (see assistant-service) — it
 *  is placed for real here, through the exact same checkout flow the cart
 *  uses, only once the customer clicks "Confirmer". */
function OrderProposalCard({ message }: { message: ChatMessage }) {
  const proposal = message.proposal;
  const setProposalStatus = useChatStore((s) => s.setProposalStatus);
  const addMessage = useChatStore((s) => s.addMessage);
  const checkout = useCheckout();
  if (!proposal) return null;

  const confirm = () => {
    checkout.mutate(
      {
        restaurant_id: proposal.restaurant_id,
        delivery_address: proposal.delivery_address,
        items: proposal.items.map((it) => ({
          menu_item_id: it.menu_item_id,
          menu_item_name: it.menu_item_name,
          quantity: it.quantity,
          unit_price_cents: it.unit_price_cents,
        })),
      },
      {
        onSuccess: (order) => {
          setProposalStatus(message.id, 'confirmed');
          addMessage({
            role: 'assistant',
            content: `Commande passée avec succès ! Numéro de commande #${order.id.slice(0, 8)}.`,
          });
        },
        onError: () => {
          addMessage({
            role: 'assistant',
            content: "Désolé, la commande n'a pas pu être passée. Réessayez depuis le panier ou dans un instant.",
          });
        },
      },
    );
  };

  const cancel = () => {
    setProposalStatus(message.id, 'cancelled');
    addMessage({ role: 'assistant', content: "D'accord, commande annulée." });
  };

  return (
    <div className="mt-1.5 space-y-2 rounded-2xl border border-brand/15 bg-white p-3">
      <ul className="space-y-1 text-sm">
        {proposal.items.map((it) => (
          <li key={it.menu_item_id} className="flex justify-between gap-2">
            <span>
              {it.quantity}× {it.menu_item_name}
            </span>
            <span className="shrink-0 text-neutral-500">{formatPrice(it.unit_price_cents * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t border-brand/10 pt-1.5 text-sm font-semibold text-brand">
        <span>Total</span>
        <span>{formatPrice(proposal.total_amount_cents)}</span>
      </div>
      {checkout.isError && <p className="text-xs text-red-600">{(checkout.error as Error).message}</p>}
      <div className="flex gap-2">
        <Button type="button" onClick={confirm} disabled={checkout.isPending} className="flex-1 py-1.5 text-xs">
          {checkout.isPending ? 'Commande en cours…' : 'Confirmer la commande'}
        </Button>
        <Button
          type="button"
          onClick={cancel}
          variant="ghost"
          disabled={checkout.isPending}
          className="flex-1 py-1.5 text-xs"
        >
          Annuler
        </Button>
      </div>
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
