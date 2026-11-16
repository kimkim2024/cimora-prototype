import { useSyncExternalStore } from 'react';
import type { Pack, Work, WorkChapter } from '../data/studio';

/**
 * Studio credits, library and reading state for the local demo.
 *
 * Same rules as the prototype's model: one balance, one ledger, purchases and
 * chapter unlocks are permanent, follows and saves are toggles. Everything is
 * on this device; nothing is sent anywhere.
 */
export type LedgerEntry = { id: string; title: string; delta: number; time: string };

export type StudioState = {
  wallet: number;
  purchases: string[];
  unlocks: string[];
  follows: string[];
  favorites: string[];
  ledger: LedgerEntry[];
};

const KEY = 'cimora-studio-v1';
const STARTING_CREDITS = 680;

const EMPTY: StudioState = {
  wallet: STARTING_CREDITS,
  purchases: [],
  unlocks: [],
  follows: [],
  favorites: [],
  ledger: [],
};

function load(): StudioState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Partial<StudioState>;
    return { ...EMPTY, ...saved };
  } catch {
    return EMPTY;
  }
}

let state: StudioState = typeof window === 'undefined' ? EMPTY : load();
const listeners = new Set<() => void>();

function commit(next: StudioState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: the session still works */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => state;

export function useStudio(): StudioState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

function entry(title: string, delta: number): LedgerEntry {
  return { id: `ledger-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, title, delta, time: new Date().toISOString() };
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export const studio = {
  toggleFollow(workId: string) {
    commit({ ...state, follows: toggle(state.follows, workId) });
  },

  toggleFavorite(workId: string) {
    commit({ ...state, favorites: toggle(state.favorites, workId) });
  },

  /** Returns an error message, or null when the chapter is readable now. */
  unlock(work: Work, chapter: WorkChapter): string | null {
    const key = `${work.id}/${chapter.id}`;
    if (state.unlocks.includes(key)) return 'Chapter already unlocked.';
    if (chapter.free) return null;
    const price = chapter.price ?? 0;
    if (state.wallet < price) return `Not enough credits. ${price - state.wallet} short.`;
    commit({
      ...state,
      wallet: state.wallet - price,
      unlocks: [...state.unlocks, key],
      ledger: [entry(`Unlock · ${work.title} / ${chapter.title}`, -price), ...state.ledger],
    });
    return null;
  },

  /** Returns an error message, or null when the pack joined the library. */
  purchase(pack: Pack): string | null {
    if (state.purchases.includes(pack.id)) return 'Already in your library.';
    if (state.wallet < pack.price) return `Not enough credits. ${pack.price - state.wallet} short.`;
    commit({
      ...state,
      wallet: state.wallet - pack.price,
      purchases: [...state.purchases, pack.id],
      ledger: [entry(`Buy · ${pack.title}`, -pack.price), ...state.ledger],
    });
    return null;
  },

  topUp(amount: number) {
    commit({
      ...state,
      wallet: state.wallet + amount,
      ledger: [entry(`Top up · ${amount} credits`, amount), ...state.ledger],
    });
  },

  reset() {
    commit(EMPTY);
  },
};

/** A chapter is readable when it is free or already unlocked. */
export function isReadable(unlocked: string[], workId: string, chapter: WorkChapter) {
  return Boolean(chapter.free) || unlocked.includes(`${workId}/${chapter.id}`);
}
