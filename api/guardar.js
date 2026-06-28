const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabase(method, table, body, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=minimal"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  try { return await res.json(); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { accion, data } = req.body || {};

  try {
    if (accion === "guardarReporte") {
      data.id = "R" + Date.now();
      data.timestamp = new Date().toISOString();
      await supabase("POST", "reportes", data);
      return res.json({ ok: true, id: data.id });
    }

    if (accion === "guardarObjetivos") {
      // Upsert: si ya existe mes+sede lo actualiza, si no lo crea
      await supabase("POST", "objetivos", data, "on_conflict=mes,sede");
      // Propagar diasHabiles a todas las filas del mismo mes
      if (data.diasHabiles) {
        await supabase("PATCH", "objetivos", { diasHabiles: data.diasHabiles }, `mes=eq.${encodeURIComponent(data.mes)}`);
      }
      return res.json({ ok: true });
    }

    if (accion === "guardarSecretarios") {
      // Borra todos y vuelve a insertar
      await supabase("DELETE", "secretarios", undefined, "id=gte.0");
      for (const s of data) {
        await supabase("POST", "secretarios", s);
      }
      return res.json({ ok: true });
    }

    if (accion === "editarReporte") {
      const { id, cambios, quienEdita, comentario } = data;
      await supabase("PATCH", "reportes", cambios, `id=eq.${id}`);
      await supabase("POST", "ediciones", {
        timestamp: new Date().toISOString(),
        sede: cambios.sede || "",
        secretario: quienEdita || "",
        reporteId: id,
        campo: "edicion",
        valorAnterior: "",
        valorNuevo: JSON.stringify(cambios),
        comentario: comentario || ""
      });
      return res.json({ ok: true });
    }

    return res.status(400).json({ ok: false, msg: "Acción desconocida" });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: e.message });
  }
}
