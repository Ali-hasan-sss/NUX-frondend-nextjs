"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  loadGoogleMapsLibrary,
  loadGoogleMapsScript,
} from "./googleMapsLoader";

export interface GoogleMapViewProps {
  center: [number, number];
  zoom?: number;
  initialPosition: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
  className?: string;
}

type MapMarker = google.maps.marker.AdvancedMarkerElement | google.maps.Marker;

function setMarkerPosition(marker: MapMarker, position: google.maps.LatLngLiteral) {
  if ("setPosition" in marker) {
    marker.setPosition(position);
    return;
  }

  marker.position = position;
}

function clearMarker(marker: MapMarker) {
  if ("setMap" in marker) {
    marker.setMap(null);
    return;
  }

  marker.map = null;
}

export function GoogleMapView({
  center,
  zoom = 15,
  initialPosition,
  onPositionChange,
  className = "w-full h-[300px] rounded-md",
}: GoogleMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<MapMarker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [lat, lng] = initialPosition || center;

  const setPosition = useCallback(
    (latitude: number, longitude: number) => {
      onPositionChange(latitude, longitude);
      if (markerRef.current) {
        setMarkerPosition(markerRef.current, {
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
    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (!cancelled) setScriptLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setScriptLoaded(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Init map when script loaded and container ready
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google?.maps) return;

    let marker: MapMarker | null = null;
    let cancelled = false;
    const clickListeners: google.maps.MapsEventListener[] = [];

    async function initMap() {
      if (!containerRef.current || !window.google?.maps) return;

      if (
        !window.google.maps.marker?.AdvancedMarkerElement &&
        window.google.maps.importLibrary
      ) {
        await loadGoogleMapsLibrary("marker");
      }
      if (cancelled || !containerRef.current) return;

      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat, lng },
        zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapId: GOOGLE_MAPS_MAP_ID,
      });

      if (window.google.maps.marker?.AdvancedMarkerElement) {
        marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map,
          gmpDraggable: true,
        });

        clickListeners.push(
          marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
            const pos = e.latLng;
            if (pos) onPositionChange(pos.lat(), pos.lng());
          })
        );
      } else {
        marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          draggable: true,
        });

        clickListeners.push(
          marker.addListener("dragend", () => {
            const pos = marker && "getPosition" in marker ? marker.getPosition() : null;
            if (pos) onPositionChange(pos.lat(), pos.lng());
          })
        );
      }

      clickListeners.push(
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          const pos = e.latLng;
          if (pos) setPosition(pos.lat(), pos.lng());
        })
      );

      mapRef.current = map;
      markerRef.current = marker;
    }

    void initMap();

    return () => {
      cancelled = true;
      clickListeners.forEach((listener) => listener.remove());
      if (marker) clearMarker(marker);
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [scriptLoaded]);

  // Update center when prop changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    setMarkerPosition(markerRef.current, { lat: center[0], lng: center[1] });
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
