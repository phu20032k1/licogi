"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

type MapPoint = { lat: number; lng: number };

type Props = {
  points: MapPoint[];
  selected?: MapPoint | null;
  focusVietnam?: boolean;
  maxZoom?: number;
  selectedZoom?: number;
  singlePointZoom?: number;
};

const VIETNAM_BOUNDS = L.latLngBounds([
  [8.15, 102.0],
  [23.7, 109.85],
]);

/*
 * Keep the public Vietnam map from drifting all the way to India / Indonesia.
 * The bounds are intentionally a little wider than Vietnam because a wide
 * desktop map needs horizontal breathing room while keeping the whole country
 * visible at a useful zoom level.
 */
const VIETNAM_NAV_BOUNDS = L.latLngBounds([
  [5.2, 94.2],
  [27.2, 120.4],
]);

function validPoint(point: MapPoint) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && point.lat >= 8 && point.lat <= 24.5
    && point.lng >= 102 && point.lng <= 110.8
    && !(Math.abs(point.lat) < .001 && Math.abs(point.lng) < .001);
}

function defaultVietnamZoom(width: number) {
  if (width >= 1120) return 5.72;
  if (width >= 900) return 5.6;
  if (width >= 700) return 5.45;
  return 5.2;
}

export default function MapViewportController({
  points,
  selected,
  focusVietnam = false,
  maxZoom = 9,
  selectedZoom = 8.5,
  singlePointZoom = 7.5,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    const frame = window.requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 180);

    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.touchZoom.enable();
    map.getContainer().setAttribute("title", "Lăn chuột hoặc dùng bàn di chuột để phóng to, thu nhỏ bản đồ");

    window.addEventListener("resize", invalidate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  useEffect(() => {
    map.stop();
    map.setMaxBounds(VIETNAM_NAV_BOUNDS);
    map.setMinZoom(5.15);

    if (selected && validPoint(selected)) {
      map.flyTo([selected.lat, selected.lng], Math.min(maxZoom, Math.max(7.4, selectedZoom)), {
        duration: .5,
        easeLinearity: .22,
      });
      return;
    }

    if (focusVietnam) {
      const size = map.getSize();
      const zoom = Math.min(maxZoom, defaultVietnamZoom(size.x));
      map.setView([16.25, 107.25], zoom, { animate: false });
      map.panInsideBounds(VIETNAM_NAV_BOUNDS, { animate: false });
      return;
    }

    const valid = points.filter(validPoint);
    if (!valid.length) {
      const size = map.getSize();
      map.setView([16.25, 107.25], Math.min(maxZoom, defaultVietnamZoom(size.x)), { animate: false });
      return;
    }

    if (valid.length === 1) {
      map.flyTo([valid[0].lat, valid[0].lng], Math.min(maxZoom, Math.max(6.8, singlePointZoom)), {
        duration: .42,
        easeLinearity: .22,
      });
      return;
    }

    const bounds = L.latLngBounds(valid.map((point) => [point.lat, point.lng] as [number, number])).pad(.1);
    const size = map.getSize();
    const horizontalPadding = Math.max(22, Math.min(54, Math.round(size.x * .045)));
    const verticalPadding = Math.max(18, Math.min(42, Math.round(size.y * .055)));

    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, verticalPadding],
      paddingBottomRight: [horizontalPadding, verticalPadding],
      maxZoom,
      animate: true,
      duration: .46,
    });

    /* fitBounds may choose a very distant zoom on a wide canvas; never let the
       public Vietnam view fall back to a continent-scale map. */
    if (map.getZoom() < 5.15) map.setZoom(5.15, { animate: false });
    map.panInsideBounds(VIETNAM_NAV_BOUNDS, { animate: false });
  }, [focusVietnam, map, maxZoom, points, selected, selectedZoom, singlePointZoom]);

  return null;
}
