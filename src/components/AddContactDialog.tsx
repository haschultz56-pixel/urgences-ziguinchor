import { useState } from 'react';
import { MessageCircle, Send, UserPlus, X } from 'lucide-react';
import type { Translations } from '../data/translations';
import { REPORT_WHATSAPP } from './ReportNumberDialog';

interface Props {
  t: Translations;
  /** Opens the contact form for a personal contact, stored on this device only */
  onAddPersonal: () => void;
  onClose: () => void;
}

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200';

/** First asks whether the contact is personal or a suggestion for everyone, then shows the suggestion form. */
export function AddContactDialog({ t, onAddPersonal, onClose }: Props) {
  const [suggesting, setSuggesting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [place, setPlace] = useState('');
  const [comment, setComment] = useState('');

  // The message is always in French so that the suggestions read the same for the maintainer.
  const message = [
    'Urgences Ziguinchor — Nouveau contact proposé',
    `Nom : ${name.trim()}`,
    `Numéro : ${phone.trim() || '—'}`,
    `Quartier / adresse : ${place.trim() || '—'}`,
    comment.trim() && `Remarque : ${comment.trim()}`,
  ]
    .filter(Boolean)
    .join('\n');
  const href = `https://wa.me/${REPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  const canSend = name.trim() !== '';

  const choice = 'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left';

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">{suggesting ? t.suggestContact : t.addTitle}</h2>
          <button type="button" onClick={onClose} aria-label={t.cancel} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {!suggesting ? (
          <div className="space-y-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={onAddPersonal} className={`${choice} border-slate-300 hover:bg-slate-50`}>
              <UserPlus size={22} className="mt-0.5 shrink-0 text-slate-700" />
              <span>
                <span className="block font-bold text-slate-900">{t.addPersonal}</span>
                <span className="block text-sm text-slate-600">{t.addPersonalHint}</span>
              </span>
            </button>
            <button type="button" onClick={() => setSuggesting(true)} className={`${choice} border-green-300 hover:bg-green-50`}>
              <Send size={22} className="mt-0.5 shrink-0 text-green-700" />
              <span>
                <span className="block font-bold text-slate-900">{t.suggestContact}</span>
                <span className="block text-sm text-slate-600">{t.suggestContactHint}</span>
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm text-slate-600">{t.suggestContactHint}</p>
              <label className="block text-sm font-medium">
                {t.suggestName} *
                <input className={`${input} mt-1`} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </label>
              <label className="block text-sm font-medium">
                {t.suggestPhone}
                <input
                  className={`${input} mt-1`}
                  type="tel"
                  inputMode="tel"
                  placeholder="+221 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium">
                {t.suggestPlace}
                <input className={`${input} mt-1`} value={place} onChange={(e) => setPlace(e.target.value)} />
              </label>
              <label className="block text-sm font-medium">
                {t.reportComment}
                <textarea className={`${input} mt-1`} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100">
                {t.cancel}
              </button>
              <a
                href={canSend ? href : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => (canSend ? onClose() : e.preventDefault())}
                aria-disabled={!canSend}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white ${canSend ? 'bg-green-600 hover:bg-green-700' : 'cursor-not-allowed bg-slate-300'}`}
              >
                <MessageCircle size={18} /> {t.reportSend}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
