export async function POST(request) {
  const GEMINI_KEY = "AIzaSyBkgngp3t_SzzhVuvnI7STqSrXGEJx6U6c";

  try {
    const { prompt } = await request.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();

    // Manejar errores de la API de Gemini
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: "Respuesta vacía de Gemini" }, { status: 500 });
    }

    return Response.json({ summary: text });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
