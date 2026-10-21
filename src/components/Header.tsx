import { Download, WifiOff } from 'lucide-react';
import type { Lang } from '../types';
import type { Translations } from '../data/translations';

interface Props {
  t: Translations;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  online: boolean;
  canInstall: boolean;
  onInstall: () => void;
}

export function Header({ t, lang, onLangChange, online, canInstall, onInstall }: Props) {
  return (
    <header className="sticky top-0 z-20 bg-red-700 text-white shadow-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <img src="/icon.svg" alt="" className="h-10 w-10 rounded-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight">{t.appTitle}</h1>
          <p className="truncate text-xs text-red-100">{t.appSubtitle}</p>
        </div>
        {canInstall && (
          <button
            onClick={onInstall}
            className="flex items-center gap-1 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-red-900"
          >
            <Download size={16} /> {t.install}
          </button>
        )}
        <div className="flex overflow-hidden rounded-lg border border-red-300 text-sm font-semibold" role="group">
          {(['fr', 'wo'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              aria-pressed={lang === l}
              className={`px-2.5 py-1.5 uppercase ${lang === l ? 'bg-white text-red-700' : 'text-white'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {!online && (
        <div className="flex items-center justify-center gap-2 bg-slate-900 px-4 py-1.5 text-xs">
          <WifiOff size={14} /> {t.offline}
        </div>
      )}
    </header>
  );
}
