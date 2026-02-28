"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export interface GoogleMapViewProps {
  center: [number, number];
  zoom?: number;
  initialPosition: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
  className?: string;
}


export function GoogleMapView({
  center,
  zoom = 15,
  initialPosition,
  onPositionChange,
  className = "w-full h-[300px] rounded-md",
}: GoogleMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [lat, lng] = initialPosition || center;

  const setPosition = useCallback(
    (latitude: number, longitude: number) => {
      onPositionChange(latitude, longitude);
      if (markerRef.current) {
        markerRef.current.setPosition({
          lat: latitude,
          lng: longitude,
        });
      }
      if (mapRef.current) {
        mapRef.current.panTo({ lat: latitude, lng: longitude });
      }
    },
    [onPositionChange]
  );

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || typeof window === "undefined") return;
    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }
    const id = "google-maps-script";
    if (document.getElementById(id)) {
      if (window.google?.maps) setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  // Init map when script loaded and container ready
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: { lat, lng },
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
    });

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      const pos = e.latLng;
      if (pos) setPosition(pos.lat(), pos.lng());
    });
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) onPositionChange(pos.lat(), pos.lng());
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.setMap(null);
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [scriptLoaded]);

  // Update center when prop changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setPosition({ lat: center[0], lng: center[1] });
    mapRef.current.panTo({ lat: center[0], lng: center[1] });
  }, [center[0], center[1]]);

  if (!GOOGLE_MAPS_API_KEY) return null;
  if (!scriptLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground text-sm`}>
        Loading map...
      </div>
    );
  }
  return <div ref={containerRef} className={className} />;
}
