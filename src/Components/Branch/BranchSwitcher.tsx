"use client";

import { MapPin, ChevronDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBranchContext } from "./BranchGate";

/**
 * Subtle in-header branch switcher for MULTI-BRANCH restaurants only
 * (the gate context guarantees `isMultiBranch` consumers hide it otherwise).
 * Compact by design — it must never dominate the navbar.
 */
export function BranchSwitcher({ className }: { className?: string }) {
  const t = useTranslations("branches.switcher");
  const { branches, activeBranch, isMultiBranch, requestSwitch } = useBranchContext();

  if (!isMultiBranch || !activeBranch) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 max-w-[10rem] cursor-pointer gap-1.5 rounded-full px-3 font-medium",
              className,
            )}
          />
        }
      >
        <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">{activeBranch.name}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">{t("label")}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[13rem]">
        <DropdownMenuGroup>
          {branches.map((branch) => {
            const isActive = branch.id === activeBranch.id;
            return (
              <DropdownMenuItem
                key={branch.id}
                className={cn(
                  "cursor-pointer gap-2",
                  isActive && "font-semibold text-primary data-[highlighted]:bg-primary/10",
                )}
                onClick={() => requestSwitch(branch)}
              >
                {isActive ? (
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <span className="flex w-4 shrink-0 justify-center" aria-hidden="true">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        branch.isOpenNow ? "bg-emerald-500" : "bg-red-400",
                      )}
                    />
                  </span>
                )}
                <span className="truncate">{branch.name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
