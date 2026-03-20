const EPOCH = 1700000000;

//  CANALES FIJOS (estables)
const canales = [
  {
    nombre: "CIUDADES",
    videos: ["ui3n5jDnZo8","1Np-Ea6XCgc","VkIuG4AYTp0"],
    duraciones: [1369, 887, 1142]
  },
  {
    nombre: "HISTORIA",
    videos: ["aDcKkboqLKw","n1JXIUsGZR8","4dKumyZhw24"],
    duraciones: [2492,2484,2521]
  },
  {
    nombre: "UNIVERSO",
    videos: ["Yw7q6xHneN0","nzICDsGjAEA","11hpS7F0YuI"],
    duraciones: [3008,2580,2521]
  }
  {
nombre: "PROCESOS"
videos: [https://www.youtube.com/playlist?list=PLCKML06wO4bl4kUTJeL7mBH8MqZUnhCi3],
 duraciones:[4000,3500,3200]
	}
];

let canalActual = 0;
let player;
let userInteracted = false;

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
    width: "100%",
    height: "100%",
    videoId: "",
    playerVars: {
      autoplay: 1,
      controls: 1
    },
    events: {
  onReady: iniciarTV,
  onStateChange: onPlayerStateChange
    }
  });
};
function onPlayerStateChange(event) {

  // 0 = video terminó
  if (event.data === 0) {
    console.log("Video terminó  cargando siguiente");

    reproducir(); //  carga el siguiente automáticamente
  }
}
// ===============================
// REPRODUCCIÓN
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

if (player.getVideoData().video_id !== canal.videos[i]) {
  player.loadVideoById({
    videoId: canal.videos[i],
    startSeconds: Math.floor(offset)
  });
}
      
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

    div.className = "canal" + (i === canalActual ? " activo" : "");
    div.innerText = canal.nombre;

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
// PROGRAMACIÓN SIMPLE (FUNCIONA)
// ===============================
function mostrarProgramacion(actualIndex) {
  const cont = document.getElementById("programacion");
  const canal = canales[canalActual];

  let html = `<h3>${canal.nombre}</h3>`;

  const ahora = Math.floor(Date.now() / 1000);
  const total = canal.duraciones.reduce((a,b)=>a+b,0);

  let tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;
  let inicioReal = new Date();

  for (let i = 0; i < canal.videos.length; i++) {
    let dur = canal.duraciones[i];

    if (tiempo < acumulado + dur) {

      let offset = tiempo - acumulado;

      //  inicio del programa actual
      let inicio = new Date(inicioReal.getTime() - offset * 1000);

      //  mostramos 8 programas (tipo TV)
      for (let j = 0; j < 8; j++) {

        let index = (i + j) % canal.videos.length;
        let vid = canal.videos[index];
        let duracion = canal.duraciones[index];

        let fin = new Date(inicio.getTime() + duracion * 1000);

        let titulo = generarTitulo(vid);

        html += `
          <div style="margin:8px; color:${j===0?"yellow":"white"};">
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
function iniciarTV() {
  crearCanales();
  reproducir();
}

// ===============================
cargarYouTubeAPI();

function formatearHora(fecha) {
  return fecha.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generarTitulo(id) {
  return "Programa " + id.substring(0, 6);
}