const OLLAMA_API_KEY = "1217e116b04b4671a90a0f14ea3836ad.cwuLfyMLRiuLz3iLerYpSo20";
const OLLAMA_CHAT_URL = "https://ollama.com/v1/chat/completions";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authorization = request.headers.get("authorization") || `Bearer ${OLLAMA_API_KEY}`;
  const upstream = await fetch(OLLAMA_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: await request.text(),
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const config = {
  path: "/api/ollama/v1/chat/completions",
};
