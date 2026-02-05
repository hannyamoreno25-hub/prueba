/* === Lógica para mostrar datos sin afectar el diseño === */

function cargarDashboardColaborador() {
    // Llamamos a la función de Google Apps Script que procesa la hoja
    google.script.run
        .withSuccessHandler(inyectarDatos)
        .withFailureHandler(error => console.error("Error:", error))
        .obtenerResumenHoja(); 
}

function inyectarDatos(datos) {
    // 1. Llenamos los textos simples
    document.getElementById("valHoraLlegada").innerText = datos.llegada;
    document.getElementById("valTiempoTrabajado").innerText = datos.tiempoLaborado;
    document.getElementById("contadorDescansos").innerText = datos.totalDescansos;
    document.getElementById("totalTiempoBano").innerText = datos.totalSanitario + " entradas";

    // 2. Inyectamos las filas de las tablas (Sanitario y Actividad)
    // Usamos innerHTML para colocar las filas que el servidor ya preparó
    document.getElementById("tablaSanitario").querySelector("tbody").innerHTML = datos.htmlSanitario;
    document.getElementById("tablaCuerpo").innerHTML = datos.htmlActividad;

    // 3. Inyectamos la lista de descansos (Ley Silla)
    document.getElementById("listaDescansos").innerHTML = datos.htmlDescansos;
}