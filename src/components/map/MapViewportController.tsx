"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

type MapPoint = { lat: number; lng: number };

type Props = {
  points: MapPoint[];
  selected?: MapPoint | null;
  maxZoom?: number;
};

export default function MapViewportController({ points, selected, maxZoom = 11 }: Props) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    const frame = window.requestAnimationFrame(invalidate);
    window.addEventListener("resize", invalidate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  useEffect(() => {
    if (selected && Number.isFinite(selected.lat) && Number.isFinite(selected.lng)) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 10), { duration: 0.65 });
      return;
    }

    const valid = points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
    if (!valid.length) {
      map.setView([16.2, 106], 5, { animate: false });
      return;
    }
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], Math.min(maxZoom, 10), { animate: true });
      return;
    }

    const bounds = L.latLngBounds(valid.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [42, 42], maxZoom, animate: true, duration: 0.55 });
  }, [map, maxZoom, points, selected]);

  return null;
}
