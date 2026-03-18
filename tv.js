const EPOCH = 1700000000;
const API_KEY = "AIzaSyDsCEmTUrXyr7E8RJQqbZt4AV0IN9XQHiI";

let canales = [];
let canalActual = 0;
let player;
let userInteracted = false;
let titulosCache = {};

// ===============================
//  YouTube API PLAYER
// ===============================
function cargarYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("video", {
    height: "100%",
    width: "100%",
    videoId: "",
    playerVars: {
      autoplay: 1,
      controls: 0
    },
    events: {
      onReady: () => {
        iniciarTV();
      }
    }
  });
};

// ===============================
//  Obtener títulos automáticamente
// ===============================
async function obtenerTitulos(videoIds) {
  const ids = videoIds.join(",");

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    data.items.forEach(item => {
      titulosCache[item.id] = {
        titulo: item.snippet.title,
        thumb: item.snippet.thumbnails.medium.url
      };
    });

  } catch (e) {
    console.error("Error obteniendo títulos:", e);
  }
}

// ===============================
//  Reproducir tipo TV
// ===============================
function reproducir() {
  if (!canales.length || !player) return;

  const canal = canales[canalActual];
  const total = canal.duraciones.reduce((a, b) => a + b, 0);

  const ahora = Math.floor(Date.now() / 1000);
  const tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;

  for (let i = 0; i < canal.videos.length; i++) {
    let dur = canal.duraciones[i];

    if (tiempo < acumulado + dur) {
      let offset = tiempo - acumulado;
      playVideo(canal.videos[i], offset);
      mostrarProgramacion();
      return;
    }

    acumulado += dur;
  }
}

// ===============================
//  Play video
// ===============================
function playVideo(videoId, start) {
  player.loadVideoById({
    videoId: videoId,
    startSeconds: Math.floor(start)
  });

  if (userInteracted) player.unMute();
  else player.mute();
}

// ===============================
//  Lista de canales con miniaturas
// ===============================
function crearListaCanales() {
  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((canal, index) => {
    const firstVideo = canal.videos[0];
    const thumb = titulosCache[firstVideo]?.thumb || "";

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${thumb}" style="width:100%; border-radius:6px;">
      <div>${canal.nombre}</div>
    `;

    div.onclick = () => {
      canalActual = index;
      userInteracted = true;
      guardarCanal();
      reproducir();
    };

    cont.appendChild(div);
  });
}

// ===============================
//  Programación PRO
// ===============================
function mostrarProgramacion() {
  const cont = document.getElementById("programacion");
  const canal = canales[canalActual];

  let html = `<h3 style="color:white;">${canal.nombre}</h3>`;

  const ahora = Math.floor(Date.now() / 1000);
  const total = canal.duraciones.reduce((a, b) => a + b, 0);
  let tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;
  let hora = new Date();

  for (let i = 0; i < canal.videos.length; i++) {
    let dur = canal.duraciones[i];

    if (tiempo >= acumulado + dur) {
      acumulado += dur;
      continue;
    }

    let offset = tiempo - acumulado;
    let inicio = new Date(hora.getTime() - offset * 1000);

    for (let j = i; j < canal.videos.length; j++) {
      let vid = canal.videos[j];
      let titulo = titulosCache[vid]?.titulo || "Cargando...";
      let duracion = canal.duraciones[j];

      let fin = new Date(inicio.getTime() + duracion * 1000);

      html += `
        <div style="margin-bottom:8px;">
          <b>${formatearHora(inicio)} - ${formatearHora(fin)}</b><br>
          <span style="color:gray;">${titulo}</span>
        </div>
      `;

      inicio = fin;
    }

    break;
  }

  cont.innerHTML = html;
}

function formatearHora(f) {
  return f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===============================
//  Control remoto (teclado)
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    canalActual = (canalActual - 1 + canales.length) % canales.length;
  }

  if (e.key === "ArrowDown") {
    canalActual = (canalActual + 1) % canales.length;
  }

  if (e.key === "Enter") {
    userInteracted = true;
  }

  guardarCanal();
  reproducir();
});

// ===============================
//  Guardar canal
// ===============================
function guardarCanal() {
  localStorage.setItem("canalActual", canalActual);
}

function cargarCanalGuardado() {
  const guardado = localStorage.getItem("canalActual");
  if (guardado !== null) canalActual = parseInt(guardado);
}

// ===============================
//  Inicializar
// ===============================
async function iniciarTV() {
  cargarCanalGuardado();

  // obtener todos los IDs
  let ids = [];
  canales.forEach(c => ids.push(...c.videos));

  await obtenerTitulos(ids);

  crearListaCanales();
  reproducir();

  setInterval(reproducir, 10000);
}

// ===============================
//  Cargar JSON
// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;
    cargarYouTubeAPI();
  });