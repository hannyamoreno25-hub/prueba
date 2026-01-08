document.addEventListener("DOMContentLoaded", function() {

    // --- 1. DATOS SIMULADOS (Aquí llegarían los datos de tu Base de Datos real) ---
    const datosEmpleado = {
        nombre: "Juan Pérez",
        id: "MUB-2024-88",
        puesto: "Monitor de Ruta",
        ubicacion: "Estación 4",
        horaEntrada: "07:58:00", // Formato 24h
        faltas: 1, // Número de faltas
        // Lista de idas al baño
        registrosBano: [
            { id: 1, inicio: "09:00:00", fin: "09:05:00" },
            { id: 2, inicio: "11:30:00", fin: "11:42:00" }
        ],
        // Lista de descansos (Ley Silla)
        registrosDescanso: [
            { id: 1, hora: "10:00:00", duracion: "05:00" },
            { id: 2, hora: "12:30:00", duracion: "05:00" }
        ]
    };

    // --- 2. CARGAR PERFIL Y KPIs ---
    
    // Cargar datos básicos (Si tienes IDs en el HTML para nombre/puesto, úsalos aquí)
    // Por ejemplo: document.getElementById('nombreEmpleado').textContent = datosEmpleado.nombre;

    // Cargar Hora de Entrada
    const elHoraLlegada = document.getElementById('valHoraLlegada');
    if(elHoraLlegada) elHoraLlegada.textContent = datosEmpleado.horaEntrada;

    // Cargar Faltas
    const elFaltas = document.getElementById('valFaltas');
    if(elFaltas) elFaltas.textContent = datosEmpleado.faltas;


    // --- 3. GENERAR TABLA DE SANITARIO ---
    const tablaBano = document.querySelector("#tablaSanitario tbody");
    const totalTiempoBanoEl = document.getElementById("totalTiempoBano");
    let totalSegundosBano = 0;

    if (tablaBano) {
        tablaBano.innerHTML = ""; // Limpiar tabla actual
        
        datosEmpleado.registrosBano.forEach((registro, index) => {
            // Calcular duración
            const duracion = calcularDiferencia(registro.inicio, registro.fin);
            totalSegundosBano += duracion.segundosTotales;

            // Crear fila HTML
            const fila = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${registro.inicio}</td>
                    <td>${registro.fin}</td>
                    <td>${duracion.texto}</td>
                </tr>
            `;
            tablaBano.innerHTML += fila;
        });

        // Actualizar el total arriba de la tabla
        if(totalTiempoBanoEl) {
            totalTiempoBanoEl.textContent = segundosAFormato(totalSegundosBano);
        }
    }

    // --- 4. GENERAR LISTA LEY SILLA ---
    const listaDescansos = document.getElementById("listaDescansos");
    const contadorDescansos = document.getElementById("contadorDescansos");

    if (listaDescansos) {
        listaDescansos.innerHTML = ""; // Limpiar lista
        
        // Actualizar contador (ej: 2 / 3)
        if(contadorDescansos) contadorDescansos.textContent = `${datosEmpleado.registrosDescanso.length} / 3`;

        datosEmpleado.registrosDescanso.forEach((descanso, index) => {
            const item = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Descanso ${index + 1} (${descanso.hora})
                    <span class="badge bg-primary rounded-pill">${descanso.duracion} min</span>
                </li>
            `;
            listaDescansos.innerHTML += item;
        });
    }

    // --- 5. RELOJ DE TIEMPO TRABAJADO (EN VIVO) ---
    function actualizarRelojLaboral() {
        const elTiempoTrabajado = document.getElementById('valTiempoTrabajado');
        if (!elTiempoTrabajado) return;

        const ahora = new Date();
        const [hora, min, seg] = datosEmpleado.horaEntrada.split(':');
        
        const fechaEntrada = new Date();
        fechaEntrada.setHours(hora, min, seg);

        let diferencia = ahora - fechaEntrada; // Diferencia en milisegundos

        // Convertir a horas, minutos, segundos
        let horas = Math.floor(diferencia / (1000 * 60 * 60));
        let minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        let segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        // Formato con ceros a la izquierda (01, 02...)
        horas = (horas < 10) ? "0" + horas : horas;
        minutos = (minutos < 10) ? "0" + minutos : minutos;
        segundos = (segundos < 10) ? "0" + segundos : segundos;

        elTiempoTrabajado.textContent = `${horas}:${minutos}:${segundos} Hrs`;
    }

    // Actualizar cada segundo
    setInterval(actualizarRelojLaboral, 1000);
    actualizarRelojLaboral(); // Ejecutar inmediatamente al cargar

});

// --- FUNCIONES AUXILIARES ---

function calcularDiferencia(inicio, fin) {
    // Convierte horas texto "09:00:00" a fechas para restar
    const d1 = new Date("2000-01-01T" + inicio);
    const d2 = new Date("2000-01-01T" + fin);
    
    let diff = d2 - d1; // milisegundos
    let totalSeg = Math.floor(diff / 1000);
    
    let minutos = Math.floor(totalSeg / 60);
    let segundos = totalSeg % 60;

    return {
        segundosTotales: totalSeg,
        texto: `${minutos} min ${segundos} s`
    };
}

function segundosAFormato(totalSegundos) {
    let horas = Math.floor(totalSegundos / 3600);
    let minutos = Math.floor((totalSegundos % 3600) / 60);
    let segundos = totalSegundos % 60;
    
    // Rellenar con ceros
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
}
function obtenerDatosDelDashboard() {
  // Abrimos la hoja por su ID único
  var idHoja = "12Qb9KFB5hwSCwullPXAzlZHdmojrscuUkEzWg4DdROE"; 
  var ss = SpreadsheetApp.openById(idHoja);
  
  // IMPORTANTE: Asegúrate de que el nombre de la pestaña sea correcto.
  // En tu archivo vi "domingo 2", pero si cambiaste el nombre, ajustalo aquí.
  var sheet = ss.getSheetByName("domingo 2"); 
  
  if (!sheet) {
    // Si no encuentra la pestaña "domingo 2", intenta con la primera que encuentre
    sheet = ss.getSheets()[0];
  }

  // Obtenemos todos los datos (filas y columnas)
  var datos = sheet.getDataRange().getValues();
  
  // (Opcional) Si la primera fila son encabezados, la quitamos para no enviarla como dato
  // datos.shift(); 
  
  return datos;
}

// Esta función se debe llamar cuando cargues el dashboard (ej. al iniciar sesión como admin)
function cargarDashboard() {
  google.script.run
    .withSuccessHandler(mostrarDatosEnTabla)
    .obtenerDatosDelDashboard();
}

function mostrarDatosEnTabla(datos) {
  var cuerpo = document.getElementById("tablaCuerpo");
  cuerpo.innerHTML = ""; // Limpiar tabla por si acaso

  // Recorremos los datos recibidos.
  // Empezamos en i = 1 si la fila 0 son los encabezados en tu Excel.
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    
    // fila[0] = Hora, fila[1] = Fecha, fila[2] = Ubicación, fila[3] = Nombre
    // Ajusta los índices [0, 1, 2...] según el orden exacto de tus columnas A, B, C...
    
    var htmlFila = "<tr>" +
                   "<td>" + fila[0] + "</td>" + // Hora
                   "<td>" + fila[1] + "</td>" + // Fecha
                   "<td>" + fila[2] + "</td>" + // Ubicación
                   "<td>" + (fila[3] ? fila[3] : "") + "</td>" + // Nombre (si existe)
                   "</tr>";
                   
    cuerpo.innerHTML += htmlFila;
  }
}















/**
 * Tomar una fotografía y descargarla
 * @date 2025-12-30 (Actualizado)
 * @author parzibyte (Corregido)
 */

const tieneSoporteUserMedia = () =>
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

// Elementos del DOM
const $video = document.querySelector("#video"),
    $canvas = document.querySelector("#canvas"),
    $boton = document.querySelector("#boton"),
    $listaDeDispositivos = document.querySelector("#listaDeDispositivos"),
    $estado = document.querySelector("#estado"); // Asegúrate de tener este ID en tu HTML

const limpiarSelect = () => {
    for (let x = $listaDeDispositivos.options.length; x >= 0; x--) {
        $listaDeDispositivos.remove(x);
    }
};

const obtenerDispositivos = () => navigator.mediaDevices.enumerateDevices();

const llenarSelectConDispositivosDisponibles = () => {
    limpiarSelect();
    obtenerDispositivos()
        .then(dispositivos => {
            const dispositivosDeVideo = dispositivos.filter(d => d.kind === "videoinput");
            
            if (dispositivosDeVideo.length > 0) {
                dispositivosDeVideo.forEach(dispositivo => {
                    const option = document.createElement('option');
                    option.value = dispositivo.deviceId;
                    option.text = dispositivo.label || `Cámara ${$listaDeDispositivos.length + 1}`;
                    $listaDeDispositivos.appendChild(option);
                });
            }
        });
};

(function () {
    if (!tieneSoporteUserMedia()) {
        alert("Lo siento. Tu navegador no soporta esta característica");
        return;
    }

    let stream;

    const mostrarStream = (idDeDispositivo) => {
        // Detener stream anterior si existe
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: { deviceId: idDeDispositivo ? { exact: idDeDispositivo } : undefined }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(streamObtenido => {
                stream = streamObtenido;
                $video.srcObject = stream;
                $video.play();
                
                // Llenamos el select ahora que tenemos permiso para ver las etiquetas
                llenarSelectConDispositivosDisponibles();
            })
            .catch(error => {
                console.error("Error accediendo a la cámara:", error);
                if ($estado) $estado.innerHTML = "No se puede acceder a la cámara.";
            });
    };

    // Escuchar cambios en el select
    $listaDeDispositivos.onchange = () => {
        mostrarStream($listaDeDispositivos.value);
    };

    // Iniciar con la cámara por defecto
    mostrarStream();

    // Evento del botón para tomar foto
    $boton.addEventListener("click", function () {
        $video.pause();

        let contexto = $canvas.getContext("2d");
        $canvas.width = $video.videoWidth;
        $canvas.height = $video.videoHeight;
        contexto.drawImage($video, 0, 0, $canvas.width, $canvas.height);

        let foto = $canvas.toDataURL("image/png");
        let enlace = document.createElement('a');
        enlace.download = "foto_parzibyte.png";
        enlace.href = foto;
        enlace.click();

        $video.play();
    });
})();