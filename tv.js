let canales = [];
let canalActual = 0;
let inicioCanal = 0;

fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;
    renderCanales();
    cargarCanal(0);
  });

function renderCanales() {
  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {
    let div = document.createElement("div");
    div.innerText = c.nombre;
    div.onclick = () => cargarCanal(i);
    cont.appendChild(div);
  });
}

function cargarCanal(i) {
  canalActual = i;
  inicioCanal = Date.now() / 1000;

  reproducir();
  generarEPG();
}

function reproducir() {
  const canal = canales[canalActual];
  const ahora = Date.now() / 1000;

  let tiempo = ahora - inicioCanal;
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

  inicioCanal = ahora;
  reproducir();
}

function playVideo(id, start) {
  const iframe = document.getElementById("video");
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&start=${Math.floor(start)}`;
}

function generarEPG() {
  const canal = canales[canalActual];
  const cont = document.getElementById("programacion");

  cont.innerHTML = "";

  canal.videos.forEach((v, i) => {
    let div = document.createElement("div");
    div.innerText = `Video ${i+1} (${canal.duraciones[i]}s)`;
    cont.appendChild(div);
  });
}