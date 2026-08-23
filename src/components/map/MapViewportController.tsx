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

const VIETNAM_NAV_BOUNDS = L.latLngBounds([
  [7.5, 101.2],
  [24.25, 110.65],
]);

const WORLD_BOUNDS = L.latLngBounds([
  [-84, -179.5],
  [84, 179.5],
]);

function validPoint(point: MapPoint) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180
    && !(Math.abs(point.lat) < .001 && Math.abs(point.lng) < .001);
}

export default function MapViewportController({
  points,
  selected,
  focusVietnam = false,
  maxZoom = 7,
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
    map.setMaxBounds(focusVietnam ? VIETNAM_NAV_BOUNDS : WORLD_BOUNDS);
    map.setMinZoom(focusVietnam ? 4.35 : 3);

    if (selected && validPoint(selected)) {
      map.flyTo([selected.lat, selected.lng], Math.min(maxZoom, selectedZoom), {
        duration: .58,
        easeLinearity: .22,
      });
      return;
    }

    if (focusVietnam) {
      const size = map.getSize();
      const horizontalPadding = Math.max(18, Math.min(54, Math.round(size.x * .045)));
      const verticalPadding = Math.max(16, Math.min(38, Math.round(size.y * .045)));
      map.fitBounds(VIETNAM_BOUNDS, {
        paddingTopLeft: [horizontalPadding, verticalPadding],
        paddingBottomRight: [horizontalPadding, verticalPadding],
        maxZoom: 5.8,
        animate: false,
      });
      map.panInsideBounds(VIETNAM_NAV_BOUNDS, { animate: false });
      return;
    }

    const valid = points.filter(validPoint);
    if (!valid.length) {
      map.fitBounds(VIETNAM_BOUNDS, { padding: [24, 24], maxZoom: 5.7, animate: false });
      return;
    }

    if (valid.length === 1) {
      map.flyTo([valid[0].lat, valid[0].lng], Math.min(maxZoom, singlePointZoom), {
        duration: .48,
        easeLinearity: .22,
      });
      return;
    }

    const bounds = L.latLngBounds(valid.map((point) => [point.lat, point.lng] as [number, number])).pad(.12);
    const size = map.getSize();
    const horizontalPadding = Math.max(22, Math.min(62, Math.round(size.x * .05)));
    const verticalPadding = Math.max(20, Math.min(48, Math.round(size.y * .06)));

    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, verticalPadding],
      paddingBottomRight: [horizontalPadding, verticalPadding],
      maxZoom,
      animate: true,
      duration: .52,
    });
  }, [focusVietnam, map, maxZoom, points, selected, selectedZoom, singlePointZoom]);

  return null;
}
