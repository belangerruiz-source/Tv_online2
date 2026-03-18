const EPOCH = 1700000000;

let canales = [];
let canalActual = 0;

function reproducir() {
  const canal = canales[canalActual];

  const total = canal.duraciones.reduce((a,b)=>a+b,0);

  const ahora = Math.floor(Date.now() / 1000);
  const tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;

  for (let i = 0; i < canal.videos.length; i++) {
    let dur = canal.duraciones[i];

    if (tiempo < acumulado + dur) {
      let offset = tiempo - acumulado;
      playVideo(canal.videos[i], offset);
      return;
    }

    acumulado += dur;
  }
}

fetch("canales.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar canales.json");
    }
    return response.json();
  })
  .then(data => {
    console.log("Datos cargados:", data);
    canales = data;

    canalActual = 0;
    reproducir();
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Error cargando los canales");
  });