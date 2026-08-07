/* =========================================================
   THOTY — encuesta.js
   Funciones compartidas para la encuesta de satisfacción que
   aparece al terminar cada módulo. Todo se guarda ÚNICAMENTE
   en sessionStorage (se pierde al cerrar la pestaña/navegador),
   sin backend. Para uso en piloto, cada participante puede
   descargar sus propias respuestas como un archivo CSV local.
   ========================================================= */

const THOTY_ENCUESTAS_KEY = "thoty_encuestas";

/** Lee el valor (1-5) del grupo de estrellas marcado, o null si no se marcó ninguna. */
function leerEstrellas(nombreGrupo) {
  const marcado = document.querySelector(`input[name="${nombreGrupo}"]:checked`);
  return marcado ? parseInt(marcado.value, 10) : null;
}

/**
 * Agrega una respuesta de encuesta. Se guarda SIEMPRE una copia local en
 * sessionStorage (respaldo de esta sesión, con botón de descarga), y
 * además se intenta enviar al servidor propio en /api/encuesta para que
 * quede guardada automáticamente en el CSV del LXC. Si el envío falla
 * (por ejemplo al probar el sitio localmente sin ese backend corriendo),
 * no se interrumpe ni se muestra error al usuario: solo queda el respaldo local.
 */
function guardarEncuesta(modulo, calificaciones, comentario) {
  const registro = {
    modulo,
    fecha: new Date().toISOString(),
    nombre: sessionStorage.getItem("thoty_nombre") || "",
    edad: sessionStorage.getItem("thoty_edad") || "",
    calificaciones,
    comentario: (comentario || "").trim(),
  };

  const lista = JSON.parse(sessionStorage.getItem(THOTY_ENCUESTAS_KEY) || "[]");
  lista.push(registro);
  sessionStorage.setItem(THOTY_ENCUESTAS_KEY, JSON.stringify(lista));

  if (typeof fetch === "function") {
    fetch("/api/encuesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
    }).catch(() => {
      console.warn("[thoty] No se pudo enviar la encuesta al servidor; se guardó localmente en esta sesión.");
    });
  }

  return lista.length;
}

/** Devuelve cuántas respuestas de encuesta hay guardadas en esta sesión. */
function contarEncuestas() {
  return JSON.parse(sessionStorage.getItem(THOTY_ENCUESTAS_KEY) || "[]").length;
}

/** Genera y descarga un CSV local con todas las respuestas guardadas en esta sesión. */
function descargarEncuestas() {
  const lista = JSON.parse(sessionStorage.getItem(THOTY_ENCUESTAS_KEY) || "[]");
  if (lista.length === 0) {
    alert("Todavía no hay respuestas de encuesta guardadas en esta sesión.");
    return;
  }

  const encabezados = [
    "modulo", "fecha", "nombre", "edad",
    "facilidad_uso", "claridad_explicaciones", "realismo", "confianza_ganada", "recomendacion",
    "intencion_pago",
    "comentario",
  ];

  const escaparCsv = (valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`;

  const filas = lista.map((r) => [
    r.modulo,
    r.fecha,
    r.nombre,
    r.edad,
    r.calificaciones?.facilidad ?? "",
    r.calificaciones?.claridad ?? "",
    r.calificaciones?.realismo ?? "",
    r.calificaciones?.confianza ?? "",
    r.calificaciones?.recomendacion ?? "",
    r.calificaciones?.intencion_pago ?? "",
    r.comentario,
  ].map(escaparCsv).join(","));

  const csv = [encabezados.join(","), ...filas].join("\r\n");
  // BOM al inicio para que Excel abra los acentos correctamente.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `thoty_encuestas_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
