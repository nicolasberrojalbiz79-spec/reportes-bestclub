const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const SEDES = [
  "CHACABUCO 472 (Nueva Córdoba)",
  "SAN LORENZO 449 (Nueva Córdoba)",
  "MONTEVIDEO 362 (Güemes)",
  "ROSARIO DE SANTA FE 186 (Centro)",
  "PODESTA COSTA 3236 (Jardín)",
  "DRAGO 335 (San Fernando)"
];

async function query(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const [secretarios, objetivos, reportes] = await Promise.all([
      query("secretarios", "order=sede"),
      query("objetivos", "order=mes"),
      query("reportes", "order=timestamp")
    ]);
    return res.json({ ok: true, sedes: SEDES, secretarios, objetivos, reportes });
  } catch (e) {
    return res.json({ ok: false, msg: e.message, sedes: SEDES, secretarios: [], objetivos: [], reportes: [] });
  }
}
