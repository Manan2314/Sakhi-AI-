const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
      } catch (e) {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail || `API Error: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    if (error.message === "Failed to fetch") {
      throw new Error("Unable to connect to the safety server. Please check your internet or if the backend is running.");
    }
    throw error;
  }
};

export const endpoints = {
  // Safety Intelligence
  getSafetyScore: (lat: number, lng: number, userId?: number, prefs?: string) => 
    `/safety-score?lat=${lat}&lng=${lng}${userId ? `&user_id=${userId}` : ""}${prefs ? `&preferences=${prefs}` : ""}`,
  
  getReports: (type?: string) => `/reports${type ? `?type=${type}` : ""}`,
  
  getSafeRoute: (points: string, userId?: number, prefs?: string) => 
    `/safe-route?points=${points}${userId ? `&user_id=${userId}` : ""}${prefs ? `&preferences=${prefs}` : ""}`,
  
  getSafePlaces: (lat: number, lng: number, radius = 2.0) => 
    `/safe-places?lat=${lat}&lng=${lng}&radius=${radius}`,
    
  getAreaInsights: (lat: number, lng: number, radius = 2.0) => 
    `/area-insights?lat=${lat}&lng=${lng}&radius=${radius}`,
    
  extractPreferences: "/extract-preferences",
  
  triggerUnsafe: "/trigger-unsafe",

  // Guardian Mode
  startGuardian: "/guardian/start",
  updateGuardian: "/guardian/update",
  stopGuardian: "/guardian/stop",

  // User System
  createUser: "/user",
  getUser: (id: number) => `/user/${id}`,
  updatePreferences: (id: number) => `/user/${id}/preferences`,
  addContact: (id: number) => `/user/${id}/contacts`,
  getContacts: (id: number) => `/user/${id}/contacts`,
};
