export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not set" });
  }
  try {
    const { messages, system } = req.body;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        messages: [
          { role: "system", content: system },
          ...messages
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || "Groq error" });
    }
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "…";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
