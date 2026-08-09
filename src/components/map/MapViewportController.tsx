"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

type MapPoint = { lat: number; lng: number };

type Props = {
  points: MapPoint[];
  selected?: MapPoint | null;
  maxZoom?: number;
  selectedZoom?: number;
  singlePointZoom?: number;
};

const VIETNAM_BOUNDS = L.latLngBounds([
  [8.05, 102.0],
  [23.6, 109.75],
]);

function validPoint(point: MapPoint) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) && point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180;
}

export default function MapViewportController({
  points,
  selected,
  maxZoom = 7,
  selectedZoom = 6.5,
  singlePointZoom = 6,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    const frame = window.requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 180);
    window.addEventListener("resize", invalidate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  useEffect(() => {
    map.stop();

    if (selected && validPoint(selected)) {
      map.flyTo([selected.lat, selected.lng], Math.min(maxZoom, selectedZoom), {
        duration: 0.45,
        easeLinearity: 0.3,
      });
      return;
    }

    const mapShell = map.getContainer().closest(".public-project-map-shell");
    const publicOverviewMode = Boolean(mapShell && !mapShell.querySelector(".public-map-reset"));

    if (publicOverviewMode) {
      const size = map.getSize();
      const horizontalPadding = Math.max(34, Math.min(80, Math.round(size.x * 0.06)));
      const verticalPadding = Math.max(30, Math.min(62, Math.round(size.y * 0.055)));
      map.fitBounds(VIETNAM_BOUNDS, {
        paddingTopLeft: [horizontalPadding, verticalPadding],
        paddingBottomRight: [horizontalPadding, verticalPadding],
        maxZoom: 5.25,
        animate: false,
      });
      return;
    }

    const valid = points.filter(validPoint);
    if (!valid.length) {
      map.setView([16.2, 106], 5, { animate: false });
      return;
    }

    if (valid.length === 1) {
      map.flyTo([valid[0].lat, valid[0].lng], Math.min(maxZoom, singlePointZoom), {
        duration: 0.4,
        easeLinearity: 0.3,
      });
      return;
    }

    const rawBounds = L.latLngBounds(valid.map((point) => [point.lat, point.lng] as [number, number]));
    const bounds = rawBounds.pad(0.14);
    const size = map.getSize();
    const horizontalPadding = Math.max(32, Math.min(72, Math.round(size.x * 0.055)));
    const verticalPadding = Math.max(32, Math.min(64, Math.round(size.y * 0.07)));

    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, verticalPadding],
      paddingBottomRight: [horizontalPadding, verticalPadding],
      maxZoom,
      animate: true,
      duration: 0.45,
    });
  }, [map, maxZoom, points, selected, selectedZoom, singlePointZoom]);

  return null;
}
