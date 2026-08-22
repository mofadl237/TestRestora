import * as z from "zod";
import type { useTranslations } from "next-intl";

export type TFunction = ReturnType<typeof useTranslations>;
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
export const loginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("LoginForm.emailRequired") })
      .regex(emailRegex,{ message: t("LoginForm.emailInvalid") }),
    password: z
      .string()
      .min(6, { message: t("LoginForm.passwordMin") }),
  });

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>;

export const signUpSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .min(1, { message: t("SignUpForm.nameRequired") })
        .min(2, { message: t("SignUpForm.nameMin") }),
      email: z
        .string()
        .min(1, { message: t("SignUpForm.emailRequired") })
        .regex(emailRegex, { message: t("SignUpForm.emailInvalid") }),
      password: z
        .string()
        .min(8, { message: t("SignUpForm.passwordMin") })
        .regex(/[A-Z]/, { message: t("SignUpForm.passwordUpper") })
        .regex(/[a-z]/, { message: t("SignUpForm.passwordLower") })
        .regex(/[0-9]/, { message: t("SignUpForm.passwordNumber") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("SignUpForm.confirmPasswordRequired") }),
      terms: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("SignUpForm.passwordMatch"),
      path: ["confirmPassword"],
    })
    .refine((data) => data.terms, {
      message: t("SignUpForm.termsRequired"),
      path: ["terms"],
    });

export type SignUpSchema = z.infer<ReturnType<typeof signUpSchema>>;

export const contactSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t("nameRequired") })
      .min(2, { message: t("nameMin") }),
    email: z
      .string()
      .min(1, { message: t("emailRequired") })
      .regex(emailRegex, { message: t("emailInvalid") }),
    phone: z
      .string()
      .refine((value) => value === "" || /^[+\d][\d\s().-]{6,}$/.test(value), {
        message: t("phoneInvalid"),
      }),
    subject: z.string().min(1, { message: t("subjectRequired") }),
    message: z
      .string()
      .min(1, { message: t("messageRequired") })
      .min(10, { message: t("messageMin") }),
  });

export type ContactFormValues = z.infer<ReturnType<typeof contactSchema>>;