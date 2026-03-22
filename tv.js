let player;
let canalActual = 0;
let canales = [];
let cargado = false;

// ===============================
//  YOUTUBE API
// ===============================
function cargarYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("player", {
    width: "100%",
    height: "100%",
    videoId: "",
    playerVars: {
      autoplay: 1,
      controls: 1,
      mute: 1
    },
    events: {
      onReady: intentarInicio,
      onStateChange: estadoPlayer
    }
  });
};

// ===============================
//  CARGAR JSON
// ===============================
function cargarCanales() {
  fetch("canales.json")
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar JSON");
      return res.json();
    })
    .then(data => {
      canales = data;
      cargado = true;
      intentarInicio();
    })
    .catch(err => {
      console.error(err);
      alert("Error cargando canales.json");
    });
}

// ===============================
//  INICIO SEGURO
// ===============================
function intentarInicio() {
  if (!player || !cargado) return;

  crearCanales();
  reproducir();
}

// ===============================
//  REPRODUCCIÓN
// ===============================
function reproducir() {
  const canal = canales[canalActual];

  if (!canal || !canal.programas || canal.programas.length === 0) return;

  const video = canal.programas[0]; //  inicia con el primero SIEMPRE

  player.loadVideoById(video.id);
}

// ===============================
//  SIGUIENTE VIDEO
// ===============================
function estadoPlayer(e) {
  if (e.data === YT.PlayerState.ENDED) {
    siguienteVideo();
  }
}

function siguienteVideo() {
  const canal = canales[canalActual];

  let actual = player.getVideoData().video_id;
  let index = canal.programas.findIndex(p => p.id === actual);

  let siguiente = canal.programas[(index + 1) % canal.programas.length];

  player.loadVideoById(siguiente.id);
}

// ===============================
//  UI CANALES
// ===============================
function crearCanales() {
  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {
    const div = document.createElement("div");

    div.style.padding = "12px";
    div.style.borderBottom = "1px solid #333";
    div.style.cursor = "pointer";

    div.innerText = (i + 1) + ". " + c.nombre;

    div.onclick = () => {
      canalActual = i;
      player.unMute();
      reproducir();
    };

    cont.appendChild(div);
  });
}

// ===============================
cargarYouTubeAPI();
cargarCanales();