"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, ScaleControl, TileLayer, Tooltip } from "react-leaflet";
import type { PublicProjectRecord } from "../lib/publicProject";
import { markerHtml, normalizeProjectType } from "../lib/projectMapVisuals";
import { siteConfig } from "../lib/siteConfig";

export default function PublicSingleProjectMap({ project }: { project: PublicProjectRecord }) {
  const icon = L.divIcon({
    className: "licogi-div-icon",
    html: markerHtml(normalizeProjectType(project.type), project.status, true),
    iconSize: [42, 52],
    iconAnchor: [21, 52],
  });

  return <div className="public-project-detail-map-shell">
    <MapContainer center={[project.lat, project.lng]} zoom={11} minZoom={4} maxZoom={18} scrollWheelZoom zoomSnap={0.25} wheelPxPerZoomLevel={80} className="public-project-detail-map">
      <TileLayer attribution={siteConfig.map.attribution} url={siteConfig.map.tileUrl} />
      <ScaleControl position="bottomleft" imperial={false} metric />
      <Marker position={[project.lat, project.lng]} icon={icon}>
        <Tooltip permanent={false} direction="top" offset={[0, -45]}><strong>{project.name}</strong><br/>{project.province}</Tooltip>
      </Marker>
    </MapContainer>
  </div>;
}
