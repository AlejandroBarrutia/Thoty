/* =========================================================
   THOTY — phishing.js
   Práctica: tutorial guiado sobre phishing/estafas + bandeja
   de mensajes de práctica con retroalimentación inmediata.
   Todo en memoria de sesión, sin backend.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const vistas = {
    intro: document.getElementById("vista-intro"),
    tutorial: document.getElementById("vista-tutorial"),
    exitoTutorial: document.getElementById("vista-exito-tutorial"),
    practica: document.getElementById("vista-practica"),
    exitoFinal: document.getElementById("vista-exito-final"),
    encuesta: document.getElementById("vista-encuesta"),
    cierre: document.getElementById("vista-cierre"),
  };

  function mostrar(nombreVista) {
    Object.values(vistas).forEach((v) => v.classList.add("oculto"));
    vistas[nombreVista].classList.remove("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Navegación entre pantallas ----------
  document.getElementById("btnIniciar").addEventListener("click", () => {
    mostrar("tutorial");
    irAPaso(1);
  });
  document.getElementById("btnIrPractica").addEventListener("click", () => mostrar("practica"));
  document.getElementById("btnRepetir").addEventListener("click", () => {
    construirBandeja();
    document.getElementById("formEncuesta").reset();
    mostrar("practica");
  });

  // ---------- TUTORIAL GUIADO ----------
  const pasosTutorial = [
    {
      id: "1",
      titulo: "¿Qué es el phishing?",
      texto: "Es cuando alguien se hace pasar por tu banco o por una empresa conocida para robarte tu información o tu dinero. Vamos a ver, uno por uno, los disfraces que más usan.",
      figura: "explicando",
    },
    {
      id: "2",
      titulo: "Correos falsos",
      texto: "Los correos falsos copian el logo y el formato de tu banco casi a la perfección. La diferencia está en los detalles: el dominio del remitente, la urgencia del mensaje y hacia dónde apunta realmente el enlace.",
      figura: "pensativo",
    },
    {
      id: "3",
      titulo: "SMS y WhatsApp falsos (smishing)",
      texto: "Llegan por SMS con enlaces cortos o premios falsos. Por WhatsApp, incluso se hacen pasar por una persona real del banco y te piden el código que te acaba de llegar por SMS.",
      figura: "sorprendido",
    },
    {
      id: "4",
      titulo: "Llamadas falsas (vishing)",
      texto: "Te llaman diciendo que son del banco y que, para \"cancelar\" una operación sospechosa, necesitan el código que te acaba de llegar por SMS. Ese código es justo lo que les falta para completar el robo.",
      figura: "desaprobando",
    },
    {
      id: "5",
      titulo: "Cuentas y comprobantes falsos",
      texto: "En compras o ventas en línea, es común recibir una captura de pantalla como si fuera un comprobante de depósito, antes de que el dinero realmente llegue a tu cuenta.",
      figura: "confundido",
    },
    {
      id: "6",
      titulo: "Las reglas de oro",
      texto: "Con esto ya conoces los disfraces más comunes. Estas reglas te van a proteger casi siempre.",
      figura: "aprobando",
    },
  ];

  let pasoActual = 1;

  function irAPaso(n) {
    pasoActual = n;
    const paso = pasosTutorial[n - 1];

    document.querySelectorAll(".tutorial-paso").forEach((el) => {
      el.classList.toggle("oculto", el.dataset.paso !== paso.id);
    });

    document.getElementById("thotGuiaTitulo").textContent = paso.titulo;
    document.getElementById("thotGuiaTexto").textContent = paso.texto;
    document.getElementById("thotGuiaFigura").src = `../assets/img/thot-${paso.figura}.png`;

    document.querySelectorAll(".stepper__paso").forEach((el) => {
      const numero = parseInt(el.dataset.paso, 10);
      el.classList.remove("completo", "actual");
      if (numero < n) el.classList.add("completo");
      else if (numero === n) el.classList.add("actual");
    });
    document.getElementById("stepperTexto").textContent = `Paso ${n} de ${pasosTutorial.length}`;

    document.getElementById("btnAtras").disabled = n === 1;
    document.getElementById("btnSiguiente").textContent = n === pasosTutorial.length ? "Ir a practicar" : "Siguiente";
  }

  document.getElementById("btnSiguiente").addEventListener("click", () => {
    if (pasoActual < pasosTutorial.length) {
      irAPaso(pasoActual + 1);
    } else {
      mostrar("exitoTutorial");
    }
  });

  document.getElementById("btnAtras").addEventListener("click", () => {
    if (pasoActual > 1) irAPaso(pasoActual - 1);
  });

  // ---------- PRÁCTICA REAL: bandeja de mensajes ----------

  const mensajes = [
    {
      canal: "Correo",
      icono: "✉️",
      remitente: "BBVA México <notificaciones@bbva-mx-verificacion.com>",
      cuerpo: "Asunto: Tu cuenta será suspendida en 24 horas. Estimado cliente, detectamos actividad inusual en tu cuenta. Da clic aquí para verificar tus datos y evitar la suspensión: bbva-mx-verificacion.com/login",
      esPhishing: true,
      explicacion: "Es phishing: el dominio no es bbva.mx, genera miedo con una \"suspensión\" y te pide hacer clic para \"verificar tus datos\".",
    },
    {
      canal: "SMS",
      icono: "💬",
      remitente: "BBVA",
      cuerpo: "BBVA: Detectamos un cargo de $850.00 en tu tarjeta terminación 4521 el 05/08/2026. Si no reconoces este cargo, comunícate al 55 5226 2663 (el número oficial que está en el reverso de tu tarjeta).",
      esPhishing: false,
      explicacion: "Es un mensaje seguro: solo te informa un movimiento y te pide llamar al número oficial que ya conoces, sin pedirte datos ni incluir enlaces.",
    },
    {
      canal: "WhatsApp",
      icono: "🟢",
      remitente: "Ana - Soporte BBVA",
      cuerpo: "Hola 👋 Soy Ana, del área de seguridad de BBVA. Notamos actividad sospechosa en tu cuenta. Para protegerte, compárteme el código de 6 dígitos que te acaba de llegar por SMS.",
      esPhishing: true,
      explicacion: "Es phishing: ningún banco te contacta por WhatsApp para pedirte un código de verificación. Ese código es la llave para robarte, no para \"protegerte\".",
    },
    {
      canal: "Correo",
      icono: "✉️",
      remitente: "BBVA México <no-reply@bbva.mx>",
      cuerpo: "Asunto: Tu estado de cuenta de julio ya está disponible. Hola, tu estado de cuenta del mes de julio ya puede consultarse desde la App BBVA o iniciando sesión en bbva.mx. No es necesario compartir ninguna contraseña por este medio.",
      esPhishing: false,
      explicacion: "Es un correo seguro: viene del dominio oficial bbva.mx, no pide clics urgentes ni información confidencial, solo te invita a consultar tu estado de cuenta en la app oficial.",
    },
    {
      canal: "SMS",
      icono: "💬",
      remitente: "BBVA-INFO",
      cuerpo: "¡Felicidades! Ganaste $5,000 MXN en la Rifa BBVA 2026. Reclama tu premio aquí: bit.ly/premiobbva24. Oferta válida solo por hoy.",
      esPhishing: true,
      explicacion: "Es phishing: los premios inesperados, la urgencia (\"solo por hoy\") y los enlaces acortados son señales clásicas de estafa.",
    },
    {
      canal: "Llamada",
      icono: "📞",
      remitente: "Sistema de alertas BBVA · 800 999 8080",
      cuerpo: "\"Buenas tardes, le habla el sistema de alertas de BBVA. Detectamos un posible movimiento inusual y, por precaución, bloqueamos temporalmente su tarjeta terminación 4521. No necesitamos que nos comparta ningún código; si usted no reconoce ningún problema, puede desbloquearla desde la App BBVA o visitando una sucursal.\"",
      esPhishing: false,
      explicacion: "Es una llamada segura: te informa una medida de protección que el banco ya tomó y aclara que NO necesita ningún código tuyo — puedes verificarlo tú mismo desde la app.",
    },
  ];

  const bandeja = document.getElementById("bandejaMensajes");
  const marcadorTexto = document.getElementById("marcadorTexto");
  const btnVerResultado = document.getElementById("btnVerResultado");

  let aciertos = 0;
  let respondidos = 0;

  function construirBandeja() {
    aciertos = 0;
    respondidos = 0;
    marcadorTexto.textContent = `0 / ${mensajes.length}`;
    btnVerResultado.disabled = true;
    btnVerResultado.textContent = `Revisa los ${mensajes.length} mensajes para ver tu resultado`;

    bandeja.innerHTML = "";

    mensajes.forEach((msg, indice) => {
      const card = document.createElement("div");
      card.className = "mensaje-card";
      card.innerHTML = `
        <div class="mensaje-card__cabecera">
          <span class="mensaje-card__canal">${msg.icono} ${msg.canal}</span>
          <span class="mensaje-card__remitente">${msg.remitente}</span>
        </div>
        <div class="mensaje-card__cuerpo">${msg.cuerpo}</div>
        <div class="mensaje-card__acciones">
          <button class="btn-clasificar btn-clasificar--seguro" data-eleccion="seguro">✅ Es seguro</button>
          <button class="btn-clasificar btn-clasificar--phishing" data-eleccion="phishing">🚩 Es phishing</button>
        </div>
        <div class="mensaje-card__feedback"></div>
      `;

      card.querySelectorAll(".btn-clasificar").forEach((boton) => {
        boton.addEventListener("click", () => {
          if (card.classList.contains("respondida")) return;

          const eligioPhishing = boton.dataset.eleccion === "phishing";
          const esCorrecto = eligioPhishing === msg.esPhishing;

          card.classList.add("respondida", esCorrecto ? "correcta" : "incorrecta");
          boton.classList.add("elegido");

          const feedback = card.querySelector(".mensaje-card__feedback");
          feedback.innerHTML = esCorrecto
            ? `<div><strong>✔ Correcto.</strong> ${msg.explicacion}</div>`
            : `<div><strong>✘ No exactamente.</strong> En realidad ${msg.esPhishing ? "SÍ es phishing" : "SÍ es seguro"}. ${msg.explicacion}</div>`;

          if (esCorrecto) aciertos++;
          respondidos++;
          marcadorTexto.textContent = `${respondidos} / ${mensajes.length}`;

          if (respondidos === mensajes.length) {
            btnVerResultado.disabled = false;
            btnVerResultado.textContent = "Ver mi resultado";
          }
        });
      });

      bandeja.appendChild(card);
    });
  }

  btnVerResultado.addEventListener("click", () => {
    document.getElementById("textoResultadoFinal").textContent =
      `Acertaste ${aciertos} de ${mensajes.length} mensajes.`;
    sessionStorage.setItem("thoty_completado_phishing", "true");
    mostrar("exitoFinal");
  });

  // ---------- ENCUESTA DE SATISFACCIÓN ----------

  document.getElementById("btnIrEncuesta").addEventListener("click", () => mostrar("encuesta"));

  document.getElementById("formEncuesta").addEventListener("submit", (e) => {
    e.preventDefault();
    const calificaciones = {
      facilidad: leerEstrellas("enc_facilidad"),
      claridad: leerEstrellas("enc_claridad"),
      realismo: leerEstrellas("enc_realismo"),
      confianza: leerEstrellas("enc_confianza"),
      recomendacion: leerEstrellas("enc_recomendacion"),
    };
    const comentario = document.getElementById("enc_comentario").value;
    guardarEncuesta("phishing", calificaciones, comentario);
    document.getElementById("tituloCierre").textContent = "¡Gracias por tu opinión!";
    document.getElementById("textoCierre").textContent = "Nos ayuda mucho a mejorar Thoty. Puedes repetir esta práctica las veces que quieras.";
    mostrar("cierre");
  });

  document.getElementById("btnOmitirEncuesta").addEventListener("click", () => {
    document.getElementById("tituloCierre").textContent = "¡Listo!";
    document.getElementById("textoCierre").textContent = "Puedes repetir esta práctica las veces que quieras.";
    mostrar("cierre");
  });

  document.getElementById("btnDescargarEncuestas").addEventListener("click", descargarEncuestas);

  // arranque
  construirBandeja();
  mostrar("intro");
});
