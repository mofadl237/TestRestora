"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronDown, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactSchema, type ContactFormValues } from "@/src/Validations";
import { EASE } from "./animations";

const fieldErrorId = (name: string) => `${name}-error`;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const subjects = t.raw("subjects") as Array<{ value: string; label: string }>;
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    reset();
    setSubmitted(true);
  };

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)] sm:p-8">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex h-full min-h-[380px] flex-col items-center justify-center gap-4 text-center"
          >
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {t("successTitle")}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("successText")}
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-2 inline-flex h-10 items-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("sendAnother")}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex h-full flex-col gap-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={
                    errors.name ? fieldErrorId("name") : undefined
                  }
                  {...register("name")}
                />
                {errors.name && (
                  <p
                    id={fieldErrorId("name")}
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? fieldErrorId("email") : undefined
                  }
                  {...register("email")}
                />
                {errors.email && (
                  <p
                    id={fieldErrorId("email")}
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t("phoneOptional")}</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t("phonePlaceholder")}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={
                  errors.phone ? fieldErrorId("phone") : undefined
                }
                {...register("phone")}
              />
              {errors.phone && (
                <p
                  id={fieldErrorId("phone")}
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subject">{t("subject")}</Label>
              <div className="relative">
                <select
                  id="subject"
                  aria-invalid={errors.subject ? true : undefined}
                  aria-describedby={
                    errors.subject ? fieldErrorId("subject") : undefined
                  }
                  className="h-10 w-full min-w-0 cursor-pointer appearance-none border-b border-input bg-transparent px-0 py-1 pr-6 text-sm text-foreground outline-none transition-[border-color] focus-visible:border-b-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-card"
                  {...register("subject")}
                >
                  <option value="" disabled hidden>
                    {t("subjectPlaceholder")}
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-0 rtl:right-auto"
                  aria-hidden="true"
                />
              </div>
              {errors.subject && (
                <p
                  id={fieldErrorId("subject")}
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">{t("message")}</Label>
              <textarea
                id="message"
                rows={5}
                placeholder={t("messagePlaceholder")}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={
                  errors.message ? fieldErrorId("message") : undefined
                }
                className="min-h-32 w-full resize-none border-b border-input bg-transparent py-1 text-sm text-foreground outline-none transition-[border-color] placeholder:text-muted-foreground focus-visible:border-b-ring"
                {...register("message")}
              />
              {errors.message && (
                <p
                  id={fieldErrorId("message")}
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.message.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ y: -1, filter: "brightness(1.08)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                  {t("send")}
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
