/* =========================================================
   THOTY — banca-nav.js
   Comportamiento reutilizable de la barra de navegación
   bancaria simulada: menús desplegables realistas y aviso
   al hacer clic en operaciones no disponibles en el prototipo.
   ========================================================= */

function initBancaNav() {
  const items = document.querySelectorAll(".banca-nav__item");

  function cerrarTodos() {
    items.forEach((it) => it.classList.remove("abierto"));
  }

  items.forEach((item) => {
    const boton = item.querySelector(".banca-nav__boton");
    if (!boton) return;
    boton.addEventListener("click", (e) => {
      e.stopPropagation();
      const yaAbierto = item.classList.contains("abierto");
      cerrarTodos();
      if (!yaAbierto) item.classList.add("abierto");
    });
  });

  document.addEventListener("click", cerrarTodos);

  document.querySelectorAll(".banca-nav__opcion--bloqueada").forEach((op) => {
    op.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      mostrarToastBloqueado();
      cerrarTodos();
    });
  });
}

let toastTimeout = null;
function mostrarToastBloqueado(mensaje) {
  let toast = document.getElementById("toastBloqueado");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastBloqueado";
    toast.className = "toast-bloqueado";
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#ffffff" stroke-width="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>
      <span id="toastBloqueadoTexto"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById("toastBloqueadoTexto").textContent =
    mensaje || "Esta operación no está disponible en este prototipo.";
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2600);
}

document.addEventListener("DOMContentLoaded", initBancaNav);
