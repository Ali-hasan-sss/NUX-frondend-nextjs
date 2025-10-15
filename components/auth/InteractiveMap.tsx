"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (coords: { latitude: number; longitude: number }) => void;
  className?: string;
}

// Interactive map component using Leaflet-like functionality with OpenStreetMap tiles
export function InteractiveMap({
  latitude,
  longitude,
  onLocationSelect,
  className = "",
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState({
    centerLat: latitude || 40.7128,
    centerLng: longitude || -74.0060,
    zoom: 13,
    markerLat: latitude || 0,
    markerLng: longitude || 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (latitude !== 0 && longitude !== 0) {
      setMapState(prev => ({
        ...prev,
        centerLat: latitude,
        centerLng: longitude,
        markerLat: latitude,
        markerLng: longitude,
      }));
    }
  }, [latitude, longitude]);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number, zoom: number) => {
    const scale = Math.pow(2, zoom);
    const x = ((lng + 180) / 360) * (256 * scale);
    const y = ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) * (256 * scale);
    return { x, y };
  };

  // Convert pixel coordinates to lat/lng
  const pixelToLatLng = (x: number, y: number, zoom: number) => {
    const scale = Math.pow(2, zoom);
    const lng = (x / (256 * scale)) * 360 - 180;
    const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / (256 * scale)))) * 180 / Math.PI;
    return { lat, lng };
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to lat/lng using proper map projection
    const mapCenterX = rect.width / 2;
    const mapCenterY = rect.height / 2;
    
    const offsetX = x - mapCenterX;
    const offsetY = y - mapCenterY;
    
    // More accurate conversion using Web Mercator projection
    const scale = Math.pow(2, mapState.zoom);
    const tileSize = 256;
    
    // Convert pixel offset to tile offset
    const tileOffsetX = offsetX / tileSize;
    const tileOffsetY = offsetY / tileSize;
    
    // Convert to lat/lng offset
    const lngOffset = (tileOffsetX / scale) * 360;
    
    // For latitude, we need to account for the Web Mercator projection
    const latOffset = (tileOffsetY / scale) * 360;
    
    const newLat = mapState.centerLat - latOffset;
    const newLng = mapState.centerLng + lngOffset;
    
    // Clamp latitude to valid range
    const clampedLat = Math.max(-85, Math.min(85, newLat));
    const clampedLng = ((newLng + 180) % 360) - 180;
    
    setMapState(prev => ({
      ...prev,
      markerLat: clampedLat,
      markerLng: clampedLng,
    }));
    
    onLocationSelect({ latitude: clampedLat, longitude: clampedLng });
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    
    // Convert drag delta to lat/lng offset using proper projection
    const scale = Math.pow(2, mapState.zoom);
    const tileSize = 256;
    
    // Convert pixel delta to tile delta
    const tileDeltaX = -deltaX / tileSize;
    const tileDeltaY = -deltaY / tileSize;
    
    // Convert to lat/lng offset
    const lngOffset = (tileDeltaX / scale) * 360;
    const latOffset = (tileDeltaY / scale) * 360;
    
    const newCenterLat = mapState.centerLat + latOffset;
    const newCenterLng = mapState.centerLng + lngOffset;
    
    // Clamp latitude to valid range
    const clampedLat = Math.max(-85, Math.min(85, newCenterLat));
    const clampedLng = ((newCenterLng + 180) % 360) - 180;
    
    setMapState(prev => ({
      ...prev,
      centerLat: clampedLat,
      centerLng: clampedLng,
    }));
    
    // Update drag start position for smooth dragging
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(1, Math.min(18, mapState.zoom + delta));
    
    setMapState(prev => ({
      ...prev,
      zoom: newZoom,
    }));
  };

  // Generate tile URLs for OpenStreetMap
  const getTileUrl = (x: number, y: number, z: number) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  // Calculate visible tile range
  const getVisibleTiles = () => {
    const scale = Math.pow(2, mapState.zoom);
    const centerX = ((mapState.centerLng + 180) / 360) * scale;
    const centerY = ((1 - Math.log(Math.tan(mapState.centerLat * Math.PI / 180) + 1 / Math.cos(mapState.centerLat * Math.PI / 180)) / Math.PI) / 2) * scale;
    
    const tilesPerSide = Math.ceil(512 / 256) + 2; // Extra tiles for smooth scrolling
    const startX = Math.floor(centerX - tilesPerSide / 2);
    const startY = Math.floor(centerY - tilesPerSide / 2);
    
    const tiles = [];
    for (let x = startX; x < startX + tilesPerSide; x++) {
      for (let y = startY; y < startY + tilesPerSide; y++) {
        tiles.push({ x, y, z: mapState.zoom });
      }
    }
    return tiles;
  };

  const tiles = getVisibleTiles();

  return (
    <div
      ref={mapRef}
      className={`relative overflow-hidden bg-gray-200 ${className}`}
      onClick={handleMapClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Map tiles */}
      <div className="absolute inset-0">
        {tiles.map((tile, index) => {
          const scale = Math.pow(2, mapState.zoom);
          const tileX = ((tile.x / scale) * 360 - 180);
          const tileY = Math.atan(Math.sinh(Math.PI * (1 - 2 * tile.y / scale))) * 180 / Math.PI;
          
          const centerX = ((mapState.centerLng + 180) / 360) * scale;
          const centerY = ((1 - Math.log(Math.tan(mapState.centerLat * Math.PI / 180) + 1 / Math.cos(mapState.centerLat * Math.PI / 180)) / Math.PI) / 2) * scale;
          
          const offsetX = (tile.x - centerX) * 256;
          const offsetY = (tile.y - centerY) * 256;
          
          return (
            <img
              key={`${tile.x}-${tile.y}-${tile.z}`}
              src={getTileUrl(tile.x, tile.y, tile.z)}
              alt=""
              className="absolute"
              style={{
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(50% + ${offsetY}px)`,
                transform: 'translate(-50%, -50%)',
                width: '256px',
                height: '256px',
              }}
              onError={(e) => {
                // Hide broken tiles
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          );
        })}
      </div>

      {/* Marker */}
      {mapState.markerLat !== 0 && mapState.markerLng !== 0 && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none z-10"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          <div className="relative">
            <MapPin className="h-6 w-6 text-red-500 drop-shadow-lg" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-20">
        <button
          onClick={() => setMapState(prev => ({ ...prev, zoom: Math.min(18, prev.zoom + 1) }))}
          className="w-8 h-8 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center justify-center text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => setMapState(prev => ({ ...prev, zoom: Math.max(1, prev.zoom - 1) }))}
          className="w-8 h-8 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center justify-center text-lg font-bold"
        >
          −
        </button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded z-20">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}

export default InteractiveMap;
