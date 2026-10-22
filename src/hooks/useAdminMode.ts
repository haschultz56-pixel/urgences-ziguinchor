import { useCallback, useState } from 'react';

const ADMIN_KEY = 'uz.admin';

/**
 * Maintainer mode, per device: `?admin=1` turns it on, `?admin=0` turns it off.
 * Not a security barrier — it only unlocks editing of official contacts on this device.
 */
function readAdminMode(): boolean {
  try {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('admin');
    if (param !== null) {
      if (param === '1') localStorage.setItem(ADMIN_KEY, '1');
      else localStorage.removeItem(ADMIN_KEY);
      url.searchParams.delete('admin');
      window.history.replaceState(null, '', url);
    }
    return localStorage.getItem(ADMIN_KEY) === '1';
  } catch {
    return false;
  }
}

export function useAdminMode() {
  const [admin] = useState(readAdminMode);

  /** Reloads so that official contacts are taken fresh from the seed again. */
  const exitAdmin = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_KEY);
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  return { admin, exitAdmin };
}
