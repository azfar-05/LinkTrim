"use client";

import { createContext, useContext } from "react";

export interface OrganizationMember {
  id: string;
  userId: string;
  role: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
}

export interface OrganizationContextType {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date | string;
  members?: OrganizationMember[];
  invitations?: OrganizationInvitation[];
}

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

export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }

  return context;
}
