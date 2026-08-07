#!/usr/bin/env python3
"""
THOTY - servidor minimo para recibir respuestas de la encuesta de
satisfaccion y guardarlas en un CSV local. Sin dependencias externas,
solo la biblioteca estandar de Python 3 (no requiere pip install).

Diseñado para correr detras de Caddy como reverse_proxy, escuchando
UNICAMENTE en 127.0.0.1 (nunca expuesto directamente a internet;
el firewall/ufw ya bloquea todo lo que no sea 80/443 desde fuera,
pero además este proceso ni siquiera abre un puerto público).

Uso:
    python3 encuesta_server.py

Variables de entorno opcionales:
    THOTY_ENCUESTA_PUERTO   puerto donde escucha (default: 8787)
    THOTY_ENCUESTA_CSV      ruta del archivo CSV
                            (default: /var/www/thoty-data/encuestas.csv)
"""

import csv
import json
import os
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PUERTO = int(os.environ.get("THOTY_ENCUESTA_PUERTO", "8787"))
RUTA_CSV = os.environ.get("THOTY_ENCUESTA_CSV", "/var/www/thoty-data/encuestas.csv")
HOST = "127.0.0.1"  # nunca 0.0.0.0: solo el propio servidor (Caddy) debe llegar aquí

CAMPOS = [
    "modulo", "fecha_recibido_utc", "fecha_navegador", "nombre", "edad",
    "facilidad_uso", "claridad_explicaciones", "realismo",
    "confianza_ganada", "recomendacion", "intencion_pago", "comentario",
]

MODULOS_VALIDOS = {"transferencia", "pago-servicios", "phishing"}

_lock_csv = threading.Lock()


def sanitizar_texto(valor, longitud_maxima):
    """Recorta el texto y evita inyección de fórmulas si alguien abre
    el CSV en Excel/Sheets (un valor que empieza con =, +, -, @ se
    interpretaría como fórmula)."""
    texto = "" if valor is None else str(valor)
    texto = texto.replace("\r", " ").replace("\n", " ").strip()[:longitud_maxima]
    if texto[:1] in ("=", "+", "-", "@"):
        texto = "'" + texto
    return texto


def calificacion_valida(valor):
    try:
        n = int(valor)
    except (TypeError, ValueError):
        return ""
    return n if 1 <= n <= 5 else ""


def asegurar_csv():
    directorio = os.path.dirname(RUTA_CSV)
    if directorio:
        os.makedirs(directorio, exist_ok=True)
    if not os.path.exists(RUTA_CSV):
        # utf-8-sig SOLO en la creación: escribe el BOM una vez al inicio
        # del archivo para que Excel muestre bien los acentos.
        with open(RUTA_CSV, "w", newline="", encoding="utf-8-sig") as f:
            csv.writer(f).writerow(CAMPOS)


def agregar_fila(fila):
    with _lock_csv:
        asegurar_csv()
        # utf-8 normal aquí (SIN -sig): ya existe el BOM al inicio del
        # archivo, no queremos repetirlo en cada fila nueva.
        with open(RUTA_CSV, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(fila)


class Handler(BaseHTTPRequestHandler):
    def _responder(self, status, cuerpo):
        data = json.dumps(cuerpo).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.rstrip("/") == "/api/salud":
            self._responder(200, {"ok": True, "servicio": "thoty-encuesta"})
        else:
            self._responder(404, {"ok": False, "error": "ruta no encontrada"})

    def do_POST(self):
        if self.path.rstrip("/") != "/api/encuesta":
            self._responder(404, {"ok": False, "error": "ruta no encontrada"})
            return

        try:
            largo = int(self.headers.get("Content-Length", 0))
            if largo <= 0 or largo > 20000:
                raise ValueError("cuerpo vacío o demasiado grande")
            cuerpo = json.loads(self.rfile.read(largo).decode("utf-8"))
        except Exception:
            self._responder(400, {"ok": False, "error": "JSON inválido"})
            return

        modulo = str(cuerpo.get("modulo", ""))[:40]
        if modulo not in MODULOS_VALIDOS:
            self._responder(400, {"ok": False, "error": "módulo inválido"})
            return

        calif = cuerpo.get("calificaciones") or {}
        if not isinstance(calif, dict):
            calif = {}

        fila = [
            modulo,
            datetime.now(timezone.utc).isoformat(),
            sanitizar_texto(cuerpo.get("fecha"), 40),
            sanitizar_texto(cuerpo.get("nombre"), 80),
            sanitizar_texto(cuerpo.get("edad"), 20),
            calificacion_valida(calif.get("facilidad")),
            calificacion_valida(calif.get("claridad")),
            calificacion_valida(calif.get("realismo")),
            calificacion_valida(calif.get("confianza")),
            calificacion_valida(calif.get("recomendacion")),
            calificacion_valida(calif.get("intencion_pago")),
            sanitizar_texto(cuerpo.get("comentario"), 1000),
        ]

        try:
            agregar_fila(fila)
        except OSError as err:
            self._responder(500, {"ok": False, "error": f"no se pudo guardar: {err}"})
            return

        self._responder(200, {"ok": True})

    def log_message(self, formato, *args):
        # Log breve a stdout; systemd/journalctl lo captura automáticamente.
        print(f"[thoty-encuesta] {self.address_string()} - {formato % args}")


if __name__ == "__main__":
    asegurar_csv()
    servidor = ThreadingHTTPServer((HOST, PUERTO), Handler)
    print(f"[thoty-encuesta] escuchando en http://{HOST}:{PUERTO}  ->  {RUTA_CSV}")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
