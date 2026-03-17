let canales = [];
let canalActual = 0;

// TIEMPO GLOBAL (clave 🔥)
const inicioGlobal = Math.floor(Date.now() / 1000);

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
    let btn = document.createElement("div");
    btn.innerText = "📺 " + c.nombre;
    btn.className = "canal";
    btn.onclick = () => cambiarCanal(i);
    cont.appendChild(btn);
  });
}

function cambiarCanal(i) {
  canalActual = i;
  reproducir();
  generarEPG();
}

function cargarCanal(i) {
  canalActual = i;
  reproducir();
  generarEPG();
}

function reproducir() {
  const canal = canales[canalActual];

  const totalDuracion = canal.duraciones.reduce((a,b)=>a+b,0);

  let tiempo = inicioGlobal % totalDuracion;

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

function playVideo(id, start) {
  const iframe = document.getElementById("video");

  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&start=${Math.floor(start)}`;
}

function generarEPG() {
  const canal = canales[canalActual];
  const cont = document.getElementById("programacion");

  cont.innerHTML = "";

  let tiempo = new Date();

  canal.videos.slice(0,5).forEach((v, i) => {

    let dur = canal.duraciones[i];

    let inicio = new Date(tiempo);
    let fin = new Date(tiempo.getTime() + dur*1000);

    let div = document.createElement("div");
    div.innerText = `${inicio.toLocaleTimeString()} - ${fin.toLocaleTimeString()}`;

    cont.appendChild(div);

    tiempo = fin;
  });
}