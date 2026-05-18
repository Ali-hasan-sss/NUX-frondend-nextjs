declare global {
  namespace google.maps {
    class Map {
      constructor(el: HTMLElement, opts?: MapOptions);
      panTo(latLng: LatLngLiteral): void;
      addListener(
        event: string,
        handler: (e: MapMouseEvent) => void
      ): MapsEventListener;
    }
    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      mapId?: string;
    }
    interface MapsEventListener {
      remove(): void;
    }
    const importLibrary:
      | ((name: "maps" | "marker" | "places") => Promise<unknown>)
      | undefined;
    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLngLiteral): void;
      getPosition(): LatLng | null;
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): MapsEventListener;
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
    namespace marker {
      class AdvancedMarkerElement {
        constructor(opts?: AdvancedMarkerElementOptions);
        position?: LatLngLiteral;
        map: Map | null;
        addListener(
          event: string,
          handler: (e: MapMouseEvent) => void
        ): MapsEventListener;
      }
      interface AdvancedMarkerElementOptions {
        position?: LatLngLiteral;
        map?: Map;
        gmpDraggable?: boolean;
      }
    }
    namespace places {
      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map);
        findPlaceFromQuery(
          request: FindPlaceFromQueryRequest,
          callback: (
            results: PlaceResult[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }
      enum PlacesServiceStatus {
        OK = "OK",
      }
      interface FindPlaceFromQueryRequest {
        query: string;
        fields: string[];
      }
      interface PlaceResult {
        name?: string;
        formatted_address?: string;
        geometry?: {
          location?: LatLng;
        };
      }
    }
  }
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
  }
}

export {};
