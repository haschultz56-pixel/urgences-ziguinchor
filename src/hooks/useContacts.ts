import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CONTACTS } from '../data/contacts';
import type { EmergencyContact } from '../types';

const STORAGE_KEY = 'uz.contacts.v1';
const SEEN_SEED_KEY = 'uz.seedIds.v1';

const SEED_IDS = new Set(DEFAULT_CONTACTS.map((c) => c.id));

/** Official contacts come from the seed; all others are the user's own, kept on this device only. */
export const isOfficial = (c: EmergencyContact): boolean => SEED_IDS.has(c.id);

/** Ids once in the seed and since removed, for devices that no longer remember having seen them. */
const RETIRED_SEED_IDS = ['urgence-hopital-paix', 'urgence-hopital-regional'];

/** Seed ids seen on this device before this visit, plus retired ones (null if unknown). */
function readSeenSeeds(): Set<string> | null {
  const seenRaw = localStorage.getItem(SEEN_SEED_KEY);
  return seenRaw ? new Set<string>([...JSON.parse(seenRaw), ...RETIRED_SEED_IDS]) : null;
}

/**
 * Drops contacts that were official on an earlier visit but have since been removed from the seed,
 * so they don't linger as personal contacts. Personal contacts have random ids, never seed ids.
 */
function withoutRetiredSeeds(stored: EmergencyContact[], seen: Set<string> | null): EmergencyContact[] {
  return seen ? stored.filter((c) => isOfficial(c) || !seen.has(c.id)) : stored;
}

/** Appends seed contacts added since the last visit; seeds the user deleted are not restored. */
function withNewSeeds(stored: EmergencyContact[], seenBefore: Set<string> | null): EmergencyContact[] {
  const seen = seenBefore ?? new Set(stored.map((c) => c.id));
  const added = DEFAULT_CONTACTS.filter((c) => !seen.has(c.id) && !stored.some((s) => s.id === c.id));
  localStorage.setItem(SEEN_SEED_KEY, JSON.stringify(DEFAULT_CONTACTS.map((c) => c.id)));
  return added.length ? [...stored, ...structuredClone(added)] : stored;
}

/**
 * Admin mode keeps the stored official contacts (with local edits and deletions).
 * Otherwise official contacts are always taken fresh from the seed, so corrections reach every user.
 */
function load(admin: boolean): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = readSeenSeeds();
        const stored = withoutRetiredSeeds(parsed, seen);
        if (admin) return withNewSeeds(stored, seen);
        localStorage.setItem(SEEN_SEED_KEY, JSON.stringify([...SEED_IDS]));
        return [...structuredClone(DEFAULT_CONTACTS), ...stored.filter((c) => !isOfficial(c))];
      }
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

export function useContacts(admin: boolean) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => load(admin));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // quota exceeded / private mode — data stays in memory
    }
  }, [contacts]);

  const save = useCallback((contact: EmergencyContact) => {
    // Ask the browser not to evict storage once the user owns data that exists nowhere else.
    if (!isOfficial(contact)) void navigator.storage?.persist?.().catch(() => false);
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

  /**
   * Admin: downloads every contact. Otherwise: only the personal contacts, through the share sheet
   * when available (e.g. to send the file to oneself on WhatsApp). Returns the number exported.
   */
  const exportJson = useCallback(async (): Promise<number> => {
    const list = admin ? contacts : contacts.filter((c) => !isOfficial(c));
    if (!list.length) return 0;
    const date = new Date().toISOString().slice(0, 10);
    const name = admin ? `urgences-ziguinchor-${date}.json` : `mes-contacts-urgences-ziguinchor-${date}.json`;
    const file = new File([JSON.stringify(list, null, 2)], name, { type: 'application/json' });
    if (!admin && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return list.length;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return list.length;
        // share failed — fall back to a download
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return list.length;
  }, [admin, contacts]);

  /**
   * Returns number of imported contacts; throws on invalid file.
   * Outside admin mode only personal contacts are imported, always merged.
   */
  const importJson = useCallback(async (file: File, merge: boolean): Promise<number> => {
    const raw: unknown = JSON.parse(await file.text());
    if (!Array.isArray(raw) || !raw.every(isContact)) throw new Error('invalid');
    const parsed = admin ? raw : raw.filter((c) => !isOfficial(c));
    if (!admin) merge = true;
    if (parsed.some((c) => !isOfficial(c))) void navigator.storage?.persist?.().catch(() => false);
    setContacts((prev) => {
      if (!merge) return parsed;
      const byId = new Map(prev.map((c) => [c.id, c]));
      parsed.forEach((c) => byId.set(c.id, c));
      return [...byId.values()];
    });
    return parsed.length;
  }, [admin]);

  return { contacts, save, remove, reset, exportJson, importJson };
}
