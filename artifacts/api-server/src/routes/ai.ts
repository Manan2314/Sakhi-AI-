import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.post("/ai/safety-insight", async (req, res) => {
  try {
    const { latitude, longitude, area, riskLevel, timeOfDay } = req.body as {
      latitude?: number;
      longitude?: number;
      area?: string;
      riskLevel?: string;
      timeOfDay?: string;
    };

    const locationInfo = area
      ? `${area}, Delhi`
      : latitude && longitude
      ? `coordinates ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E in Delhi`
      : "Delhi, India";

    const prompt = `You are Sakhi AI, a women's safety assistant for Delhi, India.
A woman is currently at ${locationInfo} (risk level: ${riskLevel ?? "moderate"}, time: ${timeOfDay ?? "unknown"}).

Provide a SHORT, actionable safety insight for her current location. Include:
1. One specific safety tip for this area/time
2. The nearest type of safety resource she should know about (police, hospital, metro)
3. One precaution to take right now

Keep your response under 80 words. Be direct, reassuring, and practical. Use "you" to address her directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 200 },
    });

    const insight = response.text ?? "Stay aware of your surroundings and keep emergency contacts ready.";

    const tipsPrompt = `List exactly 3 short safety tips (max 8 words each) for a woman currently in ${locationInfo} at ${timeOfDay ?? "this time"}. Return only a JSON array of strings. Example: ["Stay near well-lit areas","Keep phone charged","Share your live location"]`;

    const tipsResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: tipsPrompt }] }],
      config: { maxOutputTokens: 150, responseMimeType: "application/json" },
    });

    let tips: string[] = [
      "Stay in well-lit, crowded areas",
      "Keep your phone charged and accessible",
      "Share your live location with a trusted contact",
    ];

    try {
      const parsed = JSON.parse(tipsResponse.text ?? "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        tips = parsed.slice(0, 3);
      }
    } catch {
    }

    res.json({ insight, tips });
  } catch (err) {
    console.error("AI safety insight error:", err);
    res.json({
      insight: "Stay in well-lit, crowded areas. Keep emergency contacts on speed dial.",
      tips: [
        "Stay near well-lit areas",
        "Keep emergency contacts ready",
        "Share live location with someone you trust",
      ],
    });
  }
});

export default router;
