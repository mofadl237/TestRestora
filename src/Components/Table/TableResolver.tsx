"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useLazyResolveTableQuery } from "@/src/store/api/publicApi";
import { useActiveTable } from "@/src/Providers/TableProvider";
import {
  setDineInTable,
  clearDineInTable,
} from "@/src/store/features/CartSlice";

interface IProps {
  tableId?: string;
}

/**
 * Resolves a `?tableId=` query into an active dine-in table using the public
 * Restora API. The resolved table is stored in TableContext and shown in a
 * non-blocking banner.
 */
export function TableResolver({ tableId }: IProps) {
  const t = useTranslations("tables");
  const dispatch = useDispatch();
  const { table, setTable, clearTable } = useActiveTable();
  const [dismissed, setDismissed] = React.useState(false);
  const [trigger] = useLazyResolveTableQuery();
  const resolvedRef = React.useRef(false);

  React.useEffect(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    if (!tableId) return;

    void (async () => {
      try {
        dispatch(clearDineInTable());
        const result = await trigger({ tableId });
        const resolved = result.data;

        if (!resolved) {
          toast.error(t("invalid"), "table-resolve-error");
          clearTable();
          return;
        }

        if (!resolved.isActive) {
          toast.error(t("inactive", { number: resolved.number }), "table-inactive");
          clearTable();
          return;
        }

        dispatch(setDineInTable({ id: resolved.id, number: resolved.number }));
        setTable(resolved);
        toast.success(t("greeting", { number: resolved.number }), "table-greeting");
      } catch {
        toast.error(t("invalid"), "table-resolve-error");
        clearTable();
      }
    })();
  }, [tableId, dispatch, trigger, setTable, clearTable, t]);

  if (!table || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-primary px-4 py-3 text-primary-foreground shadow-md",
        "animate-in slide-in-from-top-2",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-sm font-medium">
          {t("banner", { number: table.number })}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="size-7 shrink-0 text-primary-foreground hover:bg-primary-foreground/10"
          aria-label={t("dismiss")}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
