import { useState, useEffect, useCallback } from "react";

const DEFAULT_FALLBACK: [number, number] = [28.6329, 77.2195];

export interface GeolocationState {
  position: [number, number] | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useGeolocation(autoStart = true) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const watchIdRef = { current: -1 };

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, position: DEFAULT_FALLBACK, loading: false, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: [pos.coords.latitude, pos.coords.longitude],
          accuracy: pos.coords.accuracy,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          position: DEFAULT_FALLBACK,
          accuracy: null,
          loading: false,
          error: denied ? "Location permission denied — using fallback location" : err.message,
          permissionDenied: denied,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    watchIdRef.current = id;
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return () => {
      if (watchIdRef.current !== -1) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { ...state, start };
}
