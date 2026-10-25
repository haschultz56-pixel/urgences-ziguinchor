import { useState, type ReactNode } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { CategoryId, Department, EmergencyContact, SecondaryPhone } from '../types';
import type { Translations } from '../data/translations';
import { CATEGORIES } from '../data/categories';
import { TAGS } from '../data/tags';
import { newId, toPhoneRaw } from '../hooks/useContacts';

interface Props {
  t: Translations;
  initial: EmergencyContact | null;
  onSave: (c: EmergencyContact) => void;
  onClose: () => void;
}

const empty = (): EmergencyContact => ({
  id: newId(),
  nameFr: '',
  nameWo: '',
  category: 'autre',
  phone: '',
  phoneRaw: '',
  isEmergency: false,
  is24_7: false,
  district: '',
  address: '',
  descriptionFr: '',
  descriptionWo: '',
  keywordsFr: [],
  keywordsWo: [],
  secondaryPhones: [],
  departments: [],
  verified: false,
});

const splitList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200';

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-xs font-semibold text-slate-600 ${className}`}>
      {label}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}

export function ContactForm({ t, initial, onSave, onClose }: Props) {
  const [c, setC] = useState<EmergencyContact>(() => structuredClone(initial ?? empty()));
  const [kwFr, setKwFr] = useState(c.keywordsFr.join(', '));
  const [kwWo, setKwWo] = useState(c.keywordsWo.join(', '));
  const [error, setError] = useState('');

  const set = <K extends keyof EmergencyContact>(key: K, value: EmergencyContact[K]) => setC((p) => ({ ...p, [key]: value }));

  const phones = c.secondaryPhones ?? [];
  const setPhone = (i: number, patch: Partial<SecondaryPhone>) =>
    set('secondaryPhones', phones.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const depts = c.departments ?? [];
  const setDept = (i: number, patch: Partial<Department>) =>
    set('departments', depts.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.nameFr.trim()) return setError('Le nom (français) est obligatoire.');
    if (!c.phone.trim() && !c.whatsapp?.trim() && !phones.some((p) => p.phone.trim()))
      return setError('Indiquez au moins un numéro.');

    onSave({
      ...c,
      nameFr: c.nameFr.trim(),
      nameWo: c.nameWo.trim(),
      phone: c.phone.trim(),
      phoneRaw: toPhoneRaw(c.phone),
      shortCode: c.shortCode?.trim() || undefined,
      emergencyPhone: c.emergencyPhone?.trim() || undefined,
      emergencyPhoneRaw: c.emergencyPhone?.trim() ? toPhoneRaw(c.emergencyPhone) : undefined,
      whatsapp: c.whatsapp?.trim() ? toPhoneRaw(c.whatsapp) : undefined,
      website: c.website?.trim() || undefined,
      contactPerson: c.contactPerson?.trim() || undefined,
      notes: c.notes?.trim() || undefined,
      keywordsFr: splitList(kwFr),
      keywordsWo: splitList(kwWo),
      secondaryPhones: phones
        .filter((p) => p.phone.trim())
        .map((p) => ({ ...p, phone: p.phone.trim(), phoneRaw: toPhoneRaw(p.phone) })),
      departments: depts
        .filter((d) => d.nameFr.trim())
        .map((d) => ({
          ...d,
          phone: d.phone?.trim() || undefined,
          phoneRaw: d.phone?.trim() ? toPhoneRaw(d.phone) : undefined,
          extension: d.extension?.trim() || undefined,
          contactPerson: d.contactPerson?.trim() || undefined,
          descriptionFr: d.descriptionFr?.trim() || undefined,
        })),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[95dvh] w-full max-w-2xl flex-col rounded-t-2xl bg-white sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">{initial ? t.editContact : t.newContact}</h2>
          <button type="button" onClick={onClose} aria-label={t.cancel} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto px-4 py-4 sm:grid-cols-2">
          <Field label="Nom (français) *">
            <input className={input} value={c.nameFr} onChange={(e) => set('nameFr', e.target.value)} required />
          </Field>
          <Field label="Nom (wolof)">
            <input className={input} value={c.nameWo} onChange={(e) => set('nameWo', e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <select className={input} value={c.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.labelFr}</option>
              ))}
            </select>
          </Field>
          <Field label="Téléphone principal">
            <input className={input} type="tel" inputMode="tel" placeholder="+221 33 ..." value={c.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Numéro court (ex. 18)">
            <input className={input} value={c.shortCode ?? ''} onChange={(e) => set('shortCode', e.target.value)} />
          </Field>
          <Field label="Téléphone du service d’urgence">
            <input className={input} type="tel" inputMode="tel" placeholder="+221 77 ..." value={c.emergencyPhone ?? ''} onChange={(e) => set('emergencyPhone', e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <input className={input} type="tel" inputMode="tel" placeholder="+221 77 ..." value={c.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} />
          </Field>
          <Field label="Interlocuteur / personne de contact">
            <input className={input} value={c.contactPerson ?? ''} onChange={(e) => set('contactPerson', e.target.value)} />
          </Field>
          <Field label="Site web">
            <input className={input} type="url" placeholder="https://" value={c.website ?? ''} onChange={(e) => set('website', e.target.value)} />
          </Field>
          <Field label="Visites à domicile">
            <select
              className={input}
              value={c.homeVisits === undefined ? '' : c.homeVisits ? 'oui' : 'non'}
              onChange={(e) => set('homeVisits', e.target.value === '' ? undefined : e.target.value === 'oui')}
            >
              <option value="">Inconnu</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </Field>
          <Field label="Quartier">
            <input className={input} value={c.district} onChange={(e) => set('district', e.target.value)} />
          </Field>
          <Field label="Adresse">
            <input className={input} value={c.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field label="Description (français)" className="sm:col-span-2">
            <textarea className={input} rows={2} value={c.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} />
          </Field>
          <Field label="Description (wolof)" className="sm:col-span-2">
            <textarea className={input} rows={2} value={c.descriptionWo} onChange={(e) => set('descriptionWo', e.target.value)} />
          </Field>
          <Field label="Remarques (sources, points à vérifier)" className="sm:col-span-2">
            <textarea className={input} rows={2} value={c.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
          </Field>
          <Field label="Mots-clés FR (séparés par des virgules)">
            <input className={input} value={kwFr} onChange={(e) => setKwFr(e.target.value)} />
          </Field>
          <Field label="Mots-clés WO (séparés par des virgules)">
            <input className={input} value={kwWo} onChange={(e) => setKwWo(e.target.value)} />
          </Field>

          <div className="flex flex-wrap gap-4 sm:col-span-2">
            {([
              ['isEmergency', 'Urgence vitale'],
              ['is24_7', 'Ouvert 24h/24'],
              ['verified', 'Numéro vérifié'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" className="h-5 w-5 accent-red-600" checked={!!c[key]} onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <span className="text-sm font-bold">Domaines de soins :</span>
            {TAGS.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-pink-600"
                  checked={!!c.tags?.includes(tag.id)}
                  onChange={(e) =>
                    set('tags', e.target.checked ? [...(c.tags ?? []), tag.id] : (c.tags ?? []).filter((id) => id !== tag.id))
                  }
                />
                {tag.labelFr}
              </label>
            ))}
          </div>

          {/* Numéros secondaires */}
          <fieldset className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
            <legend className="px-1 text-sm font-bold">Autres numéros</legend>
            {phones.map((p, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                <input className={input} placeholder="Libellé FR" value={p.labelFr} onChange={(e) => setPhone(i, { labelFr: e.target.value })} />
                <input className={input} placeholder="Libellé WO" value={p.labelWo} onChange={(e) => setPhone(i, { labelWo: e.target.value })} />
                <input className={input} type="tel" placeholder="Numéro" value={p.phone} onChange={(e) => setPhone(i, { phone: e.target.value })} />
                <button type="button" onClick={() => set('secondaryPhones', phones.filter((_, j) => j !== i))} className="p-2 text-slate-500 hover:text-red-700" aria-label={t.delete}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('secondaryPhones', [...phones, { labelFr: '', labelWo: '', phone: '', phoneRaw: '' }])}
              className="flex items-center gap-1 text-sm font-semibold text-red-700"
            >
              <Plus size={16} /> Ajouter un numéro
            </button>
          </fieldset>

          {/* Services / départements */}
          <fieldset className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
            <legend className="px-1 text-sm font-bold">Services (départements)</legend>
            {depts.map((d, i) => (
              <div key={d.id} className="mb-3 grid grid-cols-2 gap-2 border-b border-slate-100 pb-3">
                <input className={input} placeholder="Nom FR *" value={d.nameFr} onChange={(e) => setDept(i, { nameFr: e.target.value })} />
                <input className={input} placeholder="Nom WO" value={d.nameWo} onChange={(e) => setDept(i, { nameWo: e.target.value })} />
                <input className={input} type="tel" placeholder="Téléphone" value={d.phone ?? ''} onChange={(e) => setDept(i, { phone: e.target.value })} />
                <input className={input} placeholder="Poste / extension" value={d.extension ?? ''} onChange={(e) => setDept(i, { extension: e.target.value })} />
                <input className={input} placeholder="Interlocuteur" value={d.contactPerson ?? ''} onChange={(e) => setDept(i, { contactPerson: e.target.value })} />
                <div className="flex gap-2">
                  <input className={input} placeholder="Description" value={d.descriptionFr ?? ''} onChange={(e) => setDept(i, { descriptionFr: e.target.value })} />
                  <button type="button" onClick={() => set('departments', depts.filter((_, j) => j !== i))} className="p-2 text-slate-500 hover:text-red-700" aria-label={t.delete}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('departments', [...depts, { id: newId(), nameFr: '', nameWo: '' }])}
              className="flex items-center gap-1 text-sm font-semibold text-red-700"
            >
              <Plus size={16} /> Ajouter un service
            </button>
          </fieldset>
        </div>

        {error && <p className="px-4 pb-2 text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100">
            {t.cancel}
          </button>
          <button type="submit" className="rounded-xl bg-red-700 px-5 py-2.5 font-bold text-white hover:bg-red-800">
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}
