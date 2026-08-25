"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePublicProjectBootstrap } from "../components/PublicProjectBootstrapContext";
import type { PublicProjectRecord, PublicProjectsResponse } from "../lib/publicProject";

const CACHE_KEY = "licogi-public-projects-cache-v2";
const CACHE_FRESH_AGE = 1000 * 60 * 60 * 24;
const CACHE_STALE_AGE = 1000 * 60 * 60 * 24 * 30;
const REQUEST_TIMEOUT = 10000;

type CachedProjects = {
  savedAt: number;
  projects: PublicProjectRecord[];
};

type CachedRead = {
  projects: PublicProjectRecord[];
  stale: boolean;
};

let sharedRefresh: Promise<PublicProjectRecord[]> | null = null;

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
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Safari private mode / quota errors are optional cache failures only.
  }
}

async function fetchProjectPayload(endpoint: string, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLocaleLowerCase().includes("application/json")) {
      throw new Error(`Phản hồi dữ liệu không hợp lệ (${response.status}).`);
    }

    const data = await response.json() as PublicProjectsResponse;
    if (!response.ok || !data.ok) throw new Error(data.message || "Không tải được dữ liệu dự án.");
    const projects = Array.isArray(data.projects) ? data.projects : [];
    if (projects.length === 0) throw new Error("Máy chủ trả về danh sách dự án trống.");
    return projects;
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchProjectsResilient() {
  if (sharedRefresh) return sharedRefresh;

  sharedRefresh = (async () => {
    const attempts = await Promise.allSettled([
      fetchProjectPayload("/api/public/projects/map"),
      fetchProjectPayload("/api/public/projects"),
    ]);

    for (const attempt of attempts) {
      if (attempt.status === "fulfilled" && attempt.value.length > 0) return attempt.value;
    }

    const reason = attempts.find((attempt) => attempt.status === "rejected");
    if (reason?.status === "rejected") throw reason.reason;
    throw new Error("Không tải được dữ liệu dự án.");
  })().finally(() => {
    sharedRefresh = null;
  });

  return sharedRefresh;
}

export default function usePublicProjects(explicitInitialProjects: PublicProjectRecord[] = []) {
  const bootstrappedProjects = usePublicProjectBootstrap();
  const initialProjects = explicitInitialProjects.length > 0 ? explicitInitialProjects : bootstrappedProjects;
  const [projects, setProjects] = useState<PublicProjectRecord[]>(() => initialProjects);
  const [loading, setLoading] = useState(() => initialProjects.length === 0);
  const [error, setError] = useState("");
  const hasDataRef = useRef(initialProjects.length > 0);
  const disposedRef = useRef(false);

  const applyProjects = useCallback((nextProjects: PublicProjectRecord[]) => {
    if (disposedRef.current || nextProjects.length === 0) return;
    hasDataRef.current = true;
    setProjects(nextProjects);
    setLoading(false);
    setError("");
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent && !hasDataRef.current) setLoading(true);
    try {
      const nextProjects = await fetchProjectsResilient();
      if (disposedRef.current) return;
      applyProjects(nextProjects);
      cacheProjects(nextProjects);
    } catch (err) {
      if (disposedRef.current) return;

      const cached = readCachedProjects(true);
      if (!hasDataRef.current && cached.projects.length > 0) applyProjects(cached.projects);

      if (!hasDataRef.current && cached.projects.length === 0) {
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu dự án.");
      } else if (!silent && cached.stale) {
        setError("Mạng đang chậm. Đang hiển thị dữ liệu gần nhất.");
      }
    } finally {
      if (!disposedRef.current) setLoading(false);
    }
  }, [applyProjects]);

  useEffect(() => {
    disposedRef.current = false;
    let refreshTimer = 0;

    if (initialProjects.length > 0) {
      // The server bootstrap is the display source of truth. Never wait for a
      // client request before showing phone KPIs, lists or map points.
      applyProjects(initialProjects);
      cacheProjects(initialProjects);
      refreshTimer = window.setTimeout(() => { void load(true); }, 1600);
    } else {
      const cached = readCachedProjects(true);
      if (cached.projects.length > 0) {
        applyProjects(cached.projects);
        refreshTimer = window.setTimeout(() => { void load(true); }, 700);
      } else {
        void load(false);
      }
    }

    const reloadWhenOnline = () => { void load(true); };
    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    const reloadAfterPageRestore = (event: PageTransitionEvent) => {
      // iOS Safari aggressively restores pages from the back/forward cache.
      // Refresh after a restored page without discarding already rendered data.
      if (event.persisted) void load(true);
    };
    const reloadAfterDataChange = () => { void load(true); };

    window.addEventListener("online", reloadWhenOnline);
    window.addEventListener("pageshow", reloadAfterPageRestore);
    window.addEventListener("licogi-data-imported", reloadAfterDataChange);
    window.addEventListener("licogi-projects-updated", reloadAfterDataChange);
    document.addEventListener("visibilitychange", reloadWhenVisible);

    return () => {
      disposedRef.current = true;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      window.removeEventListener("online", reloadWhenOnline);
      window.removeEventListener("pageshow", reloadAfterPageRestore);
      window.removeEventListener("licogi-data-imported", reloadAfterDataChange);
      window.removeEventListener("licogi-projects-updated", reloadAfterDataChange);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, [applyProjects, initialProjects, load]);

  const reload = useCallback(() => {
    setError("");
    return load(false);
  }, [load]);

  return { projects, loading, error, reload };
}
