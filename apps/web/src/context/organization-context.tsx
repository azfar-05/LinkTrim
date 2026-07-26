"use client";

import { createContext, useContext } from "react";

export type OrganizationContextType = any;

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({
  organization,
  children,
}: {
  organization: OrganizationContextType;
  children: React.ReactNode;
}) {
  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }

  return context;
}