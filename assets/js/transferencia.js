/* =========================================================
   THOTY — transferencia.js
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
  document.getElementById("opcionTransferirActiva").addEventListener("click", () => {
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
      titulo: "Cuenta de origen",
      texto: "Esta es la cuenta de la que saldrá el dinero. Casi siempre solo tendrás una opción disponible si es tu única cuenta.",
      figura: "explicando",
      alRevelar: () => {},
    },
    {
      id: "2",
      titulo: "Cuenta o CLABE destino",
      texto: "Aquí va la CLABE de 18 dígitos de la cuenta que recibirá el dinero. Tómate tu tiempo para verificarla: un solo dígito equivocado puede enviar el dinero a otra persona.",
      figura: "pensativo",
      alRevelar: () => { document.getElementById("t_clabe").value = "012180001234567895"; },
    },
    {
      id: "3",
      titulo: "Nombre del beneficiario",
      texto: "Cuando ingresas la cuenta, tu banco te mostrará el nombre del titular. Verifica que coincida con la persona a la que realmente quieres enviarle dinero.",
      figura: "confundido",
      alRevelar: () => { document.getElementById("t_beneficiario").value = "María Fernanda López"; },
    },
    {
      id: "4",
      titulo: "Monto y concepto",
      texto: "Escribe cuánto dinero quieres enviar y, si quieres, un concepto para recordar de qué se trataba. Revisa bien las cifras antes de continuar: una transferencia ya confirmada no se puede deshacer.",
      figura: "calculando",
      alRevelar: () => {
        document.getElementById("t_monto").value = "$1,500.00";
        document.getElementById("t_concepto").value = "Pago renta agosto";
      },
    },
    {
      id: "5",
      titulo: "Confirmar la operación",
      texto: "Este es el último paso. Aquí puedes revisar todos los datos una vez más antes de confirmar. Nunca confirmes una operación sin revisar primero.",
      figura: "aprobando",
      alRevelar: () => {},
    },
  ];

  let pasoActual = 1;

  function irAPaso(n) {
    pasoActual = n;
    const paso = pasosTutorial[n - 1];

    document.querySelectorAll(".tutorial-paso").forEach((el) => {
      el.classList.toggle("oculto", el.dataset.paso !== paso.id && el.dataset.paso !== (paso.id + "b"));
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

    const clabe = document.getElementById("p_clabe").value.trim();
    const beneficiario = document.getElementById("p_beneficiario").value.trim();
    const montoRaw = document.getElementById("p_monto").value.trim().replace(/[$,]/g, "");
    const concepto = document.getElementById("p_concepto").value.trim();

    let valido = true;

    if (!soloDigitos(clabe) || clabe.length !== 18) {
      marcarError("grupoClabe");
      valido = false;
    }
    if (beneficiario.length < 3) {
      marcarError("grupoBeneficiario");
      valido = false;
    }
    const monto = parseFloat(montoRaw);
    if (isNaN(monto) || monto <= 0) {
      marcarError("grupoMonto");
      valido = false;
    }
    if (concepto.length < 3) {
      marcarError("grupoConcepto");
      valido = false;
    }

    if (!valido) {
      document.querySelector(".campo-banca.con-error").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    document.getElementById("rev_beneficiario").textContent = beneficiario;
    document.getElementById("rev_clabe").textContent = clabe;
    document.getElementById("rev_monto").textContent = "$" + monto.toLocaleString("es-MX", { minimumFractionDigits: 2 });
    document.getElementById("rev_concepto").textContent = concepto;

    mostrar("revision");
  });

  document.getElementById("btnCorregir").addEventListener("click", () => mostrar("practica"));

  document.getElementById("btnConfirmarTransferencia").addEventListener("click", () => {
    sessionStorage.setItem("thoty_completado_transferencia", "true");
    mostrar("exitoFinal");
  });

  // arranque
  mostrar("intro");
});
