const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const links = navLinks.querySelectorAll("a");

// Función para abrir y cerrar el menú
menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    
    // Cambiar el icono entre hamburguesa y X
    if (navLinks.classList.contains("active")) {
        menuBtn.innerHTML = "✕"; // Icono de cerrar
        menuBtn.setAttribute("aria-expanded", "true");
    } else {
        menuBtn.innerHTML = "≡"; // Icono de hamburguesa
        menuBtn.setAttribute("aria-expanded", "false");
    }
});

// Cerrar el menú automáticamente cuando se hace clic en un enlace
links.forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuBtn.innerHTML = "≡";
        menuBtn.setAttribute("aria-expanded", "false");
    });
});