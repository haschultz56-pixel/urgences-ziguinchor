import { useRef, useState } from 'react';
import { Database, FileDown, FileUp, RotateCcw } from 'lucide-react';
import type { Translations } from '../data/translations';

interface Props {
  t: Translations;
  /** Admin: all contacts, import mode choice and reset. Otherwise: backup and restore of personal contacts only. */
  admin: boolean;
  onExport: () => Promise<number>;
  onImport: (file: File, merge: boolean) => Promise<number>;
  onReset: () => void;
}

export function DataMenu({ t, admin, onExport, onImport, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const merge = admin ? window.confirm(t.importMode) : true;
    try {
      const n = await onImport(file, merge);
      window.alert(`${t.importOk} (${n})`);
    } catch {
      window.alert(t.importError);
    }
    setOpen(false);
  };

  const item = 'flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700"
        aria-expanded={open}
      >
        <Database size={16} /> {t.data}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <button
            className={item}
            onClick={async () => {
              setOpen(false);
              if ((await onExport()) === 0) window.alert(t.noPersonal);
            }}
          >
            <FileDown size={16} /> {admin ? t.exportData : t.backupMine}
          </button>
          <button className={item} onClick={() => fileRef.current?.click()}>
            <FileUp size={16} /> {admin ? t.importData : t.restoreMine}
          </button>
          {admin && (
            <button
              className={`${item} text-red-700`}
              onClick={() => {
                if (window.confirm(t.confirmReset)) onReset();
                setOpen(false);
              }}
            >
              <RotateCcw size={16} /> {t.resetData}
            </button>
          )}
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>
      )}
    </div>
  );
}
