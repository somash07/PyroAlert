import { useState } from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeolocationHook {
  isLoading: boolean;
  position: Coordinates | null;
  error: string | null;
  getPosition: () => Promise<Coordinates | null>;
}

export default function useGeolocation(
  defaultPosition: Coordinates | null = null
): GeolocationHook {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<Coordinates | null>(defaultPosition);
  const [error, setError] = useState<string | null>(null);

  function getPosition(): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Please enable location");
        resolve(null);
        return;
      }
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          setIsLoading(false);
          setError(null);
          resolve(coords);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
          resolve(null);
        }
      );
    });
  }

  return { isLoading, position, error, getPosition };
}
