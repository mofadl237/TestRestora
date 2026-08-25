"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";

import {
  hydrateBranch,
  setActiveBranch,
  selectActiveBranch,
  type IActiveBranchSnapshot,
} from "@/src/store/features/BranchSlice";
import {
  useGetBranchesQuery,
  type IApiBranch,
} from "@/src/store/api/publicApi";
import { clearCart, setCartBranch } from "@/src/store/features/CartSlice";
import { getBranchStorageKey, getSessionStorage } from "@/lib/localStorageHandle";

import BranchSplash from "./BranchSplash";
import BranchSelection from "./BranchSelection";
import { BranchSwitchDialog } from "./BranchSwitchDialog";

/**
 * Everything the website needs to operate inside a branch context.
 *
 * - `isMultiBranch` gates every piece of branch UI (switcher, badges) so
 *   single-branch restaurants render exactly as before — no selector, no
 *   switcher, nothing.
 * - `requestSwitch` is the ONLY way to change branch: it decides whether a
 *   cart confirmation is required and owns the dialog.
 */
interface IBranchContextValue {
  branches: IApiBranch[];
  activeBranch: IActiveBranchSnapshot | null;
  activeBranchId: string | undefined;
  isMultiBranch: boolean;
  requestSwitch: (branch: IApiBranch) => void;
}

const BranchGateContext = React.createContext<IBranchContextValue | null>(null);

/** Access the resolved branch context (throws outside the gate). */
export function useBranchContext(): IBranchContextValue {
  const ctx = React.useContext(BranchGateContext);
  if (!ctx) throw new Error("useBranchContext must be used within BranchGate");
  return ctx;
}

const toSnapshot = (branch: IApiBranch): IActiveBranchSnapshot => ({
  id: branch.id,
  name: branch.name,
  slug: branch.slug ?? null,
});

export function BranchGate({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const dispatch = useDispatch();

  const active = useSelector(selectActiveBranch);
  const cart = useSelector((state: RootState) => state.cart);

  // ── One-shot URL intent (deep link / QR) + Redux hydration ──────────────
  // `window.location` is read in a lazy initializer: it runs exactly once per
  // page load on the client and returns a neutral value on the server. The
  // gate paints the splash until the branches request resolves either way,
  // so server and client markup stay identical (no hydration drift, no
  // useSearchParams Suspense requirements).
  const [intent] = React.useState<{ branch: string | null; tableId: string | null }>(
    () => {
      if (typeof window === "undefined") return { branch: null, tableId: null };
      try {
        const params = new URLSearchParams(window.location.search);
        return { branch: params.get("branch"), tableId: params.get("tableId") };
      } catch {
        return { branch: null, tableId: null };
      }
    },
  );

  // Push the persisted snapshot into Redux once after mount (Redux is an
  // external system — effects are the sanctioned place to sync it).
  React.useEffect(() => {
    let persisted: IActiveBranchSnapshot | null = null;
    try {
      const key = getBranchStorageKey();
      const raw = getSessionStorage(key);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<IActiveBranchSnapshot> | null;
        if (saved?.id && saved.name) {
          persisted = { id: saved.id, name: saved.name, slug: saved.slug ?? null };
        }
      }
    } catch {
      persisted = null;
    }
    dispatch(hydrateBranch(persisted));
  }, [dispatch]);

  // ── Branch list (light payload only — never menus) ──────────────────────
  const branchesQuery = useGetBranchesQuery({ locale });
  // Memoized so the context value below keeps a stable identity.
  const branches = React.useMemo(
    () => branchesQuery.data ?? [],
    [branchesQuery.data],
  );
  // A failed /branches call (older Restora server without multi-branch
  // support) degrades gracefully to the restaurant-level experience.
  const listResolved = branchesQuery.isSuccess || branchesQuery.isError;

  const tableEntry = Boolean(intent.tableId);
  const urlBranchIntent = intent.branch;

  // ── Resolution effects ───────────────────────────────────────────────────

  // Single-branch restaurants resolve silently — the customer never sees
  // anything branch-related.
  React.useEffect(() => {
    if (!listResolved || tableEntry) return;
    if (branches.length === 1 && (!active || active.id !== branches[0].id)) {
      dispatch(setActiveBranch(toSnapshot(branches[0])));
    }
  }, [listResolved, branches, active, dispatch, tableEntry]);

  // Deep link (`?branch=<slug|id>`): activate the referenced branch once the
  // list arrives, then clean the URL for canonical cleanliness. The guard on
  // `active.id` keeps this effect idempotent without extra state.
  React.useEffect(() => {
    if (!listResolved || !urlBranchIntent || tableEntry) return;
    const match = branches.find(
      (b) => b.slug === urlBranchIntent || b.id === urlBranchIntent,
    );
    if (!match) return;
    if (!active || active.id !== match.id) {
      dispatch(setActiveBranch(toSnapshot(match)));
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("branch");
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, [listResolved, branches, active, dispatch, tableEntry, urlBranchIntent]);

  // ── Gating decision ──────────────────────────────────────────────────────
  // QR entry (`?tableId=`): the QR already answered "which location?" —
  // never block on branch selection; TableResolver resolves table + branch.
  const activeIsValid = Boolean(active && branches.some((b) => b.id === active.id));

  const needsSelection = !tableEntry && listResolved && branches.length > 1 && !activeIsValid;

  const ready =
    tableEntry || (listResolved && (branches.length <= 1 || activeIsValid));

  // ── Safe switching ───────────────────────────────────────────────────────
  const [pendingSwitch, setPendingSwitch] = React.useState<IApiBranch | null>(null);

  const cartHasItems = cart.items.length > 0 || cart.offerGroups.length > 0;
  const cartFromOtherBranch =
    cartHasItems && cart.branchId !== null && pendingSwitch !== null && cart.branchId !== pendingSwitch.id;

  // Tag the cart with the branch it belongs to as soon as it gains items.
  // Also migrates legacy persisted carts (saved before multi-branch) to the
  // currently active branch — they were necessarily added there.
  React.useEffect(() => {
    if (!active?.id) return;
    if (cartHasItems && cart.branchId == null) {
      dispatch(setCartBranch(active.id));
    }
  }, [active?.id, cartHasItems, cart.branchId, dispatch]);

  const performSwitch = React.useCallback(
    (branch: IApiBranch) => {
      // A confirmed switch with items means the customer accepted clearing
      // the cart — never carry items across locations silently.
      if (cartHasItems) dispatch(clearCart());
      dispatch(setActiveBranch(toSnapshot(branch)));
      setPendingSwitch(null);
    },
    [cartHasItems, dispatch],
  );

  const requestSwitch = React.useCallback(
    (branch: IApiBranch) => {
      if (!active) return;
      if (branch.id === active.id) return;
      const needsConfirm =
        cartHasItems && (cart.branchId === null || cart.branchId !== branch.id);
      if (needsConfirm) setPendingSwitch(branch);
      else performSwitch(branch);
    },
    [active, cartHasItems, cart.branchId, performSwitch],
  );

  const contextValue = React.useMemo<IBranchContextValue>(
    () => ({
      branches,
      activeBranch: active,
      activeBranchId: active?.id,
      isMultiBranch: branches.length > 1,
      requestSwitch,
    }),
    [branches, active, requestSwitch],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  if (needsSelection) {
    return (
      <BranchSelection
        branches={branches}
        onSelect={(branch) => performSwitch(branch)}
      />
    );
  }

  if (!ready) {
    return <BranchSplash />;
  }

  return (
    <BranchGateContext.Provider value={contextValue}>
      {children}
      <BranchSwitchDialog
        open={pendingSwitch !== null}
        target={pendingSwitch}
        cartBelongsToOther={cartFromOtherBranch}
        currentName={
          cartFromOtherBranch
            ? (branches.find((b) => b.id === cart.branchId)?.name ?? active?.name ?? "")
            : ""
        }
        onCancel={() => setPendingSwitch(null)}
        onConfirm={() => pendingSwitch && performSwitch(pendingSwitch)}
      />
    </BranchGateContext.Provider>
  );
}
