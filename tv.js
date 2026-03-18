const EPOCH = 1700000000;

//  DATOS DIRECTOS (SIN JSON)
const canales = [
  {
    nombre: "CIUDADES",
    videos: [
      "ui3n5jDnZo8","1Np-Ea6XCgc","VkIuG4AYTp0"
    ],
    duraciones: [1369, 887, 1142]
  },
  {
    nombre: "HISTORIA",
    videos: [
      "aDcKkboqLKw","n1JXIUsGZR8","4dKumyZhw24"
    ],
    duraciones: [2492,2484,2521]
  },
  {
    nombre: "UNIVERSO",
    videos: [
      "Yw7q6xHneN0","nzICDsGjAEA","11hpS7F0YuI"
    ],
    duraciones: [3008,2580,2521]
  }
];

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
// REPRODUCCIÓN TV
// ===============================
function reproducir() {
  const canal = canales[canalActual];

  const total = canal.duraciones.reduce((a,b)=>a+b,0);
  const ahora = Math.floor(Date.now()/1000);
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
// CANALES
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
// TITULOS REALES
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
function mostrarProgramacion() {
  const cont = document.getElementById("programacion");
  const canal = canales[canalActual];

  let html = `<h3 style="color:white;">${canal.nombre}</h3>`;

  const ahora = Math.floor(Date.now() / 1000);
  const total = canal.duraciones.reduce((a,b)=>a+b,0);

  let tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;
  let inicioReal = new Date();

  // encontrar programa actual
  for (let i = 0; i < canal.videos.length; i++) {
    let dur = canal.duraciones[i];

    if (tiempo < acumulado + dur) {

      let offset = tiempo - acumulado;

      // hora de inicio del programa actual
      let inicio = new Date(inicioReal.getTime() - offset * 1000);

      // mostrar siguientes programas
      for (let j = i; j < canal.videos.length; j++) {

        let vid = canal.videos[j];
        let duracion = canal.duraciones[j];

        let fin = new Date(inicio.getTime() + duracion * 1000);

        let titulo = titulosCache[vid] || "Cargando...";

        html += `
          <div style="margin:8px; color:${j===i?"yellow":"white"};">
            <b>${formatearHora(inicio)} - ${formatearHora(fin)}</b><br>
            ${titulo}
          </div>
        `;

        inicio = fin;
      }

      break;
    }

    acumulado += dur;
  }

  cont.innerHTML = html;
}

// ===============================
function formatearHora(fecha) {
  return fecha.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
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
cargarYouTubeAPI();