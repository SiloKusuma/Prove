import { Vow } from '../types';

const API_BASE_URL = 'https://karyasilo.web.id/prove/api.php';

// Helper to format block ID with Web3 aesthetic (e.g., 0x8f2a99bcd1)
export function formatBlockId(id: string | number): string {
  const strId = String(id || '');
  if (strId.startsWith('0x')) return strId;
  // If numeric or alphanumeric, prefix with 0x and pad nicely if short
  if (/^\d+$/.test(strId)) {
    const hex = parseInt(strId, 10).toString(16).padStart(6, '0');
    return `0x${hex}`;
  }
  return `0x${strId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || '7f9a2b'}`;
}

// Generate deterministic pseudo-hash for aesthetic ledger verification display
export function computePseudoHash(name: string, text: string, id: string | number): string {
  let hash = 0x811c9dc5;
  const input = `${name}:${text}:${id}`;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex1 = (hash >>> 0).toString(16).padStart(8, '0');
  const hex2 = ((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((hash ^ 0x3c3c3c3c) >>> 0).toString(16).padStart(8, '0');
  const hex4 = ((hash ^ 0xf0f0f0f0) >>> 0).toString(16).padStart(8, '0');
  return `0x${hex1}${hex2}${hex3}${hex4}`;
}

export async function createVow(name: string, vow_text: string): Promise<{ id: string | number }> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      action: 'create',
      name: name.trim(),
      vow_text: vow_text.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
  }

  const raw = await response.text();
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    // If response was not JSON, maybe it returned an ID directly
    if (raw.trim().length > 0 && !raw.includes('<html')) {
      return { id: raw.trim() };
    }
    throw new Error('Invalid JSON response from server');
  }

  // Extract ID from multiple common API response shapes
  const id = data.id || data.data?.id || data.block_id || data.insert_id || data.vow_id;
  if (id !== undefined && id !== null) {
    return { id };
  }

  if (data.status === 'error' || data.success === false) {
    throw new Error(data.message || 'Failed to lock vow');
  }

  // Fallback if data itself is an ID
  if (typeof data === 'string' || typeof data === 'number') {
    return { id: data };
  }

  throw new Error('Server responded without returning a block ID');
}

export async function fetchLatestVows(): Promise<Vow[]> {
  const response = await fetch(`${API_BASE_URL}?action=latest`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch latest vows (HTTP ${response.status})`);
  }

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse latest vows response');
  }

  let list: any[] = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data.data)) {
    list = data.data;
  } else if (Array.isArray(data.vows)) {
    list = data.vows;
  } else if (data.result && Array.isArray(data.result)) {
    list = data.result;
  }

  return list.slice(0, 6).map((item, idx) => ({
    id: item.id ?? item.block_id ?? (idx + 1),
    name: item.name || 'Anonymous',
    vow_text: item.vow_text || item.text || item.promise || item.vow || '',
    created_at: item.created_at || item.date || item.timestamp,
    status: 'LOCKED',
  }));
}

export async function fetchVowById(id: string | number): Promise<Vow> {
  const cleanId = encodeURIComponent(String(id).replace(/^0x/, ''));
  const response = await fetch(`${API_BASE_URL}?action=get&id=${cleanId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load block ${id} (HTTP ${response.status})`);
  }

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse vow data from server');
  }

  const item = data.data || data.vow || data;
  if (!item || (!item.name && !item.vow_text && !item.id)) {
    throw new Error(`Vow block #${id} not found on the ledger`);
  }

  return {
    id: item.id ?? id,
    name: item.name || 'Anonymous',
    vow_text: item.vow_text || item.text || item.promise || '',
    created_at: item.created_at || item.date || item.timestamp || new Date().toISOString(),
    status: 'IMMUTABLE',
  };
}
