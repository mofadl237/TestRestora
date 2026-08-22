"use client";

/**
 * Single client-component boundary for all React context providers.
 *
 * Consolidating every context provider here guarantees Turbopack evaluates
 * next-themes / react-redux only inside the client React runtime, preventing
 * the "React Context is unavailable in Server Components" error that occurs
 * when packages with no `react-server` conditional export are lazily
 * evaluated in the RSC module graph.
 *
 * Layout hierarchy:
 *   ThemeProvider → ReduxProvider → children
 */

import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "@/src/store/store";
import { TableProvider } from "./TableProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider store={store}>
        <TableProvider>{children}</TableProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
