"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePublicProjectBootstrap } from "../components/PublicProjectBootstrapContext";
import type { PublicProjectRecord, PublicProjectsResponse } from "../lib/publicProject";

const CACHE_KEY = "licogi-public-projects-cache-v1";
const CACHE_FRESH_AGE = 1000 * 60 * 60 * 24;
const CACHE_STALE_AGE = 1000 * 60 * 60 * 24 * 30;
const REQUEST_TIMEOUT = 7000;
const PREVIEW_TIMEOUT = 2400;
const INITIAL_LOADING_BUDGET = 2700;

type CachedProjects = {
  savedAt: number;
  projects: PublicProjectRecord[];
};

type CachedRead = {
  projects: PublicProjectRecord[];
  stale: boolean;
};

function readCachedProjects(allowStale = true): CachedRead {
  if (typeof window === "undefined") return { projects: [], stale: false };
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return { projects: [], stale: false };
    const cached = JSON.parse(raw) as CachedProjects;
    if (!cached || !Array.isArray(cached.projects) || !Number.isFinite(cached.savedAt)) return { projects: [], stale: false };
    const age = Date.now() - cached.savedAt;
    if (age > CACHE_STALE_AGE) return { projects: [], stale: false };
    if (!allowStale && age > CACHE_FRESH_AGE) return { projects: [], stale: true };
    return { projects: cached.projects, stale: age > CACHE_FRESH_AGE };
  } catch {
    return { projects: [], stale: false };
  }
}

function cacheProjects(projects: PublicProjectRecord[]) {
  if (typeof window === "undefined" || projects.length === 0) return;
  const payload: CachedProjects = { savedAt: Date.now(), projects };
  window.setTimeout(() => {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Safari private mode / quota errors must not block rendering.
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

export default function usePublicProjects(explicitInitialProjects: PublicProjectRecord[] = []) {
  const bootstrappedProjects = usePublicProjectBootstrap();
  const initialProjects = explicitInitialProjects.length > 0 ? explicitInitialProjects : bootstrappedProjects;
  const [projects, setProjects] = useState<PublicProjectRecord[]>(initialProjects);
  const [loading, setLoading] = useState(initialProjects.length === 0);
  const [error, setError] = useState("");
  const hasDataRef = useRef(initialProjects.length > 0);
  const disposedRef = useRef(false);

  const applyProjects = useCallback((nextProjects: PublicProjectRecord[]) => {
    if (disposedRef.current) return;
    hasDataRef.current = nextProjects.length > 0;
    setProjects(nextProjects);
    if (nextProjects.length > 0) setLoading(false);
  }, []);

  const loadFull = useCallback(async (silent = false) => {
    if (!silent && !hasDataRef.current) setLoading(true);
    try {
      const nextProjects = await fetchProjectPayload("/api/public/projects", REQUEST_TIMEOUT);
      if (disposedRef.current) return;
      if (nextProjects.length > 0) {
        applyProjects(nextProjects);
        cacheProjects(nextProjects);
      }
      setError("");
    } catch (err) {
      if (disposedRef.current) return;
      const cached = readCachedProjects(true);
      if (!hasDataRef.current && cached.projects.length > 0) applyProjects(cached.projects);
      if (!hasDataRef.current) {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
      } else if (!silent && cached.stale) {
        setError("Mạng đang chậm. Đang hiển thị dữ liệu gần nhất.");
      }
    } finally {
      if (!disposedRef.current && !hasDataRef.current) setLoading(false);
    }
  }, [applyProjects]);

  const loadPreview = useCallback(async () => {
    try {
      const previewProjects = await fetchProjectPayload("/api/public/projects/map", PREVIEW_TIMEOUT);
      if (disposedRef.current) return false;
      if (previewProjects.length > 0) {
        applyProjects(previewProjects);
        cacheProjects(previewProjects);
        setError("");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [applyProjects]);

  useEffect(() => {
    disposedRef.current = false;
    let refreshTimer = 0;

    if (initialProjects.length > 0) {
      hasDataRef.current = true;
      setLoading(false);
      cacheProjects(initialProjects);
      refreshTimer = window.setTimeout(() => { void loadFull(true); }, 1200);
    } else {
      const cached = readCachedProjects(true);
      if (cached.projects.length > 0) {
        applyProjects(cached.projects);
        setError("");
        refreshTimer = window.setTimeout(() => { void loadFull(true); }, 900);
      } else {
        const budgetTimer = window.setTimeout(() => {
          if (disposedRef.current || hasDataRef.current) return;
          setLoading(false);
          setError("Kết nối đang chậm. Hệ thống vẫn tiếp tục đồng bộ dữ liệu ở nền.");
        }, INITIAL_LOADING_BUDGET);

        void loadPreview().then((previewReady) => {
          if (disposedRef.current) return;
          window.clearTimeout(budgetTimer);
          if (previewReady) {
            refreshTimer = window.setTimeout(() => { void loadFull(true); }, 1200);
            return;
          }
          setLoading(false);
          void loadFull(true);
        });
      }
    }

    const reloadWhenOnline = () => { void loadFull(true); };
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) void loadFull(true);
    };

    window.addEventListener("online", reloadWhenOnline);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    return () => {
      disposedRef.current = true;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      window.removeEventListener("online", reloadWhenOnline);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, [applyProjects, initialProjects, loadFull, loadPreview]);

  const reload = useCallback(() => {
    setError("");
    return loadFull(false);
  }, [loadFull]);

  return { projects, loading, error, reload };
}
