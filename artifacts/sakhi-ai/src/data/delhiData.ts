export type PlaceType = "hospital" | "police" | "metro" | "landmark" | "pharmacy";

export interface SafePlace {
  name: string;
  pos: [number, number];
  type: PlaceType;
  address: string;
  phone?: string;
}

export interface DangerZone {
  name: string;
  pos: [number, number];
  radius: number;
  reason: string;
}

export interface DelhiDestination {
  name: string;
  address: string;
  pos: [number, number];
  safe: boolean;
}

export const DELHI_SAFE_PLACES: SafePlace[] = [
  { name: "AIIMS Hospital", pos: [28.5676, 77.2100], type: "hospital", address: "Ansari Nagar, New Delhi", phone: "011-26588500" },
  { name: "Safdarjung Hospital", pos: [28.5688, 77.2040], type: "hospital", address: "Safdarjung Enclave, New Delhi", phone: "011-24673012" },
  { name: "Ram Manohar Lohia Hospital", pos: [28.6272, 77.1990], type: "hospital", address: "Baba Kharak Singh Marg, New Delhi", phone: "011-23404000" },
  { name: "Apollo Hospital Delhi", pos: [28.5527, 77.2773], type: "hospital", address: "Mathura Road, New Delhi", phone: "011-71791090" },

  { name: "Connaught Place Police Station", pos: [28.6329, 77.2195], type: "police", address: "Connaught Place, New Delhi", phone: "011-23340000" },
  { name: "Lajpat Nagar Police Station", pos: [28.5672, 77.2432], type: "police", address: "Lajpat Nagar, New Delhi", phone: "011-29836018" },
  { name: "Saket Police Station", pos: [28.5203, 77.2150], type: "police", address: "Saket, New Delhi", phone: "011-29562400" },
  { name: "Karol Bagh Police Station", pos: [28.6524, 77.1889], type: "police", address: "Karol Bagh, New Delhi", phone: "011-28752345" },
  { name: "Hauz Khas Police Station", pos: [28.5494, 77.2001], type: "police", address: "Hauz Khas, New Delhi", phone: "011-26183020" },

  { name: "Rajiv Chowk Metro Station", pos: [28.6331, 77.2194], type: "metro", address: "Connaught Place, New Delhi" },
  { name: "Kashmere Gate Metro Station", pos: [28.6673, 77.2285], type: "metro", address: "Kashmere Gate, New Delhi" },
  { name: "Saket Metro Station", pos: [28.5224, 77.2188], type: "metro", address: "Saket, South Delhi" },
  { name: "Hauz Khas Metro Station", pos: [28.5434, 77.2066], type: "metro", address: "Hauz Khas, South Delhi" },
  { name: "Karol Bagh Metro Station", pos: [28.6516, 77.1893], type: "metro", address: "Karol Bagh, New Delhi" },

  { name: "India Gate", pos: [28.6129, 77.2295], type: "landmark", address: "Rajpath, New Delhi" },
  { name: "Red Fort", pos: [28.6562, 77.2410], type: "landmark", address: "Netaji Subhash Marg, Old Delhi" },
];

export const DELHI_DANGER_ZONES: DangerZone[] = [
  { name: "G.B. Road Area", pos: [28.6551, 77.2272], radius: 400, reason: "High crime rate reported at night" },
  { name: "Paharganj Back Lanes", pos: [28.6440, 77.2100], radius: 350, reason: "Frequent harassment reports after 10pm" },
  { name: "Sanjay Colony", pos: [28.5285, 77.3021], radius: 500, reason: "Poor lighting and isolated lanes" },
  { name: "Sangam Vihar Night Market", pos: [28.5006, 77.2498], radius: 450, reason: "Unsafe transport zone reported" },
  { name: "Trilokpuri Block 20", pos: [28.6157, 77.3197], radius: 400, reason: "Multiple community safety alerts" },
];

export const DELHI_DESTINATIONS: DelhiDestination[] = [
  { name: "Lajpat Nagar Market", address: "Lajpat Nagar, New Delhi", pos: [28.5720, 77.2432], safe: true },
  { name: "Saket Metro Station", address: "Saket, South Delhi", pos: [28.5224, 77.2188], safe: true },
  { name: "Hauz Khas Village", address: "Hauz Khas, South Delhi", pos: [28.5494, 77.2001], safe: false },
  { name: "Connaught Place", address: "CP, New Delhi", pos: [28.6289, 77.2065], safe: true },
  { name: "India Gate", address: "Rajpath, New Delhi", pos: [28.6129, 77.2295], safe: true },
  { name: "Karol Bagh Market", address: "Karol Bagh, New Delhi", pos: [28.6511, 77.1900], safe: true },
  { name: "AIIMS Hospital", address: "Ansari Nagar, New Delhi", pos: [28.5676, 77.2100], safe: true },
  { name: "New Delhi Railway Station", address: "Paharganj, New Delhi", pos: [28.6426, 77.2196], safe: true },
  { name: "Nehru Place", address: "South Delhi", pos: [28.5485, 77.2519], safe: false },
  { name: "Select Citywalk Mall", address: "Saket, New Delhi", pos: [28.5268, 77.2184], safe: true },
  { name: "Dilli Haat", address: "INA, New Delhi", pos: [28.5731, 77.2063], safe: true },
  { name: "Lodhi Garden", address: "Lodhi Road, New Delhi", pos: [28.5918, 77.2273], safe: true },
  { name: "Rashtrapati Bhavan", address: "Raisina Hill, New Delhi", pos: [28.6143, 77.1993], safe: true },
  { name: "Red Fort", address: "Netaji Subhash Marg, Old Delhi", pos: [28.6562, 77.2410], safe: true },
  { name: "Qutub Minar", address: "Mehrauli, New Delhi", pos: [28.5245, 77.1855], safe: true },
];

export function generateRoute(from: [number, number], to: [number, number], routeType: number): [number, number][] {
  const steps = 8;
  const points: [number, number][] = [from];

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const lat = from[0] + (to[0] - from[0]) * t;
    const lng = from[1] + (to[1] - from[1]) * t;

    const offsetScale = routeType === 0 ? 0.004 : routeType === 1 ? 0.002 : 0.006;
    const wave = Math.sin(t * Math.PI * 2) * offsetScale * (routeType === 0 ? 1 : -1);
    const jitter = (Math.random() - 0.5) * 0.001;

    points.push([lat + wave + jitter * (routeType + 1), lng + wave * 0.5 + jitter]);
  }

  points.push(to);
  return points;
}

export function getDistanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
