import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CONTACTS } from '../data/contacts';
import type { EmergencyContact } from '../types';

const STORAGE_KEY = 'uz.contacts.v1';
const SEEN_SEED_KEY = 'uz.seedIds.v1';

/** Appends seed contacts added since the last visit; seeds the user deleted are not restored. */
function withNewSeeds(stored: EmergencyContact[]): EmergencyContact[] {
  const seenRaw = localStorage.getItem(SEEN_SEED_KEY);
  const seen = new Set<string>(seenRaw ? JSON.parse(seenRaw) : stored.map((c) => c.id));
  const added = DEFAULT_CONTACTS.filter((c) => !seen.has(c.id) && !stored.some((s) => s.id === c.id));
  localStorage.setItem(SEEN_SEED_KEY, JSON.stringify(DEFAULT_CONTACTS.map((c) => c.id)));
  return added.length ? [...stored, ...structuredClone(added)] : stored;
}

function load(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return withNewSeeds(parsed);
    }
    localStorage.setItem(SEEN_SEED_KEY, JSON.stringify(DEFAULT_CONTACTS.map((c) => c.id)));
  } catch {
    // storage unavailable or corrupt — fall back to defaults
  }
  return structuredClone(DEFAULT_CONTACTS);
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** "+221 33 991 98 00" -> "+221339919800" ; "800 00 20 20" -> "800002020" */
export function toPhoneRaw(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

function isContact(c: unknown): c is EmergencyContact {
  const o = c as EmergencyContact;
  return !!o && typeof o.id === 'string' && typeof o.nameFr === 'string' && typeof o.category === 'string';
}

export function useContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // quota exceeded / private mode — data stays in memory
    }
  }, [contacts]);

  const save = useCallback((contact: EmergencyContact) => {
    const stamped = { ...contact, updatedAt: new Date().toISOString() };
    setContacts((prev) =>
      prev.some((c) => c.id === stamped.id)
        ? prev.map((c) => (c.id === stamped.id ? stamped : c))
        : [...prev, stamped],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const reset = useCallback(() => setContacts(structuredClone(DEFAULT_CONTACTS)), []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urgences-ziguinchor-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [contacts]);

  /** Returns number of imported contacts; throws on invalid file. */
  const importJson = useCallback(async (file: File, merge: boolean): Promise<number> => {
    const parsed: unknown = JSON.parse(await file.text());
    if (!Array.isArray(parsed) || !parsed.every(isContact)) throw new Error('invalid');
    setContacts((prev) => {
      if (!merge) return parsed;
      const byId = new Map(prev.map((c) => [c.id, c]));
      parsed.forEach((c) => byId.set(c.id, c));
      return [...byId.values()];
    });
    return parsed.length;
  }, []);

  return { contacts, save, remove, reset, exportJson, importJson };
}
