"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { checkoutVariants, sectionVariants } from "./CartAnimations";
import { User, Phone, MapPin, Building2, StickyNote } from "lucide-react";

export interface ICheckoutFields {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  apartment: string;
  notes: string;
}

interface IProps {
  fields: ICheckoutFields;
  onChange: (fields: ICheckoutFields) => void;
  isDineIn?: boolean;
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
}

const Field = ({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  as = "input",
  rows = 3,
}: FieldProps) => (
  <motion.div variants={sectionVariants} className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <span className="text-primary">{icon}</span>
      {label}
      {required && <span className="text-primary">*</span>}
    </label>

    {as === "textarea" ? (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-200 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    )}
  </motion.div>
);

const CheckoutForm = ({ fields, onChange, isDineIn = false }: IProps) => {
  const t = useTranslations("cart");
  const update = (key: keyof ICheckoutFields) => (val: string) =>
    onChange({ ...fields, [key]: val });

  return (
    <motion.div
      variants={checkoutVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
      style={{
        boxShadow:
          "0 2px 12px 0 oklch(0.62 0.2 50 / 0.06), 0 1px 3px 0 oklch(0.215 0.017 28 / 0.03)",
      }}
    >
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
          <MapPin className="h-4 w-4 text-primary" aria-hidden />
          {isDineIn ? t("dineInDetails") : t("deliveryDetails")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isDineIn ? t("dineInDetailsDesc") : t("deliveryDetailsDesc")}
        </p>
      </div>

      {/* Fields */}
      <motion.div
        variants={{
          visible: {
            transition: { staggerChildren: 0.07, delayChildren: 0.08 },
          },
        }}
        className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
      >
        <Field
          id="checkout-name"
          label={t("customerName")}
          icon={<User className="h-3 w-3" />}
          value={fields.customerName}
          onChange={update("customerName")}
          placeholder={t("customerNamePlaceholder")}
          required
        />

        <Field
          id="checkout-phone"
          label={t("phoneNumber")}
          icon={<Phone className="h-3 w-3" />}
          value={fields.phone}
          onChange={update("phone")}
          placeholder={t("phonePlaceholder")}
          type="tel"
          required
        />

        {!isDineIn && (
          <>
            <div className="sm:col-span-2">
              <Field
                id="checkout-address"
                label={t("deliveryAddress")}
                icon={<MapPin className="h-3 w-3" />}
                value={fields.address}
                onChange={update("address")}
                placeholder={t("addressPlaceholder")}
                required
              />
            </div>

            <Field
              id="checkout-apartment"
              label={t("apartmentBuilding")}
              icon={<Building2 className="h-3 w-3" />}
              value={fields.apartment}
              onChange={update("apartment")}
              placeholder={t("apartmentPlaceholder")}
            />

            <Field
              id="checkout-city"
              label={t("city")}
              icon={<MapPin className="h-3 w-3" />}
              value={fields.city}
              onChange={update("city")}
              placeholder={t("cityPlaceholder")}
              required
            />
          </>
        )}

        <div className="sm:col-span-2">
          <Field
            id="checkout-notes"
            label={t("notesForRestaurant")}
            icon={<StickyNote className="h-3 w-3" />}
            value={fields.notes}
            onChange={update("notes")}
            placeholder={t("notesPlaceholder")}
            as="textarea"
            rows={3}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutForm;
