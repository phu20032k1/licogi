"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicProjectRecord, PublicProjectsResponse } from "../lib/publicProject";

const CACHE_KEY = "licogi-public-projects-cache-v1";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

type CachedProjects = {
  savedAt: number;
  projects: PublicProjectRecord[];
};

function readCachedProjects() {
  if (typeof window === "undefined") return [] as PublicProjectRecord[];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const cached = JSON.parse(raw) as CachedProjects;
    if (!cached || !Array.isArray(cached.projects)) return [];
    if (!Number.isFinite(cached.savedAt) || Date.now() - cached.savedAt > CACHE_MAX_AGE) return [];
    return cached.projects;
  } catch {
    return [];
  }
}

function cacheProjects(projects: PublicProjectRecord[]) {
  if (typeof window === "undefined" || projects.length === 0) return;
  try {
    const payload: CachedProjects = { savedAt: Date.now(), projects };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Private browsing / storage quota must not prevent the live API from working.
  }
}

async function fetchPublicProjects() {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/public/projects", {
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
      });
      const data = await response.json() as PublicProjectsResponse;
      if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu dự án.");
      return Array.isArray(data.projects) ? data.projects : [];
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => window.setTimeout(resolve, 350));
    } finally {
      window.clearTimeout(timer);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Không tải được dữ liệu dự án.");
}

export default function usePublicProjects() {
  const [projects, setProjects] = useState<PublicProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const nextProjects = await fetchPublicProjects();
      setProjects(nextProjects);
      cacheProjects(nextProjects);
      setError("");
    } catch (err) {
      const cachedProjects = readCachedProjects();
      setProjects((current) => current.length > 0 ? current : cachedProjects);
      setError(cachedProjects.length > 0
        ? "Mạng đang không ổn định. Đang hiển thị dữ liệu gần nhất."
        : err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedProjects = readCachedProjects();
    if (cachedProjects.length > 0) setProjects(cachedProjects);
    void load();

    const reloadWhenOnline = () => { void load(true); };
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) void load(true);
    };

    window.addEventListener("online", reloadWhenOnline);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => {
      window.removeEventListener("online", reloadWhenOnline);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, [load]);

  const reload = useCallback(() => load(false), [load]);

  return { projects, loading, error, reload };
}
