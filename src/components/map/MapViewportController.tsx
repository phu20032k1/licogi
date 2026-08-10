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

// Trang public ưu tiên thể hiện vùng hoạt động chính ở miền Bắc.
// Khi người dùng lọc/chọn dự án cụ thể, viewport vẫn tự động đi tới dữ liệu đó.
const NORTHERN_VIETNAM_BOUNDS = L.latLngBounds([
  [19.05, 102.75],
  [23.55, 108.35],
]);

const NORTHERN_VIETNAM_NAV_BOUNDS = L.latLngBounds([
  [18.15, 101.55],
  [24.15, 109.25],
]);

const WORLD_BOUNDS = L.latLngBounds([
  [-84, -179.5],
  [84, 179.5],
]);

function validPoint(point: MapPoint) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) && point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180;
}

export default function MapViewportController({
  points,
  selected,
  focusVietnam = false,
  maxZoom = 7,
  selectedZoom = 6.5,
  singlePointZoom = 6,
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
    map.setMaxBounds(focusVietnam ? NORTHERN_VIETNAM_NAV_BOUNDS : WORLD_BOUNDS);
    map.setMinZoom(focusVietnam ? 5.55 : 3);

    if (selected && validPoint(selected)) {
      map.flyTo([selected.lat, selected.lng], Math.min(maxZoom, selectedZoom), {
        duration: 0.48,
        easeLinearity: 0.24,
      });
      return;
    }

    if (focusVietnam) {
      const size = map.getSize();
      const horizontalPadding = Math.max(14, Math.min(42, Math.round(size.x * 0.035)));
      const verticalPadding = Math.max(12, Math.min(30, Math.round(size.y * 0.035)));
      map.fitBounds(NORTHERN_VIETNAM_BOUNDS, {
        paddingTopLeft: [horizontalPadding, verticalPadding],
        paddingBottomRight: [horizontalPadding, verticalPadding],
        maxZoom: 6.65,
        animate: false,
      });
      map.panInsideBounds(NORTHERN_VIETNAM_NAV_BOUNDS, { animate: false });
      return;
    }

    const valid = points.filter(validPoint);
    if (!valid.length) {
      map.setView([21.05, 105.75], 6.2, { animate: false });
      return;
    }

    if (valid.length === 1) {
      map.flyTo([valid[0].lat, valid[0].lng], Math.min(maxZoom, singlePointZoom), {
        duration: 0.42,
        easeLinearity: 0.24,
      });
      return;
    }

    const bounds = L.latLngBounds(valid.map((point) => [point.lat, point.lng] as [number, number])).pad(0.08);
    const size = map.getSize();
    const horizontalPadding = Math.max(18, Math.min(48, Math.round(size.x * 0.04)));
    const verticalPadding = Math.max(18, Math.min(42, Math.round(size.y * 0.05)));

    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, verticalPadding],
      paddingBottomRight: [horizontalPadding, verticalPadding],
      maxZoom,
      animate: true,
      duration: 0.45,
    });
  }, [focusVietnam, map, maxZoom, points, selected, selectedZoom, singlePointZoom]);

  return null;
}
