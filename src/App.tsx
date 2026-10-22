import { useEffect, useMemo, useState } from 'react';
import { Flame, KeyRound, Plus, Search, ShieldCheck, Siren, UserRound, X } from 'lucide-react';
import type { CategoryId, EmergencyContact, Lang, TagId } from './types';
import { TRANSLATIONS } from './data/translations';
import { CATEGORIES } from './data/categories';
import { TAGS, tagById } from './data/tags';
import { isOfficial, useContacts } from './hooks/useContacts';
import { useAdminMode } from './hooks/useAdminMode';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { ContactCard } from './components/ContactCard';
import { ContactForm } from './components/ContactForm';
import { DataMenu } from './components/DataMenu';
import { AddContactDialog } from './components/AddContactDialog';

const LANG_KEY = 'uz.lang';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function haystack(c: EmergencyContact): string {
  return normalize(
    [
      c.nameFr, c.nameWo, c.district, c.address, c.descriptionFr, c.descriptionWo, c.phone, c.shortCode, c.contactPerson,
      ...c.keywordsFr, ...c.keywordsWo,
      ...(c.tags ?? []).flatMap((id) => [tagById(id)?.labelFr, tagById(id)?.labelWo]),
      ...(c.secondaryPhones ?? []).flatMap((p) => [p.labelFr, p.labelWo, p.phone]),
      ...(c.departments ?? []).flatMap((d) => [d.nameFr, d.nameWo, d.contactPerson, d.phone]),
    ].filter(Boolean).join(' '),
  );
}

const SOS = [
  { label: 'SAMU', number: '1515', icon: Siren },
  { label: 'Police', number: '17', icon: ShieldCheck },
  { label: 'Pompiers', number: '18', icon: Flame },
];

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem(LANG_KEY) === 'wo' ? 'wo' : 'fr';
    } catch {
      return 'fr';
    }
  });
  const t = TRANSLATIONS[lang];
  const { admin, exitAdmin } = useAdminMode();
  const { contacts, save, remove, reset, exportJson, importJson } = useContacts(admin);
  const online = useOnlineStatus();
  const { canInstall, showIOSHint, install } = usePWAInstall();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all' | 'mine'>('all');
  const [tag, setTag] = useState<TagId | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null | undefined>(undefined); // undefined = form closed, null = new
  const [adding, setAdding] = useState(false);
  const hasPersonal = contacts.some((c) => !isOfficial(c));

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const filtered = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return contacts
      .filter((c) => category === 'all' || (category === 'mine' ? !isOfficial(c) : c.category === category))
      .filter((c) => !tag || !!c.tags?.includes(tag))
      .filter((c) => !emergencyOnly || c.isEmergency)
      .filter((c) => {
        if (!terms.length) return true;
        const h = haystack(c);
        return terms.every((term) => h.includes(term));
      })
      .sort((a, b) => Number(b.isEmergency) - Number(a.isEmergency) || a.nameFr.localeCompare(b.nameFr, 'fr'));
  }, [contacts, query, category, tag, emergencyOnly]);

  const handleDelete = (c: EmergencyContact) => {
    if (window.confirm(`${t.confirmDelete}\n\n${c.nameFr}`)) remove(c.id);
  };

  return (
    <div className="min-h-dvh bg-slate-50 pb-24">
      <Header t={t} lang={lang} onLangChange={setLang} online={online} canInstall={canInstall} onInstall={install} />

      <main className="mx-auto max-w-3xl px-4">
        {/* Appel d'urgence rapide */}
        <section className="mt-4 rounded-2xl bg-red-50 p-3">
          <p className="mb-2 text-sm font-bold text-red-800">{t.sosBanner}</p>
          <div className="grid grid-cols-3 gap-2">
            {SOS.map(({ label, number, icon: Icon }) => (
              <a key={number} href={`tel:${number}`} className="flex flex-col items-center rounded-xl bg-red-600 py-3 text-white shadow active:bg-red-800">
                <Icon size={22} />
                <span className="text-xl font-black leading-tight">{number}</span>
                <span className="text-[11px] font-semibold uppercase">{label}</span>
              </a>
            ))}
          </div>
        </section>

        {admin && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-900 p-3 text-xs text-white">
            <KeyRound size={16} className="shrink-0" />
            <span className="flex-1">{t.adminMode}</span>
            <button onClick={exitAdmin} className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-900">
              {t.adminExit}
            </button>
          </div>
        )}

        {showIOSHint && <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-blue-900">{t.iosInstall}</p>}

        {/* Recherche */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400" aria-label="clear">
                <X size={16} />
              </button>
            )}
          </div>
          <DataMenu t={t} admin={admin} onExport={exportJson} onImport={importJson} onReset={reset} />
        </div>

        {/* Filtres par catégorie */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory('all')}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}
          >
            {t.all}
          </button>
          {(hasPersonal || category === 'mine') && (
            <button
              onClick={() => setCategory('mine')}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${category === 'mine' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'}`}
            >
              <UserRound size={12} /> {t.myContacts}
            </button>
          )}
          {CATEGORIES.map(({ id, labelFr, labelWo, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${category === id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}
            >
              <Icon size={12} /> {lang === 'fr' ? labelFr : labelWo}
            </button>
          ))}
        </div>

        {/* Filtres par domaine de soins (tags) */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">{t.careFields} :</span>
          {TAGS.map(({ id, labelFr, labelWo, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTag((cur) => (cur === id ? null : id))}
              aria-pressed={tag === id}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tag === id ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-800 ring-1 ring-pink-200'}`}
            >
              <Icon size={12} /> {lang === 'fr' ? labelFr : labelWo}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>{t.count(filtered.length)}</span>
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" className="h-4 w-4 accent-red-600" checked={emergencyOnly} onChange={(e) => setEmergencyOnly(e.target.checked)} />
            {t.emergencyOnly}
          </label>
        </div>

        <div className="mt-3 space-y-3">
          {filtered.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              lang={lang}
              t={t}
              personal={!isOfficial(c)}
              canEdit={admin || !isOfficial(c)}
              onEdit={() => setEditing(c)}
              onDelete={() => handleDelete(c)}
            />
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-slate-500">{t.noResults}</p>}
        </div>
      </main>

      <button
        onClick={() => (admin ? setEditing(null) : setAdding(true))}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 flex items-center gap-2 rounded-full bg-red-700 px-5 py-4 font-bold text-white shadow-lg active:bg-red-900"
      >
        <Plus size={20} /> {t.add}
      </button>

      {adding && (
        <AddContactDialog
          t={t}
          onAddPersonal={() => {
            setAdding(false);
            setEditing(null);
          }}
          onClose={() => setAdding(false)}
        />
      )}

      {editing !== undefined && (
        <ContactForm
          t={t}
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSave={(c) => {
            save(c);
            setEditing(undefined);
          }}
        />
      )}
    </div>
  );
}
