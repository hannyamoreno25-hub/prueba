// Esperamos a que el HTML esté listo para manipular el DOM
document.addEventListener('DOMContentLoaded', () => {
  // 1) Coordenadas de respaldo (CDMX) por si falla la geolocalización
  const FALLBACK = {
    lat: 19.426749,     // Latitud de la Ciudad de México
    lng: -99.167167,    // Longitud de la Ciudad de México
    zoom: 13          // Zoom agradable para ciudad
  };

  // 2) Creamos el mapa asociado al <div id="map">
  //    - 'map' es el id del contenedor en el HTML
  //    - setView([lat, lng], zoom) establece una vista inicial
  const map = L.map('map').setView([FALLBACK.lat, FALLBACK.lng], FALLBACK.zoom);

  // 3) Capa base con teselas de OpenStreetMap
  //    - La URL usa {s} subdominio, {z} zoom, {x} y {y} para la baldosa
  //    - "attribution" es obligatorio al usar OSM
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, // Zoom máximo permitido por esta capa
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // 4) Preparamos referencias para marcador y círculo de precisión
  let userMarker = null; // Guardará el marcador de "mi ubicación"
  let accuracyCircle = null; // Círculo que representa la precisión en metros

  // 5) Función para pintar/actualizar la ubicación en el mapa
  function showPosition(lat, lng, accuracy) {
    // Si ya existe un marcador previo, lo actualizamos; si no, lo creamos
    if (!userMarker) {
      userMarker = L.marker([lat, lng]).addTo(map);
      userMarker.bindPopup('Usted esta aqui').openPopup(); // Popup simple
    } else {
      userMarker.setLatLng([lat, lng]);
    }

    // Dibujamos o actualizamos un círculo de precisión (accuracy en metros)
    if (!accuracyCircle) {
      accuracyCircle = L.circle([lat, lng], {
        radius: accuracy || 2, // si no viene accuracy, usamos 30m como ejemplo
        weight: 1,              // grosor de borde
        fillOpacity: 0.25       // un poco translúcido
      }).addTo(map);
    } else {
      accuracyCircle.setLatLng([lat, lng]);
      accuracyCircle.setRadius(accuracy || 15);
    }

    // Centramos el mapa a la nueva ubicación con un zoom adecuado
    map.setView([lat, lng], 18);
  }

  // 6) Función de respaldo si geolocalización falla o es rechazada
  function showFallback(reason) {
    console.warn('Geolocalización no disponible/permitida:', reason);
    // Mostramos un marcador en el fallback para que se note algo en el mapa
    if (!userMarker) {
      userMarker = L.marker([FALLBACK.lat, FALLBACK.lng]).addTo(map);
      userMarker.bindPopup('Usando ubicación de respaldo: Ciudad de México').openPopup();
    }
    map.setView([FALLBACK.lat, FALLBACK.lng], FALLBACK.zoom);
  }

  // 7) Solicitamos la geolocalización al navegador
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      // Éxito
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        showPosition(latitude, longitude, accuracy);
      },
      // Error (rechazo, timeout, etc.)
      (err) => {
        showFallback(err.message);
      },
      // Opciones: más precisión, tope de espera, no usar cache
      {
        enableHighAccuracy: true, // intenta usar GPS/alta precisión
        timeout: 10000,           // falla si no responde en 10s
        maximumAge: 0             // no uses posiciones en caché
      }
    );

    // (Opcional avanzado) Seguir movimiento en tiempo real:
    // Si quieres que la posición se actualice si el usuario se mueve:
    /* 
    const watchId = navigator.geolocation.watchPosition(
       (pos) => {
         const { latitude, longitude, accuracy } = pos.coords;
         showPosition(latitude, longitude, accuracy);
       },
       (err) => console.warn('Error en watchPosition:', err),
    /  { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
     );

     */
    // Para detener el seguimiento: 
    /*
     navigator.geolocation.clearWatch(watchId);
     */

  } else {
    // El navegador no soporta geolocalización
    showFallback('Geolocation API not supported');
  }
});
