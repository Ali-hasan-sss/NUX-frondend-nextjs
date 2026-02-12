"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon in Next.js/webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export interface LeafletMapViewProps {
  center: [number, number];
  zoom?: number;
  initialPosition: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
  className?: string;
}

export function LeafletMapView({
  center,
  zoom = 15,
  initialPosition,
  onPositionChange,
  className = "w-full h-[300px] rounded-md",
}: LeafletMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setPosition = useCallback(
    (lat: number, lng: number) => {
      onPositionChange(lat, lng);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      }
    },
    [onPositionChange]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const [lat, lng] = initialPosition || center;
    const map = L.map(containerRef.current).setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    mapRef.current = map;

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPosition(lat, lng);
    });
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onPositionChange(pos.lat, pos.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // When center prop changes (e.g. from "Get my location" or search), move map and marker
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const [lat, lng] = center;
    markerRef.current.setLatLng(center);
    mapRef.current.invalidateSize();
    mapRef.current.flyTo(center, mapRef.current.getZoom(), { duration: 800 });
  }, [center[0], center[1]]);

  return <div ref={containerRef} className={className} />;
}
