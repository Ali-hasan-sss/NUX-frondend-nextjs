"use client";

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
export const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

let googleMapsScriptPromise: Promise<void> | null = null;

function isMapsReady() {
  return typeof window !== "undefined" && typeof window.google?.maps?.Map === "function";
}

function waitForMapsReady(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (isMapsReady()) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("Google Maps JavaScript API did not finish loading."));
        return;
      }

      window.setTimeout(check, 50);
    };

    check();
  });
}

export function loadGoogleMapsScript(): Promise<void> {
  if (!GOOGLE_MAPS_API_KEY || typeof window === "undefined") {
    return Promise.resolve();
  }

  if (isMapsReady()) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const id = "google-maps-script";
    const existingScript = document.getElementById(id) as HTMLScriptElement | null;

    const finish = () => {
      waitForMapsReady().then(resolve).catch(reject);
    };

    if (existingScript) {
      existingScript.addEventListener("load", finish, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      finish();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places,marker&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

export async function loadGoogleMapsLibrary(
  name: "maps" | "marker" | "places"
): Promise<void> {
  await loadGoogleMapsScript();

  if (window.google.maps.importLibrary) {
    await window.google.maps.importLibrary(name);
  }
}

export async function findPlaceLocation(
  query: string
): Promise<{ lat: number; lng: number; label: string | null } | null> {
  if (!query.trim()) return null;

  await loadGoogleMapsLibrary("places");

  return new Promise((resolve) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.findPlaceFromQuery(
      {
        query: query.trim(),
        fields: ["name", "formatted_address", "geometry"],
      },
      (results, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !results?.[0]?.geometry?.location
        ) {
          resolve(null);
          return;
        }

        const place = results[0];
        const location = place.geometry?.location;

        if (!location) {
          resolve(null);
          return;
        }

        resolve({
          lat: location.lat(),
          lng: location.lng(),
          label: place.formatted_address || place.name || query.trim(),
        });
      }
    );
  });
}
