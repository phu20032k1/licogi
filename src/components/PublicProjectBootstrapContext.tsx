"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicProjectRecord } from "../lib/publicProject";

const PublicProjectBootstrapContext = createContext<PublicProjectRecord[]>([]);

export function PublicProjectBootstrapProvider({ initialProjects, children }: { initialProjects: PublicProjectRecord[]; children: ReactNode }) {
  return <PublicProjectBootstrapContext.Provider value={initialProjects}>{children}</PublicProjectBootstrapContext.Provider>;
}

export function usePublicProjectBootstrap() {
  return useContext(PublicProjectBootstrapContext);
}
