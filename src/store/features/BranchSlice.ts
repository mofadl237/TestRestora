import {
  getBranchStorageKey,
  setSessionStorage,
  removeSessionStorage,
} from "@/lib/localStorageHandle";
import { useSelector } from "react-redux";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/src/store/store";

/**
 * Active-branch state for multi-branch restaurants.
 *
 * The branch is resolved ONCE (branch gate → selection screen / deep link /
 * table QR) and then reused everywhere: catalog queries, offers, delivery
 * zones, reservations and order creation are all scoped with the active
 * `branchId`. The snapshot is persisted to sessionStorage so a returning
 * customer lands directly in their last location within the same browsing
 * session — but NOT across sessions (a new tab/window starts fresh).
 *
 * Single-branch restaurants never surface this slice in the UI — the gate
 * resolves the only branch silently (see BranchGate).
 */

/** Minimal identity kept client-side. Never store full branch payloads here —
 *  display data always comes fresh from `useGetBranchesQuery`. */
export interface IActiveBranchSnapshot {
  id: string;
  name: string;
  slug: string | null;
}

interface IBranchState {
  /** Resolved active branch; `null` until the gate resolves one. */
  active: IActiveBranchSnapshot | null;
  /** True after the post-mount hydration pass (avoids SSR/CSR mismatch). */
  hydrated: boolean;
}

const initialState: IBranchState = {
  active: null,
  hydrated: false,
};

export const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    /**
     * Client-side hydration after mount. Accepts a persisted snapshot or
     * `null` so the gate can distinguish "not hydrated yet" from "nothing
     * saved".
     */
    hydrateBranch: (state, action: PayloadAction<IActiveBranchSnapshot | null>) => {
      state.active = action.payload;
      state.hydrated = true;
    },

    /**
     * Activate + persist a branch (selection screen, switcher, QR flow).
     * Persisted to sessionStorage (not localStorage) so the selection
     * survives page refreshes but is discarded when the tab is closed.
     */
    setActiveBranch: (state, action: PayloadAction<IActiveBranchSnapshot>) => {
      state.active = action.payload;
      const key = getBranchStorageKey();
      setSessionStorage(key, JSON.stringify(action.payload));
    },

    /** Forget the active branch (invalid table, storage reset). */
    clearActiveBranch: (state) => {
      state.active = null;
      const key = getBranchStorageKey();
      removeSessionStorage(key);
    },
  },
});

export const { hydrateBranch, setActiveBranch, clearActiveBranch } =
  branchSlice.actions;

export const selectActiveBranch = (state: RootState) => state.branch.active;

/** Memoized active branch id (`undefined` while unresolved). */
export const selectActiveBranchId = createSelector(
  [selectActiveBranch],
  (active) => active?.id ?? undefined,
);

/**
 * Active branch snapshot for UI display (name badge, switcher, QR context).
 */
export function useActiveBranch(): IActiveBranchSnapshot | null {
  return useSelector(selectActiveBranch) ?? null;
}

/**
 * Active branch id for scoping RTK queries (`?branchId=`). Returns
 * `undefined` while unresolved so requests stay restaurant-scoped and RTK
 * Query cache keys stay stable per branch.
 */
export function useActiveBranchId(): string | undefined {
  return useSelector(selectActiveBranchId);
}

export default branchSlice.reducer;
