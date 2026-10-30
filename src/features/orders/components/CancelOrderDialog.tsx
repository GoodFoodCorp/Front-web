import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { MAX_COMMENT_LENGTH, type CancellationReasonOption } from '../cancellation';

/** Asks why an order is cancelled before cancelling it (comment required
 *  for "Autre raison"). */
export function CancelOrderDialog({
  reasons,
  warning,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  reasons: CancellationReasonOption[];
  warning: string;
  pending: boolean;
  error?: string | null;
  onConfirm: (reason: string, comment: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const needsComment = reason === 'OTHER';
  const canSubmit = reason !== '' && (!needsComment || comment.trim().length >= 3) && !pending;

  return (
    <Modal title="Pourquoi annuler ?" maxWidth="max-w-md" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onConfirm(reason, comment.trim());
        }}
      >
        <fieldset className="space-y-2">
          <legend className="sr-only">Motif d’annulation</legend>
          {reasons.map((r) => (
            <label
              key={r.code}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${reason === r.code ? 'border-brand bg-brand-pale/50 font-semibold text-brand' : 'border-brand/10 text-neutral-700'}`}
            >
              <input type="radio" name="cancel-reason" checked={reason === r.code} onChange={() => setReason(r.code)} />
              {r.label}
            </label>
          ))}
        </fieldset>
        <div>
          <label htmlFor="cancel-comment" className="mb-1.5 block text-sm font-semibold text-neutral-700">
            {needsComment ? 'Précisez la raison' : 'Commentaire (facultatif)'}
          </label>
          <textarea
            id="cancel-comment"
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
            required={needsComment}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <p className="mt-1 text-right text-xs text-neutral-400">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>
        <p className="text-sm text-neutral-500">{warning}</p>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Retour
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {pending ? 'Annulation…' : 'Annuler la commande'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
