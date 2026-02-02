// Esperamos a que el HTML esté listo para manipular el DOM
document.addEventListener('DOMContentLoaded', () => {
    const FALLBACK = {
        lat: 19.426749,  // Latitud de CDMX
        lng: -99.167167, // Longitud
        zoom: 13         // Zoom inicial
    };

    // Creamos el mapa asociado al <div id="map">
    const map = L.map('map').setView([FALLBACK.lat, FALLBACK.lng], FALLBACK.zoom);

    // Capa base con teselas de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Referencias para marcador y círculo de precisión
    let userMarker = null;
    let accuracyCircle = null;

    // Función para mostrar ubicación
    function showPosition(lat, lng, accuracy) {
        if (!userMarker) {
            userMarker = L.marker([lat, lng]).addTo(map);
        } else {
            userMarker.setLatLng([lat, lng]);
        }

        if (!accuracyCircle) {
            accuracyCircle = L.circle([lat, lng], {
                radius: accuracy || 15,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.2
            }).addTo(map);
        } else {
            accuracyCircle.setLatLng([lat, lng]);
            accuracyCircle.setRadius(accuracy || 15);
        }

        map.setView([lat, lng], 18);
    }

    // Función de respaldo si geolocalización falla
    function showFallback(reason) {
        console.warn('Geolocalización no disponible/permitida:', reason);
        if (!userMarker) {
            userMarker = L.marker([FALLBACK.lat, FALLBACK.lng]).addTo(map);
            userMarker.bindPopup('Usando ubicación de respaldo: Ciudad de México').openPopup();
        }
        map.setView([FALLBACK.lat, FALLBACK.lng], FALLBACK.zoom);
    }

    // Solicitamos geolocalización
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                showPosition(latitude, longitude, accuracy);
            },
            (err) => {
                console.warn('Error en geolocalización:', err);
                showFallback(err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Si quieres seguimiento en tiempo real, puedes descomentar esto:
        /*
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                showPosition(latitude, longitude, accuracy);
            },
            (err) => console.warn('Error en watchPosition:', err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 1000 }
        );

        // Para detener el seguimiento
        // navigator.geolocation.clearWatch(watchId);
        */
    } else {
        showFallback('Geolocation API not supported');
    }
});
