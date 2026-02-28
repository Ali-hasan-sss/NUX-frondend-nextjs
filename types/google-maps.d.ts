declare global {
  namespace google.maps {
    class Map {
      constructor(el: HTMLElement, opts?: MapOptions);
      panTo(latLng: LatLngLiteral): void;
      addListener(event: string, handler: (e: MapMouseEvent) => void): void;
    }
    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
    }
    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLngLiteral): void;
      getPosition(): LatLng | null;
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): void;
    }
    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map;
      draggable?: boolean;
    }
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    interface LatLng {
      lat(): number;
      lng(): number;
    }
    interface MapMouseEvent {
      latLng: LatLng | null;
    }
  }
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
  }
}

export {};
