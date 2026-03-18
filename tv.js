const EPOCH = 1700000000;

let canales = [];
let canalActual = 0;
let player;
let userInteracted = false;

// ===============================
//  Cargar YouTube API
// ===============================
function cargarYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

// ===============================
//  API lista
// ===============================
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("video", {
    height: "100%",
    width: "100%",
    videoId: "",
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onReady: () => {
        iniciarTV();
      }
    }
  });
};

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
//  Reproducir video
// ===============================
function playVideo(videoId, start) {
  if (!player) return;

  try {
    player.loadVideoById({
      videoId: videoId,
      startSeconds: Math.floor(start)
    });

    if (userInteracted) {
      player.unMute(); //  se activa al tocar canal
    } else {
      player.mute(); // inicia en silencio
    }

  } catch (e) {
    console.error("Error en reproducción:", e);
  }
}

// ===============================
//  Lista de canales
// ===============================
function crearListaCanales() {
  const contenedor = document.getElementById("canales");
  contenedor.innerHTML = "";

  canales.forEach((canal, index) => {
    const btn = document.createElement("div");
    btn.textContent = canal.nombre;

    btn.onclick = () => {
      canalActual = index;
      userInteracted = true; //  quita mute
      reproducir();
    };

    contenedor.appendChild(btn);
  });
}

// ===============================
//  Mostrar programación
// ===============================
function mostrarProgramacion() {
  const cont = document.getElementById("programacion");
  const canal = canales[canalActual];

  let html = `<h3 style="color:white;">${canal.nombre}</h3>`;

  canal.videos.forEach((vid, i) => {
    html += `<div style="color:gray; font-size:12px;">
      Video ${i + 1} - ${canal.duraciones[i]} seg
    </div>`;
  });

  cont.innerHTML = html;
}

// ===============================
//  Inicializar TV
// ===============================
function iniciarTV() {
  crearListaCanales();
  reproducir();

  //  refresco automático
  setInterval(() => {
    reproducir();
  }, 10000);
}

// ===============================
//  Cargar JSON
// ===============================
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

    cargarYouTubeAPI();
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Error cargando los canales");
  });