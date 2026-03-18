// ===============================
// CONFIG
// ===============================
const canales = [
  {
    nombre: "CIUDADES",
    videos: ["ui3n5jDnZo8","1Np-Ea6XCgc","VkIuG4AYTp0"]
  },
  {
    nombre: "HISTORIA",
    videos: ["aDcKkboqLKw","n1JXIUsGZR8","4dKumyZhw24"]
  },
  {
    nombre: "UNIVERSO",
    videos: ["Yw7q6xHneN0","nzICDsGjAEA","11hpS7F0YuI"]
  }
];

// ===============================
let canalActual = 0;
let player = document.getElementById("video");
let titulosCache = {};

// ===============================
// TITULOS REALES (SIN API)
// ===============================
async function obtenerTitulo(videoId) {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await res.json();
    return data.title || "Sin título";
  } catch {
    return "Sin título";
  }
}

// ===============================
// CARGA DE TITULOS (NO BLOQUEA UI)
// ===============================
function cargarTitulos() {
  canales.forEach(canal => {
    canal.videos.forEach(async (vid) => {
      if (!titulosCache[vid]) {
        titulosCache[vid] = "Cargando...";
        mostrarProgramacion(); //  pinta mientras carga

        const titulo = await obtenerTitulo(vid);
        titulosCache[vid] = titulo;

        mostrarProgramacion(); //  actualiza
      }
    });
  });
}

// ===============================
// LISTA DE CANALES (SIN IMAGEN)
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
      reproducir(true);
      crearCanales();
    };

    cont.appendChild(div);
  });
}

// ===============================
// REPRODUCCIÓN TV
// ===============================
function reproducir(quitarMute = false) {
  const canal = canales[canalActual];

  const ahora = Math.floor(Date.now() / 1000);
  const duracion = canal.videos.length * 300;

  const index = Math.floor((ahora % duracion) / 300);
  const videoId = canal.videos[index];

  const mute = quitarMute ? 0 : 1;

  player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${mute}`;

  mostrarProgramacion(index);
}

// ===============================
// PROGRAMACIÓN (SIEMPRE VISIBLE)
// ===============================
function mostrarProgramacion(actual = 0) {
  const cont = document.getElementById("programacion");
  cont.innerHTML = "";

  const canal = canales[canalActual];

  canal.videos.forEach((vid, i) => {
    const div = document.createElement("div");

    const titulo = titulosCache[vid] || "Cargando...";

    div.innerText = `${i === actual ? " " : ""}${titulo}`;
    div.style.color = i === actual ? "yellow" : "white";
    div.style.margin = "6px";

    cont.appendChild(div);
  });
}

// ===============================
// INICIO
// ===============================
function iniciar() {
  crearCanales();
  reproducir();
  cargarTitulos();

  setInterval(reproducir, 10000);
}

iniciar();