const EPOCH = 1700000000;

let canales = [];
let canalActual = 0;
let player;
let userInteracted = false;

// ===============================
// 🔹 Cargar YouTube API
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
      controls: 0,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onReady: () => {
        reproducir();
      }
    }
  });
};

// ===============================
// 🔹 Reproducir tipo TV
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
      return;
    }

    acumulado += dur;
  }
}

// ===============================
// 🔹 Reproducir video
// ===============================
function playVideo(videoId, start) {
  if (!player) return;

  player.loadVideoById({
    videoId: videoId,
    startSeconds: Math.floor(start)
  });

  if (userInteracted) {
    player.unMute();
  } else {
    player.mute();
  }
}

// ===============================
// 🔹 Crear lista de canales
// ===============================
function crearListaCanales() {
  const contenedor = document.getElementById("canales");
  contenedor.innerHTML = "";

  canales.forEach((canal, index) => {
    const btn = document.createElement("div");
    btn.textContent = canal.nombre;
    btn.style.cursor = "pointer";
    btn.style.padding = "10px";
    btn.style.color = "white";

    btn.onclick = () => {
      canalActual = index;
      userInteracted = true; // 🔥 QUITA MUTE
      reproducir();
    };

    contenedor.appendChild(btn);
  });
}

// ===============================
// 🔹 Inicializar TV
// ===============================
function iniciarTV() {
  crearListaCanales();
  reproducir();

  // refresca cada cierto tiempo (por si cambia video)
  setInterval(() => {
    reproducir();
  }, 10000);
}

// ===============================
// 🔹 Cargar JSON
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