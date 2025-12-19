export default async function handler(req, res) {
  // CORS (necessário se seu Lovable estiver em outro domínio)
  res.setHeader("Access-Control-Allow-Origin", "*"); // depois troque pelo seu domínio
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const apiKey = process.env.OPENAI_API_KEY;
  const workflowId = process.env.CHATKIT_WORKFLOW_ID;

  if (!apiKey || !workflowId) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY or CHATKIT_WORKFLOW_ID" });
  }

  const user = (req.body && req.body.user) ? req.body.user : "anon";

  const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(r.status).json(data);

  return res.status(200).json({ client_secret: data.client_secret });
}
