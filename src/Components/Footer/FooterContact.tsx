"use client";

import { motion, Variants } from "framer-motion";
import {
  FaEnvelope,
  FaLocationDot,
  FaPhone,
  FaWhatsapp,
} from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { usePublicSettings } from "./data";

export function FooterContact({ variants }: { variants?: Variants }) {
  const t = useTranslations("footer");
  const publicSettings = usePublicSettings();
  const contact = publicSettings?.contact;

  const address = contact?.address?.trim();
  const googleMaps = contact?.googleMaps?.trim();
  const phone = contact?.phone?.trim();
  const whatsapp = contact?.whatsapp?.trim();
  const email = contact?.email?.trim();

  const contactRowClasses =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary";

  return (
    <motion.div variants={variants} className="flex flex-col gap-5">
      <h4 className="font-heading text-lg font-semibold tracking-wider text-foreground">
        {t("visitUs")}
      </h4>
      <address className="flex flex-col gap-4 not-italic">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FaLocationDot className="text-sm" />
          </div>
          <span className="text-sm font-medium leading-relaxed text-muted-foreground">
            {address ? (
              address
            ) : (
              <>
                {t("addressLine1")}
                <br />
                {t("addressLine2")}
              </>
            )}
          </span>
        </div>

        {googleMaps && (
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FaLocationDot className="text-sm" />
            </div>
            <a
              href={googleMaps}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("viewOnMap")}
            </a>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FaPhone className="text-sm" />
          </div>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className={contactRowClasses}
            >
              {phone}
            </a>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {t("phoneFallback")}
            </span>
          )}
        </div>

        {whatsapp && (
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FaWhatsapp className="text-sm" />
            </div>
            <a
              href={`https://wa.me/${whatsapp.replace(/^\+/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("whatsapp")}
            </a>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FaEnvelope className="text-sm" />
          </div>
          {email ? (
            <a
              href={`mailto:${email}`}
              className={contactRowClasses}
            >
              {email}
            </a>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {t("emailFallback")}
            </span>
          )}
        </div>
      </address>
    </motion.div>
  );
}
