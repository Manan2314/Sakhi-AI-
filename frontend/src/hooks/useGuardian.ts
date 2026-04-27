import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch, endpoints } from "@/lib/api";

export function useGuardian(pos: [number, number] | null) {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [status, setStatus] = useState<any>(null);
  const historyRef = useRef<[number, number][]>([]);

  // Auto-start or maintain session based on local state
  const startGuardian = async () => {
    if (!pos) return;
    const userId = localStorage.getItem("sakhi_user_id");
    if (!userId) {
      alert("Please set up your profile first!");
      return;
    }

    try {
      const res = await apiFetch(endpoints.startGuardian + `?user_id=${userId}&lat=${pos[0]}&lng=${pos[1]}`, {
        method: "POST"
      });
      setSessionId(res.session_id);
      setIsActive(true);
      console.log("Guardian session started", res);
    } catch (err) {
      console.error("Failed to start guardian", err);
    }
  };

  const stopGuardian = async () => {
    if (!sessionId) return;
    try {
      await apiFetch(endpoints.stopGuardian + `?session_id=${sessionId}`, { method: "POST" });
      setIsActive(false);
      setSessionId(null);
      setStatus(null);
      historyRef.current = [];
    } catch (err) {
      console.error("Failed to stop guardian", err);
    }
  };

  const updateLocation = useCallback(async () => {
    if (!isActive || !sessionId || !pos) return;

    try {
      const res = await apiFetch(endpoints.updateGuardian + `?session_id=${sessionId}&lat=${pos[0]}&lng=${pos[1]}`, {
        method: "POST",
        body: JSON.stringify(historyRef.current)
      });
      setStatus(res);
      
      // Update local history (keep last 10 points for behavior analysis)
      historyRef.current = [...historyRef.current, pos].slice(-10);
    } catch (err) {
      console.error("Guardian update failed", err);
    }
  }, [isActive, sessionId, pos]);

  useEffect(() => {
    if (isActive) {
      const timer = setInterval(updateLocation, 10000);
      return () => clearInterval(timer);
    }
  }, [isActive, updateLocation]);

  return { isActive, startGuardian, stopGuardian, status };
}
