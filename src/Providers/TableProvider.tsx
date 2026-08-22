"use client";

import * as React from "react";

export interface IActiveTable {
  id: string;
  number: string;
  isActive: boolean;
}

interface ITableContext {
  table: IActiveTable | null;
  setTable: (table: IActiveTable | null) => void;
  clearTable: () => void;
}

const TableContext = React.createContext<ITableContext | null>(null);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [table, setTable] = React.useState<IActiveTable | null>(null);

  const clearTable = React.useCallback(() => setTable(null), []);

  return (
    <TableContext.Provider value={{ table, setTable, clearTable }}>
      {children}
    </TableContext.Provider>
  );
}

export function useActiveTable() {
  const ctx = React.useContext(TableContext);
  if (!ctx) {
    throw new Error("useActiveTable must be used within TableProvider");
  }
  return ctx;
}
