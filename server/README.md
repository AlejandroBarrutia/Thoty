# Servidor de encuestas de Thoty

Guarda automáticamente en un CSV, dentro de tu propio LXC, las respuestas
de la encuesta que aparece al terminar cada módulo. No usa base de datos
ni dependencias externas: es un solo script de Python (librería estándar)
que escucha solo en `127.0.0.1` y que Caddy expone bajo `/api/encuesta`.

## 1. Copiar los archivos al LXC

Estos archivos ya viven en `server/` dentro del repo de Thoty, así que
un `git pull` en `/var/www/thoty` es suficiente para tenerlos ahí.

## 2. Crear la carpeta de datos (fuera del webroot, para que no sea descargable por HTTP)

```bash
sudo mkdir -p /var/www/thoty-data
sudo chown www-data:www-data /var/www/thoty-data
sudo chmod 750 /var/www/thoty-data
```

## 3. Instalar el servicio systemd

```bash
sudo cp /var/www/thoty/server/thoty-encuesta.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now thoty-encuesta
sudo systemctl status thoty-encuesta   # debe decir "active (running)"
```

Verificación rápida (desde dentro del LXC):

```bash
curl http://127.0.0.1:8787/api/salud
# {"ok": true, "servicio": "thoty-encuesta"}
```

## 4. Agregar la ruta /api/* en tu Caddyfile

Edita tu Caddyfile (normalmente `/etc/caddy/Caddyfile`) y, dentro del
bloque de `thoty.duckdns.org`, agrega un `handle` para `/api/*` **antes**
del bloque que sirve los archivos estáticos. Si hoy tu bloque se ve así:

```caddyfile
thoty.duckdns.org {
    root * /var/www/thoty
    file_server
}
```

Cámbialo a:

```caddyfile
thoty.duckdns.org {
    handle /api/* {
        reverse_proxy 127.0.0.1:8787
    }

    handle {
        root * /var/www/thoty
        file_server
    }
}
```

Si tu Caddyfile ya tiene otras directivas (compresión, encabezados,
logs, etc.), consérvalas — solo hace falta envolver lo existente en un
`handle {}` y agregar el `handle /api/* {}` antes. Si prefieres, pásame
tu Caddyfile actual y te regreso el bloque exacto ya integrado.

Recarga Caddy sin cortar el sitio:

```bash
sudo systemctl reload caddy
# o, si usas el binario directo: caddy reload --config /etc/caddy/Caddyfile
```

## 5. Probar de extremo a extremo

```bash
curl -X POST https://thoty.duckdns.org/api/encuesta \
  -H "Content-Type: application/json" \
  -d '{"modulo":"transferencia","calificaciones":{"facilidad":5,"claridad":4,"realismo":5,"confianza":4,"recomendacion":5},"comentario":"prueba"}'
# {"ok": true}

cat /var/www/thoty-data/encuestas.csv
```

Deberías ver una fila nueva. Desde ese momento, cada vez que alguien
complete la encuesta en el sitio, se agregará automáticamente una fila
a ese CSV — sin que nadie tenga que descargar ni reenviar nada.

## Notas

- El servicio solo escucha en `127.0.0.1`: nunca queda expuesto
  directamente a internet, sin importar el estado del firewall.
- El CSV vive fuera de `/var/www/thoty` (el webroot), así que no es
  descargable desde el navegador.
- El front-end (`assets/js/encuesta.js`) sigue guardando también una
  copia en `sessionStorage` del navegador y ofrece el botón "Descargar
  respuestas de la encuesta" como respaldo local — si el envío al
  servidor falla por cualquier motivo (por ejemplo, mientras pruebas el
  sitio en tu computadora sin este backend corriendo), la experiencia
  del usuario no se rompe, simplemente no queda copia en el servidor.
- Considera respaldar `/var/www/thoty-data/encuestas.csv` de vez en
  cuando (por ejemplo, con un cron que lo copie a otra carpeta), ya que
  hoy es la única copia "dura" de las respuestas del piloto.

## Nota de este despliegue: CSV movido a un share NFS del NAS

En el LXC donde corre este servicio (`ai-inference`, 192.168.68.4), el
CSV **no** vive en `/var/www/thoty-data` como en los pasos genericos de
arriba -- vive en un share NFS del NAS (`Archivos_Compartidos`, montado
en el host Proxmox y expuesto al LXC via bind mount, mismo patron que
otros shares del proyecto), para que las respuestas sobrevivan aunque se
reconstruya el LXC. Reflejado en `thoty-encuesta.service`:

```
Environment=THOTY_ENCUESTA_CSV=/mnt/archivos-compartidos/thoty-encuestas/encuestas.csv
ReadWritePaths=/mnt/archivos-compartidos/thoty-encuestas
```

Si se reconstruye este LXC desde cero, el mount `mp3` (bind mount al
share del NAS) debe recrearse antes de reinstalar el servicio -- de lo
contrario, seguir los pasos genericos de este README (CSV local) tal cual
estan escritos arriba.
