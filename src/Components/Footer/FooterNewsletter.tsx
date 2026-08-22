"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function FooterNewsletter({ variants }: { variants?: Variants }) {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate network delay for newsletter signup
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <motion.div variants={variants} className="flex flex-col gap-5">
      <h4 className="font-heading text-lg font-semibold tracking-wider text-foreground">
        {t("newsletterTitle")}
      </h4>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("newsletterDescription")}
      </p>

      {status === "success" ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-center text-sm font-medium text-primary">
          {t("newsletterSuccess")}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="email"
            required
            placeholder={t("newsletterPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-full border-border/70 bg-card px-5 text-sm placeholder:text-muted-foreground focus-visible:border-primary disabled:opacity-50"
            style={{ borderBottomWidth: "1px" }} // override standard input border-b only approach if needed, actually we can just rely on utils
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="h-12 w-full rounded-full font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading"
              ? t("newsletterSubscribing")
              : t("newsletterSubscribe")}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
