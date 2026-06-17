/**
 * Client-side service for Google Generative AI (Gemini) Advisor in AISO.
 * Keeps keys safe on the server-side to prevent exposing process.env.GEMINI_API_KEY.
 */
export async function generateAisoAdvice(context: string): Promise<string> {
  const response = await fetch("/api/gemini-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ context }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro de rede: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.text || "Nenhuma recomendação gerada.";
}
