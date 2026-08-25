"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { PublicProjectRecord } from "../lib/publicProject";
import { siteConfig } from "../lib/siteConfig";

type Props = {
  projects: PublicProjectRecord[];
};

function isMappable(project: PublicProjectRecord) {
  return Number.isFinite(project.lat)
    && Number.isFinite(project.lng)
    && project.lat >= 8
    && project.lat <= 24.5
    && project.lng >= 102
    && project.lng <= 110.8;
}

function markerColor(project: PublicProjectRecord) {
  if (project.status === "completed") return "#16a34a";
  if (project.status === "warranty") return "#2563eb";
  return "#e85d18";
}

function FitProjectBounds({ projects }: Props) {
  const map = useMap();
  const points = useMemo(
    () => projects.filter(isMappable).map((project) => [project.lat, project.lng] as [number, number]),
    [projects],
  );

  useEffect(() => {
    if (!points.length) return;
    const bounds = points as LatLngBoundsExpression;
    window.requestAnimationFrame(() => {
      map.invalidateSize(false);
      map.fitBounds(bounds, { padding: [34, 34], maxZoom: 8, animate: false });
    });
  }, [map, points]);

  return null;
}

export default function MobileLeafletProjectMap({ projects }: Props) {
  const mappable = projects.filter(isMappable).slice(0, 80);

  return <div className="phone-live-map" aria-label="Bản đồ tương tác các công trình LICOGI 18.3">
    <MapContainer
      center={[16.25, 106.25]}
      zoom={5}
      minZoom={4}
      maxZoom={16}
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl
      preferCanvas
      className="phone-live-map-container"
    >
      <TileLayer
        url={siteConfig.map.tileUrl}
        attribution={siteConfig.map.attribution}
        detectRetina
        maxZoom={19}
      />
      <FitProjectBounds projects={mappable} />
      <ZoomControl position="bottomright" />

      {mappable.map((project) => {
        const color = markerColor(project);
        return <CircleMarker
          key={project.id}
          center={[project.lat, project.lng]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: color,
            fillOpacity: 1,
          }}
        >
          <Popup closeButton={false} minWidth={210} maxWidth={260}>
            <div className="phone-live-map-popup">
              <span>{project.code}</span>
              <strong>{project.name}</strong>
              <small>{project.province} · {project.type}</small>
              <a href={`/portfolio/projects/${encodeURIComponent(project.code || project.id)}`}>Xem hồ sơ công trình</a>
            </div>
          </Popup>
        </CircleMarker>;
      })}
    </MapContainer>
  </div>;
}
