// ===============================
// CONFIGURACIÓN DE CANALES
// ===============================
const canales = [
  {
    nombre: "Canal 1",
    videos: ["dQw4w9WgXcQ", "3JZ_D3ELwOQ"]
  },
  {
    nombre: "Canal 2",
    videos: ["L_jWHffIx5E", "Zi_XLOBDo_Y"]
  }
];

// ===============================
// VARIABLES GLOBALES
// ===============================
let canalActual = 0;
let player = document.getElementById("video");
let titulosCache = {};

// ===============================
// OBTENER TÍTULO REAL (SIN API KEY)
// ===============================
async function obtenerTituloReal(videoId) {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await res.json();
    return data.title || "Sin título";
  } catch (e) {
    return "Error cargando";
  }
}

// ===============================
// CARGAR TÍTULOS (CON CACHE)
// ===============================
async function cargarTitulos() {
  // cargar cache guardado
  const guardado = localStorage.getItem("titulosCache");
  if (guardado) titulosCache = JSON.parse(guardado);

  let ids = [];
  canales.forEach(c => ids.push(...c.videos));

  for (let id of ids) {
    if (!titulosCache[id]) {
      titulosCache[id] = await obtenerTituloReal(id);
    }
  }

  // guardar cache
  localStorage.setItem("titulosCache", JSON.stringify(titulosCache));
}

// ===============================
// MINIATURA
// ===============================
function getThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// ===============================
// CREAR LISTA DE CANALES (MEJOR UI)
// ===============================
function crearListaCanales() {
  let contenedor = document.getElementById("canales");
  contenedor.innerHTML = "";

  canales.forEach((canal, index) => {
    let div = document.createElement("div");

    div.style.margin = "12px";
    div.style.padding = "10px";
    div.style.borderRadius = "10px";
    div.style.background = index === canalActual ? "#333" : "#111";
    div.style.cursor = "pointer";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "10px";

    let img = document.createElement("img");
    img.src = getThumbnail(canal.videos[0]);
    img.style.width = "120px";
    img.style.borderRadius = "8px";

    let texto = document.createElement("div");
    texto.innerText = canal.nombre;
    texto.style.color = "white";

    div.appendChild(img);
    div.appendChild(texto);

    div.onclick = () => {
      canalActual = index;
      guardarCanal();
      reproducir(true);
      crearListaCanales();
    };

    contenedor.appendChild(div);
  });
}

// ===============================
// REPRODUCIR VIDEO
// ===============================
function reproducir(quitarMute = false) {
  let canal = canales[canalActual];
  let ahora = Math.floor(Date.now() / 1000);

  let duracionTotal = canal.videos.length * 300;
  let tiempo = ahora % duracionTotal;

  let index = Math.floor(tiempo / 300);
  let videoId = canal.videos[index];

  let autoplay = 1;
  let mute = quitarMute ? 0 : 1;

  player.src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}`;

  mostrarProgramacion(index);
}

// ===============================
// PROGRAMACIÓN CON TÍTULOS REALES
// ===============================
function mostrarProgramacion(actualIndex) {
  let cont = document.getElementById("programacion");
  cont.innerHTML = "";

  let canal = canales[canalActual];

  canal.videos.forEach((vid, i) => {
    let div = document.createElement("div");

    let titulo = titulosCache[vid] || "Cargando...";

    div.innerText = `${i === actualIndex ? " " : ""}${titulo}`;

    div.style.color = i === actualIndex ? "yellow" : "white";
    div.style.margin = "6px";

    cont.appendChild(div);
  });
}

// ===============================
// GUARDAR / CARGAR CANAL
// ===============================
function guardarCanal() {
  localStorage.setItem("canalActual", canalActual);
}

function cargarCanalGuardado() {
  let guardado = localStorage.getItem("canalActual");
  if (guardado !== null) canalActual = parseInt(guardado);
}

// ===============================
// INICIAR TV
// ===============================
async function iniciarTV() {
  cargarCanalGuardado();

  await cargarTitulos(); //  títulos reales

  crearListaCanales();
  reproducir();

  setInterval(reproducir, 10000);
}

iniciarTV();