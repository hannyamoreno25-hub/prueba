/* === SCRIPT.JS OPTIMIZADO === */

// --- Variables Globales ---
let inicioJornada = null;
let intervaloJornada = null;

let inicioTiempoExtra = null; 
let intervaloDescanso = null; 
const TIEMPO_DESCANSO_SEGUNDOS = 5 * 60; // 5 minutos (300 segundos)

let inicioSanitario = null; 
let intervaloSanitario = null; 

// URL de tu Google Apps Script
const urlGoogleScript = "https://script.google.com/macros/s/AKfycbw8M4OZpzoT-k8CJ4Jn1uNGaZjillp3eNTSAfhbyaNMcvt1nSnCvG0h33jXJHguH7M2KQ/exec"; 

// --- Función para enviar datos ---
function enviarDatosGoogle(data, successMessage = null) {
    console.log("Enviando datos:", data);
    fetch(urlGoogleScript, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(() => {
        console.log(`✅ Datos enviados: ${data.evento}`);
        if (successMessage) alert(successMessage);
    })
    .catch(err => {
        console.error("❌ Error al enviar:", err);
        alert("Error al guardar los datos.");
    });
}

// --- Formato de tiempo (HH:MM:SS) ---
function formatearDuracion(ms) {
    if (ms < 0) ms = 0;
    const segundosTotales = Math.floor(ms / 1000);
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;
    return [horas, minutos, segundos].map(v => v.toString().padStart(2, '0')).join(':');
}

// --- Función Auxiliar: Tomar Foto ---
// Toma el video, lo congela en el canvas y oculta el video
function capturarFoto(video, canvas) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        video.style.display = "none";
        canvas.style.display = "block";
        return true;
    } else {
        alert("La cámara aún no está lista. Intenta de nuevo en un segundo.");
        return false;
    }
}

// --- Función Auxiliar: Reiniciar Cámara ---
// Oculta canvas, muestra video
function reiniciarVistaCamara(video, canvas) {
    canvas.style.display = "none";
    video.style.display = "block";
}

// --- Lógica Principal de Cámara y Botones ---
function iniciarLogicaCamara(videoEl, canvasEl, btnStart, btnEnd, btnClear, fechaEl, ubicEl, relojEl) {
    
    // 1. Encender Cámara
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then(stream => {
            videoEl.srcObject = stream;
            // Necesario para algunos navegadores móviles
            videoEl.play();
        })
        .catch(err => {
            console.error("Error cámara:", err);
            ubicEl.textContent = "⚠️ No se pudo acceder a la cámara.";
        });

    // 2. BOTÓN INICIAR (Captura foto + Inicia Timer)
    btnStart.addEventListener("click", () => {
        // Intentar capturar foto
        const fotoCapturada = capturarFoto(videoEl, canvasEl);
        if (!fotoCapturada) return; // Si falla, no continuar

        const fechaActual = new Date();
        fechaEl.textContent = "📅 Inicio: " + fechaActual.toLocaleString();

        // Geolocalización
        let linkMapa = "Sin ubicación";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const lat = pos.coords.latitude.toFixed(5);
                const lon = pos.coords.longitude.toFixed(5);
                linkMapa = `https://maps.google.com/?q=${lat},${lon}`;
                ubicEl.innerHTML = `📍 <a href="${linkMapa}" target="_blank">Ver ubicación</a>`;
                
                // Enviar Datos de INICIO según el botón presionado
                procesarEnvioInicio(btnStart.id, fechaActual, linkMapa);
            });
        } else {
            ubicEl.textContent = "📍 Ubicación no disponible";
            procesarEnvioInicio(btnStart.id, fechaActual, linkMapa);
        }

        // Lógica de Timers (Jornada, Descanso, Sanitario)
        manejarTimersInicio(btnStart.id, relojEl);

        // Control de Botones
        btnStart.disabled = true;
        btnEnd.disabled = false;
        btnClear.disabled = false;
    });

    // 3. BOTÓN FINALIZAR (Retoma foto final + Detiene Timer)
    btnEnd.addEventListener("click", () => {
        // Para tomar la foto de salida, necesitamos mostrar el video un instante
        // O simplemente capturar el frame actual si el stream sigue corriendo (que sí sigue).
        // Hacemos el "efecto" de nueva foto:
        
        reiniciarVistaCamara(videoEl, canvasEl); // Muestra video brevemente
        
        // Esperamos 500ms para que el usuario pose para la foto de salida
        setTimeout(() => {
            capturarFoto(videoEl, canvasEl); // Captura foto final
            
            const fechaFin = new Date();
            
            // Detener timers y calcular tiempos
            let tiempoTotalStr = manejarTimersFin(btnEnd.id, relojEl);
            
            // Obtener ubicación final y enviar
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const lat = pos.coords.latitude.toFixed(5);
                    const lon = pos.coords.longitude.toFixed(5);
                    const linkMapa = `https://maps.google.com/?q=${lat},${lon}`;
                    procesarEnvioFin(btnEnd.id, fechaFin, linkMapa, tiempoTotalStr);
                });
            } else {
                procesarEnvioFin(btnEnd.id, fechaFin, "Sin ubicación", tiempoTotalStr);
            }

            btnEnd.disabled = true;
            btnClear.disabled = false; // Permitir borrar para reiniciar ciclo

        }, 800); // 0.8 segundos de espera para la foto de salida
    });

    // 4. BOTÓN BORRAR (Resetear todo)
    btnClear.addEventListener("click", () => {
        reiniciarVistaCamara(videoEl, canvasEl);
        fechaEl.textContent = "";
        ubicEl.textContent = "";
        
        // Resetear variables y textos según el tipo
        resetearLogica(btnStart.id, relojEl);

        btnStart.disabled = false;
        btnEnd.disabled = true;
        btnClear.disabled = true;
    });
}

// --- SUB-FUNCIONES DE LÓGICA (Para mantener el código limpio) ---

function procesarEnvioInicio(idBoton, fecha, mapa) {
    let data = { fecha: fecha.toLocaleDateString(), hora: fecha.toLocaleTimeString(), ubicacion: mapa };
    
    if (idBoton === "btnCapturarRegistro") {
        data.evento = "Inicio Jornada"; data.nombre = "iniciarjornada";
    } else if (idBoton === "btnCapturarDescanso") {
        data.evento = "Inicio Descanso"; data.nombre = "iniciardescanso";
    } else if (idBoton === "btnCapturarSanitario") {
        data.evento = "Inicio Sanitario"; data.nombre = "iniciarsanitario";
    }
    enviarDatosGoogle(data);
}

function procesarEnvioFin(idBoton, fecha, mapa, tiempo) {
    let data = { fecha: fecha.toLocaleDateString(), hora: fecha.toLocaleTimeString(), ubicacion: mapa };

    if (idBoton === "btnFCapturarRegistro") { // Ojo: id del botón FIN
        data.evento = "Fin Jornada"; data.nombre = "finjornada"; data.tiempoLaborado = tiempo;
        enviarDatosGoogle(data, "¡Jornada finalizada exitosamente!");
    } else if (idBoton === "btnFDescanso") {
        data.evento = "Fin Descanso"; data.nombre = "findescanso"; data.tiempoExtra = tiempo;
        enviarDatosGoogle(data, "Descanso finalizado.");
    } else if (idBoton === "btnFSanitario") {
        data.evento = "Fin Sanitario"; data.nombre = "finsanitario"; data.tiempoTotal = tiempo;
        enviarDatosGoogle(data, "Registro de sanitario finalizado.");
    }
}

function manejarTimersInicio(idBoton, relojEl) {
    if (idBoton === "btnCapturarRegistro") {
        inicioJornada = new Date();
        intervaloJornada = setInterval(() => {
            relojEl.textContent = `🕒 Laborando: ${formatearDuracion(new Date() - inicioJornada)}`;
        }, 1000);
    } 
    else if (idBoton === "btnCapturarDescanso") {
        let tiempoRestante = TIEMPO_DESCANSO_SEGUNDOS;
        intervaloDescanso = setInterval(() => {
            const min = Math.floor(tiempoRestante / 60).toString().padStart(2,'0');
            const seg = (tiempoRestante % 60).toString().padStart(2,'0');
            relojEl.textContent = `🪑 Descanso: ${min}:${seg}`;
            tiempoRestante--;
            
            if (tiempoRestante < 0) {
                clearInterval(intervaloDescanso);
                alert("🔔 ¡Tiempo de descanso terminado!");
                inicioTiempoExtra = new Date();
                relojEl.style.color = "red";
                intervaloDescanso = setInterval(() => {
                    relojEl.textContent = `⚠️ Exceso: ${formatearDuracion(new Date() - inicioTiempoExtra)}`;
                }, 1000);
            }
        }, 1000);
    }
    else if (idBoton === "btnCapturarSanitario") {
        inicioSanitario = new Date();
        intervaloSanitario = setInterval(() => {
            relojEl.textContent = `🚽 Sanitario: ${formatearDuracion(new Date() - inicioSanitario)}`;
        }, 1000);
    }
}

function manejarTimersFin(idBoton, relojEl) {
    let tiempoFinal = "00:00:00";
    
    if (idBoton === "btnFCapturarRegistro") {
        clearInterval(intervaloJornada);
        tiempoFinal = formatearDuracion(new Date() - inicioJornada);
        relojEl.textContent = `✅ Jornada Total: ${tiempoFinal}`;
        inicioJornada = null;
    } 
    else if (idBoton === "btnFDescanso") {
        clearInterval(intervaloDescanso);
        if (inicioTiempoExtra) {
            tiempoFinal = formatearDuracion(new Date() - inicioTiempoExtra);
        } else {
            tiempoFinal = "00:00:00 (A tiempo)";
        }
        relojEl.style.color = "black";
        relojEl.textContent = `✅ Fin Descanso. Exceso: ${tiempoFinal}`;
        inicioTiempoExtra = null;
    }
    else if (idBoton === "btnFSanitario") {
        clearInterval(intervaloSanitario);
        tiempoFinal = formatearDuracion(new Date() - inicioSanitario);
        relojEl.textContent = `✅ Tiempo en Sanitario: ${tiempoFinal}`;
        inicioSanitario = null;
    }
    return tiempoFinal;
}

function resetearLogica(idBoton, relojEl) {
    if (idBoton === "btnCapturarRegistro") {
        clearInterval(intervaloJornada);
        inicioJornada = null;
        relojEl.textContent = "🕒 Tiempo laborado: 00:00:00";
    } else if (idBoton === "btnCapturarDescanso") {
        clearInterval(intervaloDescanso);
        inicioTiempoExtra = null;
        relojEl.style.color = "black";
        relojEl.textContent = "🪑 Tiempo de descanso: 05:00";
    } else if (idBoton === "btnCapturarSanitario") {
        clearInterval(intervaloSanitario);
        inicioSanitario = null;
        relojEl.textContent = "🚽 Tiempo en sanitario: 00:00:00";
    }
}

// --- INICIALIZACIÓN (Selectores y Llamadas) ---

// 1. REGISTRO
iniciarLogicaCamara(
    document.getElementById("videoRegistro"),
    document.getElementById("canvasRegistro"),
    document.getElementById("btnCapturarRegistro"), // Start
    document.getElementById("btnFCapturarRegistro"), // End
    document.getElementById("btnBCapturarRegistro"), // Clear
    document.getElementById("fechaHoraRegistro"),
    document.getElementById("ubicacionRegistro"),
    document.getElementById("relojLaboralRegistro")
);

// 2. DESCANSO
iniciarLogicaCamara(
    document.getElementById("videoDescanso"),
    document.getElementById("canvasDescanso"),
    document.getElementById("btnCapturarDescanso"),
    document.getElementById("btnFDescanso"),
    document.getElementById("btnBDescanso"),
    document.getElementById("fechaHoraDescanso"),
    document.getElementById("ubicacionDescanso"),
    document.getElementById("relojLaboralDescanso")
);

// 3. SANITARIO
iniciarLogicaCamara(
    document.getElementById("videoSanitario"),
    document.getElementById("canvasSanitario"),
    document.getElementById("btnCapturarSanitario"),
    document.getElementById("btnFSanitario"),
    document.getElementById("btnBSanitario"),
    document.getElementById("fechaHoraSanitario"),
    document.getElementById("ubicacionSanitario"),
    document.getElementById("relojLaboralSanitario")
);