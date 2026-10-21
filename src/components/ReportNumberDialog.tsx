import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import type { EmergencyContact } from '../types';
import type { Translations } from '../data/translations';

/** WhatsApp number that receives correction reports (international format, digits only) */
export const REPORT_WHATSAPP = '221784310251';

export interface ReportTarget {
  /** Which number is reported, e.g. « Principal », a secondary label or a department name */
  label: string;
  phone: string;
}

interface Props {
  contact: EmergencyContact;
  target: ReportTarget;
  t: Translations;
  onClose: () => void;
}

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200';

export function ReportNumberDialog({ contact: c, target, t, onClose }: Props) {
  const [correct, setCorrect] = useState('');
  const [comment, setComment] = useState('');

  // The message is always in French so that the reports read the same for the maintainer.
  const message = [
    'Urgences Ziguinchor — Correction de numéro',
    `Contact : ${c.nameFr} (id : ${c.id})`,
    `Numéro concerné : ${target.label} — ${target.phone || 'aucun numéro'}`,
    `Numéro correct : ${correct.trim() || '—'}`,
    comment.trim() && `Remarque : ${comment.trim()}`,
  ]
    .filter(Boolean)
    .join('\n');
  const href = `https://wa.me/${REPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  const canSend = correct.trim() !== '' || comment.trim() !== '';

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">{target.phone ? t.reportTitle : t.suggestTitle}</h2>
          <button type="button" onClick={onClose} aria-label={t.cancel} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="text-sm text-slate-600">{t.reportIntro}</p>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <p className="font-semibold text-slate-900">{c.nameFr}</p>
            <p className="text-slate-600">
              {target.label} : {target.phone || '—'}
            </p>
          </div>
          <label className="block text-sm font-medium">
            {t.reportCorrect}
            <input
              className={`${input} mt-1`}
              type="tel"
              inputMode="tel"
              placeholder="+221 ..."
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              autoFocus
            />
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
      </div>
    </div>
  );
}
