let player;
let canalActual = 0;
let canales = [];

// ===============================
function log(msg) {
  document.body.innerHTML += `<p style="color:lime">${msg}</p>`;
  console.log(msg);
}

// ===============================
//  YOUTUBE API
// ===============================
function cargarYouTubeAPI() {
  log("Cargando YouTube API...");

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  log("YouTube API lista");

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
      onReady: () => {
        log("Player listo");
        iniciarSiListo();
      }
    }
  });
};

// ===============================
//  CARGAR JSON
// ===============================
function cargarCanales() {
  log("Cargando canales.json...");

  fetch("canales.json")
    .then(res => {
      if (!res.ok) throw new Error("No carga JSON");
      return res.json();
    })
    .then(data => {
      log("JSON cargado OK");
      canales = data;
      iniciarSiListo();
    })
    .catch(err => {
      log("ERROR JSON");
      console.error(err);
    });
}

// ===============================
function iniciarSiListo() {
  if (!player || canales.length === 0) return;

  log("Iniciando TV...");

  crearCanales();
  reproducir();
}

// ===============================
//  REPRODUCIR
// ===============================
function reproducir() {
  const canal = canales[canalActual];

  if (!canal || !canal.programas || canal.programas.length === 0) {
    log("Canal sin programas");
    return;
  }

  const video = canal.programas[0];

  log("Reproduciendo: " + video.id);

  player.loadVideoById(video.id);
}

// ===============================
//  CANALES UI
// ===============================
function crearCanales() {
  const cont = document.getElementById("canales");

  if (!cont) {
    log("No existe div canales");
    return;
  }

  cont.innerHTML = "";

  canales.forEach((c, i) => {
    const div = document.createElement("div");

    div.innerText = (i+1) + ". " + c.nombre;
    div.style.padding = "10px";
    div.style.cursor = "pointer";

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