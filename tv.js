// ===============================
window.onerror = function(msg, url, line) {
  document.body.innerHTML = "<h2 style='color:red'>ERROR:</h2>" + msg + "<br>Linea: " + line;
  console.error(msg);
};

// ===============================
let player;
let canalActual = 0;
let canales = [];

// ===============================
function iniciar() {
  console.log("Iniciando sistema...");

  fetch("canales.json")
    .then(r => r.json())
    .then(data => {
      console.log("JSON cargado", data);

      canales = data;

      if (!canales || canales.length === 0) {
        throw new Error("JSON vacío");
      }

      cargarYouTube();
    })
    .catch(e => {
      document.body.innerHTML = "<h2 style='color:red'>Error cargando JSON</h2>";
      console.error(e);
    });
}

// ===============================
function cargarYouTube() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

// ===============================
window.onYouTubeIframeAPIReady = function () {
  console.log("YT listo");

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
        console.log("Player listo");
        crearCanales();
        reproducir();
      }
    }
  });
};

// ===============================
function reproducir() {
  const canal = canales[canalActual];

  if (!canal || !canal.programas || canal.programas.length === 0) {
    throw new Error("Canal sin programas");
  }

  let video = canal.programas[0];

  console.log("Reproduciendo:", video.id);

  player.loadVideoById(video.id);
}

// ===============================
function crearCanales() {
  const cont = document.getElementById("canales");

  if (!cont) {
    throw new Error("No existe #canales en HTML");
  }

  cont.innerHTML = "";

  canales.forEach((c, i) => {
    const div = document.createElement("div");

    div.innerText = (i + 1) + ". " + c.nombre;
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
iniciar();