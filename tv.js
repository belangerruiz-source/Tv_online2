const EPOCH = 1700000000;

let canales = [];
let canalActual = 0;
let player;
let userInteracted = false;
let titulosCache = {};

// ===============================
// YOUTUBE API
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
      onReady: () => iniciarTV()
    }
  });
};

// ===============================
// REPRODUCCIÓN TV REAL
// ===============================
function reproducir() {
  if (!canales.length || !player) return;

  const canal = canales[canalActual];
  const total = canal.duraciones.reduce((a,b)=>a+b,0);

  const ahora = Math.floor(Date.now() / 1000);
  const tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;

  for (let i = 0; i < canal.videos.length; i++) {
    let dur = canal.duraciones[i];

    if (tiempo < acumulado + dur) {
      let offset = tiempo - acumulado;

      player.loadVideoById({
        videoId: canal.videos[i],
        startSeconds: Math.floor(offset)
      });

      if (userInteracted) player.unMute();
      else player.mute();

      mostrarProgramacion(i);
      return;
    }

    acumulado += dur;
  }
}

// ===============================
// LISTA DE CANALES
// ===============================
function crearCanales() {
  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((canal, i) => {
    const div = document.createElement("div");

    div.innerText = canal.nombre;
    div.style.padding = "15px";
    div.style.margin = "8px";
    div.style.background = i === canalActual ? "#333" : "#111";
    div.style.color = "white";
    div.style.borderRadius = "8px";

    div.onclick = () => {
      canalActual = i;
      userInteracted = true;
      reproducir();
      crearCanales();
    };

    cont.appendChild(div);
  });
}

// ===============================
// TITULOS (NO BLOQUEA)
// ===============================
function cargarTitulos() {
  canales.forEach(canal => {
    canal.videos.forEach(async vid => {
      if (!titulosCache[vid]) {
        titulosCache[vid] = "Cargando...";
        actualizarProgramacion();

        try {
          const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${vid}`);
          const data = await res.json();
          titulosCache[vid] = data.title || "Sin título";
        } catch {
          titulosCache[vid] = "Sin título";
        }

        actualizarProgramacion();
      }
    });
  });
}

// ===============================
// PROGRAMACIÓN
// ===============================
function mostrarProgramacion(actualIndex) {
  const cont = document.getElementById("programacion");
  const canal = canales[canalActual];

  let html = `<h3 style="color:white;">${canal.nombre}</h3>`;

  canal.videos.forEach((vid, i) => {
    let titulo = titulosCache[vid] || "Cargando...";

    html += `
      <div style="color:${i===actualIndex?"yellow":"white"}; margin:5px;">
        ${i===actualIndex?" ":""}${titulo}
      </div>
    `;
  });

  cont.innerHTML = html;
}

function actualizarProgramacion() {
  mostrarProgramacion(0);
}

// ===============================
// INIT
// ===============================
function iniciarTV() {
  crearCanales();
  reproducir();
  cargarTitulos();

  setInterval(reproducir, 10000);
}

// ===============================
// CARGAR JSON
// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;
    cargarYouTubeAPI();
  });