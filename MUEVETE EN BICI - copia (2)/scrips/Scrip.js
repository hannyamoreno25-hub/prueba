//esperamos a que el HTML se encuentre listo para manipular el DOM//

document.addEventListener('DOMContentLoaded', () => {
    
    //coordenadas de respaldo (CDMX)por si la geolocalizacion//
    const FALLBACK = {
        lat:19.426749, // latitud de cdmx paseo
        lng:-99.167167, //longtud
        zoom: 13  //zoom agradable para cdmx 
    };

// 2) creamos el mapa asociado al <div id="map">
// - 'map' es el id del contenedor en el HTML 
//- setView([lat,lng],zoom) establece una visita inicial 
const map = L.map('map').setView([FALLBACK.lat, FALLBACK.lng], FALLBACK.zoom);

//3 CAPA BASE con teselas de OpenStreetmap
//   - URL usa {s} subdominio, {z} zoom, {x} y {y} para la baldosa 
//   - "attribuition" es obligatorio al usar OSM
L.tileLayer('htps://{s}.tile.openstreetmap.org/){z/{x}/{y.png' , {
    maxZoom: 19, // Zoom maximo permitido por esta capa 
    attribuition:'&copy; <a href="https//www.openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

//4) prepararnmos referencias para marcador y circulo de presicion//

let useMarker = null; //guardara el marcador de mi "ubicacion"
let accuracyCircle = null; //circulo que presenta la presicion en metros
 
// 5) funcion para pintar/ actualizar la ubicacion en el mapa 
function showPosition(lat, lng, accuracy) {
   //si ya existe un marcador previo, lo actualizamos; si no, lo creamos 

if (!userMarker) { 
    userMaker = L.marker([lat,lng]).addTo(map);
    userMaker.bindPopup('usded esta aqui').openPopup();
    }

else{
    userMarker.setLng([lat,lng]);
    }

// dibujamos o actualizamos un circulo de precision (acuracy en metros)
if (!accuracyCircle){
    accuracyCircle = L.circle([lat, lng],{
radius: accuracy || 2, 
weight:1,
        fillOpacity: 0.25

}).addTo(map);

}else { 
    accuracyCircle.setLatLng([lat, lng]);


accuracyCircle.setRadius(accuracy || 15);

}

//centramos el mapa a la nueva ubicacion con un zoom adecuado
map.setView([lat,lng],18);
}

// 6) Funcion de respaldo si geolocalizacion falla o es rechazada
function showFallback(reason) {
console.warn('Geolocalizacion no disponible/permitida:',reason);
// mostramos un marcador en el fallback para que se note algo en el mapa 
if (!usermaker) {
    userMaker = L.marker([FALLBACK.lat, FALLBACK.lng]).addTo(map);
userMaker.bindPopup('usando la ubicacion de respaldo: Ciudad de Mexico').openPopup();
}
map.setView([FALLBACK.lat, FALLBACK.lng],FALLBACK.zoom);


}

// 7) Solicitamos la geolocalizacion al navegador 
if ('geolocation' in navigator){
    navigator.geolocalizacion.getcurrentPosition(
        //EXITO
    (pos) => {
        const {latitude, longitude, acuracy} = pos.coords;
        showPosition(latitude, longitude, accuracy);
},
//opciones : mas precision tope de espera, no usar cache 
{
    enableHighAccuracy: true, // intenta usar gps/alta presicion
    timeout: 10000,           // falla si no responde en 10 s
    maximumAge: 0             // no uses posiciones en cache

}
    );

//(opcional avanzado) seguir el movimiento en tiempo real:
// si quieres que la posicion se actualice si el usuario se mueve:
 /* 
  const watchId = navigator.geolocalizacion.watchposition(
  (pos)=> {
  const {latitude, longitude, accuracy} = pos.coords;
  showposition(latitude, longitude, accuracy);
  },
  (err) => console.warn('Error en watchPosition:', err),
  {enableHighAccuracy: true , maximumAge: 0, timeout:1000 }
  );

 */

 //para detener el seguimiento:
 /*
  navigator.geolocation.clearWatch(watchId);

  */
  
}  else {
    // el navegador no soporta geolocalizacion 
    showFallback('Geolocalizacion API not supported');

}
});
