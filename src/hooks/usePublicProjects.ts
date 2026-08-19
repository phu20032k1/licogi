"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicProjectRecord, PublicProjectsResponse } from "../lib/publicProject";

const CACHE_KEY = "licogi-public-projects-cache-v1";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24;
const REQUEST_TIMEOUT = 10000;
const PREVIEW_TIMEOUT = 6500;

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
  const payload: CachedProjects = { savedAt: Date.now(), projects };

  // localStorage is synchronous and can briefly block Safari on iOS for a large
  // project list. Persist after paint instead of delaying the first useful render.
  window.setTimeout(() => {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing / storage quota must not prevent the live API from working.
    }
  }, 0);
}

async function fetchProjectPayload(endpoint: string, timeout: number) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(endpoint, {
      cache: "default",
      credentials: "same-origin",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const data = await response.json() as PublicProjectsResponse;
    if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu dự án.");
    return Array.isArray(data.projects) ? data.projects : [];
  } finally {
    window.clearTimeout(timer);
  }
}

export default function usePublicProjects() {
  const [projects, setProjects] = useState<PublicProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const nextProjects = await fetchProjectPayload("/api/public/projects", REQUEST_TIMEOUT);
      setProjects(nextProjects);
      cacheProjects(nextProjects);
      setError("");
    } catch (err) {
      const cachedProjects = readCachedProjects();
      setProjects((current) => current.length > 0 ? current : cachedProjects);
      if (!silent) {
        setError(cachedProjects.length > 0
          ? "Mạng đang không ổn định. Đang hiển thị dữ liệu gần nhất."
          : err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
      } else if (cachedProjects.length > 0) {
        setError("");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    const cachedProjects = readCachedProjects();

    if (cachedProjects.length > 0) {
      setProjects(cachedProjects);
      setLoading(false);
      void load(true);
    } else {
      // On a fresh phone, render the lightweight map projection first. This avoids
      // making Safari wait for the heavier financial/related-data query before it
      // can show useful project counts and cards.
      void fetchProjectPayload("/api/public/projects/map", PREVIEW_TIMEOUT)
        .then((previewProjects) => {
          if (disposed) return;
          if (previewProjects.length > 0) {
            setProjects(previewProjects);
            setLoading(false);
            setError("");
            void load(true);
          } else {
            void load(false);
          }
        })
        .catch(() => {
          if (!disposed) void load(false);
        });
    }

    const reloadWhenOnline = () => { void load(true); };
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) void load(true);
    };

    window.addEventListener("online", reloadWhenOnline);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => {
      disposed = true;
      window.removeEventListener("online", reloadWhenOnline);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, [load]);

  const reload = useCallback(() => load(false), [load]);

  return { projects, loading, error, reload };
}
