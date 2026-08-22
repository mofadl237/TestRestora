"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  type LucideProps,
} from "lucide-react";
import { useLocaleDirection } from "./useLocaleDirection";

export const IconBack = (props: LucideProps) => {
  const { isRTL } = useLocaleDirection();
  return isRTL ? <ArrowRight {...props} /> : <ArrowLeft {...props} />;
};

export const IconNext = (props: LucideProps) => {
  const { isRTL } = useLocaleDirection();
  return isRTL ? <ArrowLeft {...props} /> : <ArrowRight {...props} />;
};

export const IconChevronBack = (props: LucideProps) => {
  const { isRTL } = useLocaleDirection();
  return isRTL ? <ChevronRight {...props} /> : <ChevronLeft {...props} />;
};

export const IconChevronNext = (props: LucideProps) => {
  const { isRTL } = useLocaleDirection();
  return isRTL ? <ChevronLeft {...props} /> : <ChevronRight {...props} />;
};

import { ArrowRightCircle, ArrowLeftCircle } from "lucide-react";

export const IconNextCircle = (props: LucideProps) => {
  const { isRTL } = useLocaleDirection();
  return isRTL ? (
    <ArrowLeftCircle {...props} />
  ) : (
    <ArrowRightCircle {...props} />
  );
};
