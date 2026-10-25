import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Globe, House, MapPin, MessageCircle, MessageSquareWarning, Pencil, Phone, Siren, Trash2, User, UserRound, AlertTriangle } from 'lucide-react';
import type { EmergencyContact, Lang } from '../types';
import type { Translations } from '../data/translations';
import { categoryById } from '../data/categories';
import { tagById } from '../data/tags';
import { ReportNumberDialog, type ReportTarget } from './ReportNumberDialog';

interface Props {
  contact: EmergencyContact;
  lang: Lang;
  t: Translations;
  /** The user's own contact, stored on this device only: no "unverified" badge, no report button */
  personal: boolean;
  /** Edit and delete buttons: personal contacts, or every contact in admin mode */
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const waLink = (num: string) => `https://wa.me/${num.replace(/\D/g, '')}`;

export function ContactCard({ contact: c, lang, t, personal, canEdit, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<ReportTarget | null>(null);
  const cat = categoryById(c.category);
  const Icon = cat.icon;
  const name = lang === 'fr' ? c.nameFr : c.nameWo || c.nameFr;
  const description = lang === 'fr' ? c.descriptionFr : c.descriptionWo || c.descriptionFr;
  const location = [c.address, c.district].filter(Boolean).join(' — ');

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm ${c.isEmergency ? 'border-red-300' : 'border-slate-200'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cat.color}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-snug text-slate-900">{name}</h2>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            {c.isEmergency && <span className="rounded bg-red-600 px-1.5 py-0.5 text-white">{t.emergency}</span>}
            {c.is24_7 && (
              <span className="flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-white">
                <Clock size={11} /> {t.open24}
              </span>
            )}
            {c.tags?.map((id) => {
              const tag = tagById(id);
              if (!tag) return null;
              const TagIcon = tag.icon;
              return (
                <span key={id} className="flex items-center gap-0.5 rounded bg-pink-100 px-1.5 py-0.5 text-pink-800">
                  <TagIcon size={11} /> {lang === 'fr' ? tag.labelFr : tag.labelWo}
                </span>
              );
            })}
            {c.homeVisits !== undefined && (
              <span
                className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 ${c.homeVisits ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
              >
                <House size={11} /> {c.homeVisits ? t.homeVisitsYes : t.homeVisitsNo}
              </span>
            )}
            {personal && (
              <span className="flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">
                <UserRound size={11} /> {t.myContact}
              </span>
            )}
            {!personal && !c.verified && (
              <span className="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                <AlertTriangle size={11} /> {t.unverified}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1">
            <button onClick={onEdit} aria-label={t.edit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Pencil size={18} />
            </button>
            <button onClick={onDelete} aria-label={t.delete} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      {location && (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} /> {location}
        </p>
      )}
      {c.contactPerson && (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <User size={13} /> {t.contactPerson} : {c.contactPerson}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {c.phoneRaw ? (
          <>
            <a
              href={`tel:${c.phoneRaw}`}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold ${cat.callButton}`}
            >
              <Phone size={18} /> {t.call} {c.phone}
            </a>
            {!personal && (
              <button
                type="button"
                onClick={() => setReport({ label: 'Numéro principal', phone: c.phone })}
                aria-label={t.reportNumber}
                title={t.reportNumber}
                className="shrink-0 rounded-xl border border-amber-200 px-3 text-amber-600 hover:bg-amber-50"
              >
                <MessageSquareWarning size={20} />
              </button>
            )}
          </>
        ) : (
          !personal && (
            <button
              type="button"
              onClick={() => setReport({ label: 'Numéro principal', phone: '' })}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              <MessageSquareWarning size={18} /> {t.suggestNumber}
            </button>
          )
        )}
        {c.whatsapp && (
          <a
            href={waLink(c.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white"
          >
            <MessageCircle size={18} /> {t.whatsapp}
          </a>
        )}
      </div>

      {c.emergencyPhoneRaw && (
        <a
          href={`tel:${c.emergencyPhoneRaw}`}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white active:bg-red-800"
        >
          <Siren size={18} /> {t.emergencyService} {c.emergencyPhone}
        </a>
      )}

      {c.secondaryPhones && c.secondaryPhones.length > 0 && (
        <ul className="mt-2 space-y-1">
          {c.secondaryPhones.map((p, i) => (
            <li key={i}>
              <a href={`tel:${p.phoneRaw}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-600">{(lang === 'fr' ? p.labelFr : p.labelWo) || p.labelFr}</span>
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <Phone size={14} /> {p.phone}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {c.website && (
        <a href={c.website} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-sm text-blue-700 underline">
          <Globe size={14} /> {t.website}
        </a>
      )}

      {c.notes && (
        <p className="mt-2 whitespace-pre-line rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{c.notes}</p>
      )}

      {c.departments && c.departments.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between py-1 text-sm font-semibold text-slate-700"
            aria-expanded={open}
          >
            {open ? t.hideDepartments : t.showDepartments} ({c.departments.length})
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {open && (
            <ul className="mt-1 space-y-1.5">
              {c.departments.map((d) => (
                <li key={d.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{(lang === 'fr' ? d.nameFr : d.nameWo) || d.nameFr}</span>
                    {d.phoneRaw ? (
                      <a href={`tel:${d.phoneRaw}${d.extension ? `,${d.extension}` : ''}`} className="flex shrink-0 items-center gap-1 font-semibold text-emerald-700">
                        <Phone size={14} /> {d.phone}
                        {d.extension && ` (${d.extension})`}
                      </a>
                    ) : (
                      d.extension && <span className="shrink-0 text-slate-500">Poste {d.extension}</span>
                    )}
                  </div>
                  {d.descriptionFr && <p className="text-xs text-slate-500">{d.descriptionFr}</p>}
                  {d.contactPerson && (
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <User size={12} /> {d.contactPerson}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {report && <ReportNumberDialog contact={c} target={report} t={t} onClose={() => setReport(null)} />}
    </article>
  );
}
