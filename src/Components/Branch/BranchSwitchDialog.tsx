"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { IApiBranch } from "@/src/store/api/publicApi";

interface IBranchSwitchDialogProps {
  open: boolean;
  target: IApiBranch | null;
  /** True when the current cart belongs to a DIFFERENT branch. */
  cartBelongsToOther: boolean;
  currentName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Safety dialog shown when switching branch while the cart holds items
 * (Phase: switching branches safely). Never lets an order silently cross
 * locations — confirming clears the cart before the switch happens.
 */
export function BranchSwitchDialog({
  open,
  target,
  cartBelongsToOther,
  currentName,
  onCancel,
  onConfirm,
}: IBranchSwitchDialogProps) {
  const t = useTranslations("branches.confirm");

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            {cartBelongsToOther ? t("titleCart") : t("title")}
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1 text-sm leading-relaxed">
            <span className="block">
              {t("description", {
                target: target.name,
                current: currentName,
              })}
            </span>
            {cartBelongsToOther ? (
              <span className="block rounded-lg border border-border/70 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {t("warning")}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} className="cursor-pointer">
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} className="cursor-pointer">
            {t("proceed")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
