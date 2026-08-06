/* =========================================================
   THOTY — pago-servicios.js
   Simulación completa: tutorial guiado + práctica real con
   validación. Todo en memoria de sesión, sin backend.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const nombre = sessionStorage.getItem("thoty_nombre") || "amigo";
  ["nombreTopbar1", "nombreTopbar2", "nombreTopbar3"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = nombre;
  });

  const vistas = {
    intro: document.getElementById("vista-intro"),
    inicio: document.getElementById("vista-inicio"),
    tutorial: document.getElementById("vista-tutorial"),
    exitoTutorial: document.getElementById("vista-exito-tutorial"),
    practica: document.getElementById("vista-practica"),
    revision: document.getElementById("vista-revision"),
    exitoFinal: document.getElementById("vista-exito-final"),
  };

  function mostrar(nombreVista) {
    Object.values(vistas).forEach((v) => v.classList.add("oculto"));
    vistas[nombreVista].classList.remove("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Navegación entre pantallas ----------
  document.getElementById("btnIniciar").addEventListener("click", () => mostrar("inicio"));
  document.getElementById("opcionPagarActiva").addEventListener("click", () => {
    mostrar("tutorial");
    irAPaso(1);
  });
  document.getElementById("btnIrPractica").addEventListener("click", () => mostrar("practica"));
  document.getElementById("btnRepetir").addEventListener("click", () => {
    document.getElementById("formPractica").reset();
    limpiarErrores();
    mostrar("practica");
  });

  // ---------- TUTORIAL GUIADO ----------
  const pasosTutorial = [
    {
      id: "1",
      titulo: "Tipo de servicio",
      texto: "Elige qué tipo de recibo quieres pagar: luz, agua, teléfono u otro servicio.",
      figura: "explicando",
      alRevelar: () => {},
    },
    {
      id: "2",
      titulo: "Número de referencia",
      texto: "Este número identifica tu contrato o recibo. Lo encuentras impreso en el papel del recibo, o en la app del proveedor del servicio. Escríbelo con cuidado, un error aquí puede pagar el recibo de otra persona.",
      figura: "pensativo",
      alRevelar: () => { document.getElementById("t_referencia").value = "552013489021"; },
    },
    {
      id: "3",
      titulo: "Monto a pagar",
      texto: "Revisa que el monto coincida exactamente con el total de tu recibo antes de continuar.",
      figura: "calculando",
      alRevelar: () => { document.getElementById("t_monto").value = "$487.00"; },
    },
    {
      id: "4",
      titulo: "Confirmar el pago",
      texto: "Este es el último paso. Revisa todos los datos una vez más antes de confirmar. Nunca confirmes un pago sin revisar primero.",
      figura: "aprobando",
      alRevelar: () => {},
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
    paso.alRevelar();

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

  // ---------- PRÁCTICA REAL: validación ----------

  function limpiarErrores() {
    document.querySelectorAll(".campo-banca").forEach((el) => el.classList.remove("con-error"));
  }

  function marcarError(idGrupo) {
    document.getElementById(idGrupo).classList.add("con-error");
  }

  function soloDigitos(str) {
    return /^\d+$/.test(str);
  }

  document.getElementById("formPractica").addEventListener("submit", (e) => {
    e.preventDefault();
    limpiarErrores();

    const tipo = document.getElementById("p_tipo").value;
    const referencia = document.getElementById("p_referencia").value.trim();
    const montoRaw = document.getElementById("p_monto").value.trim().replace(/[$,]/g, "");

    let valido = true;

    if (!soloDigitos(referencia) || referencia.length !== 12) {
      marcarError("grupoReferencia");
      valido = false;
    }
    const monto = parseFloat(montoRaw);
    if (isNaN(monto) || monto <= 0) {
      marcarError("grupoMonto");
      valido = false;
    }

    if (!valido) {
      document.querySelector(".campo-banca.con-error").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    document.getElementById("rev_tipo").textContent = tipo;
    document.getElementById("rev_referencia").textContent = referencia;
    document.getElementById("rev_monto").textContent = "$" + monto.toLocaleString("es-MX", { minimumFractionDigits: 2 });

    mostrar("revision");
  });

  document.getElementById("btnCorregir").addEventListener("click", () => mostrar("practica"));

  document.getElementById("btnConfirmarPago").addEventListener("click", () => {
    sessionStorage.setItem("thoty_completado_pago", "true");
    mostrar("exitoFinal");
  });

  // arranque
  mostrar("intro");
});
