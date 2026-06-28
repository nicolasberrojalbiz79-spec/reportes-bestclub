const ADMIN_PASS = process.env.ADMIN_PASS || "bestclubpeger";

const SEDES = [
  { nombre: "CHACABUCO 472 (Nueva Córdoba)",    clave: process.env.CLAVE_CHACABUCO    || "chaca472"    },
  { nombre: "SAN LORENZO 449 (Nueva Córdoba)",  clave: process.env.CLAVE_SANLORENZO   || "sanlo449"    },
  { nombre: "MONTEVIDEO 362 (Güemes)",          clave: process.env.CLAVE_MONTEVIDEO   || "monte362"    },
  { nombre: "ROSARIO DE SANTA FE 186 (Centro)", clave: process.env.CLAVE_ROSARIO      || "rosario186"  },
  { nombre: "PODESTA COSTA 3236 (Jardín)",      clave: process.env.CLAVE_PODESTA      || "podesta3236" },
  { nombre: "DRAGO 335 (San Fernando)",         clave: process.env.CLAVE_DRAGO        || "drago335"    }
];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, msg: "Método no permitido" });

  const { tipo, clave } = req.body || {};

  if (tipo === "admin") {
    return res.json(clave === ADMIN_PASS
      ? { ok: true, rol: "admin" }
      : { ok: false, msg: "Clave admin incorrecta" });
  }

  for (const sede of SEDES) {
    if (String(sede.clave).trim() === String(clave).trim()) {
      return res.json({ ok: true, rol: "sede", sede: sede.nombre });
    }
  }
  return res.json({ ok: false, msg: "Clave de sede incorrecta" });
}
