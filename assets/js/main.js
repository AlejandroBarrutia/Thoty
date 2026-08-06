/* =========================================================
   THOTY — main.js
   Lógica de la landing: modal de inicio, validación simple
   Todo vive únicamente en memoria de sesión (sessionStorage).
   Al cerrar la pestaña/navegador, se pierde — es un prototipo.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalInicio");
  const form = document.getElementById("formInicio");
  const error = document.getElementById("modalError");
  const inputNombre = document.getElementById("nombreUsuario");

  const botonesAbrir = [
    document.getElementById("btnEmpezarHeader"),
    document.getElementById("btnEmpezarHero"),
    document.getElementById("btnEmpezarFinal"),
  ];

  const botonCerrar = document.getElementById("cerrarModal");

  function abrirModal() {
    modal.classList.add("activo");
    document.body.style.overflow = "hidden";
    setTimeout(() => inputNombre.focus(), 100);
  }

  function cerrarModal() {
    modal.classList.remove("activo");
    document.body.style.overflow = "";
    error.classList.remove("activo");
  }

  botonesAbrir.forEach((btn) => btn && btn.addEventListener("click", abrirModal));
  botonCerrar.addEventListener("click", cerrarModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("activo")) cerrarModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = inputNombre.value.trim();
    const edadSeleccionada = form.querySelector('input[name="edad"]:checked');

    if (!nombre || !edadSeleccionada) {
      error.classList.add("activo");
      return;
    }

    error.classList.remove("activo");

    // Guardado SOLO en sessionStorage: se pierde al cerrar la sesión/HTTP.
    // No se guarda en localStorage ni se envía a ningún servidor.
    sessionStorage.setItem("thoty_nombre", nombre);
    sessionStorage.setItem("thoty_edad", edadSeleccionada.value);

    // Próximo paso del prototipo: redirigir al dashboard/menú de módulos.
    // Por ahora, placeholder mientras se construye esa pantalla.
    window.location.href = "dashboard.html";
  });
});
