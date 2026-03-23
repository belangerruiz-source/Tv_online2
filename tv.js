// ===============================
// VARIABLES
// ===============================
let canales = [];
let canalActual = 0;
let indiceVideo = 0;
let inicioVideo = 0;
let duracionActual = 0;
let intervalo = null;

// ===============================
// INICIO
// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;

    const guardado = localStorage.getItem("canal");
    if (guardado !== null) canalActual = parseInt(guardado);

    crearCanales();
    iniciarCanal();
  });

// ===============================
// INICIAR CANAL
// ===============================
function iniciarCanal() {
  indiceVideo = 0;
  reproducir();
  mostrarProgramacion();
}

// ===============================
// REPRODUCIR VIDEO
// ===============================
function reproducir() {

  const canal = canales[canalActual];
  const video = canal.programas[indiceVideo];

  if (!video) return;

  inicioVideo = Date.now();
  duracionActual = video.duracion || 1800;

  document.getElementById("player").innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0"
      frameborder="0"
      allow="autoplay"
      allowfullscreen>
    </iframe>
  `;

  // actualizar progreso
  clearInterval(intervalo);
  intervalo = setInterval(actualizarProgreso, 1000);

  // cambio automático
  setTimeout(() => {
    siguienteVideo();
  }, duracionActual * 1000);
}

// ===============================
// SIGUIENTE VIDEO
// ===============================
function siguienteVideo() {
  const canal = canales[canalActual];

  indiceVideo++;

  if (indiceVideo >= canal.programas.length) {
    indiceVideo = 0;
  }

  reproducir();
  mostrarProgramacion();
}

// ===============================
// PROGRESO
// ===============================
function actualizarProgreso() {

  const cont = document.getElementById("programacion");

  if (!cont) return;

  const transcurrido = Math.floor((Date.now() - inicioVideo) / 1000);

  const actual = formatearTiempo(transcurrido);
  const total = formatearTiempo(duracionActual);

  const prog = canales[canalActual].programas[indiceVideo];

  cont.innerHTML = `
    <div style="font-size:22px; color:#00ffcc;">
       ${prog.titulo}
    </div>

    <div style="font-size:16px; color:#aaa;">
      ${prog.descripcion || ""}
    </div>

    <div style="margin-top:10px;">
      ${actual} / ${total}
    </div>

    <hr style="margin:10px 0;">

    <div style="font-size:18px;">Siguiente:</div>
  `;

  // siguientes programas
  const canal = canales[canalActual];

  for (let i = 1; i <= 5; i++) {
    let next = canal.programas[(indiceVideo + i) % canal.programas.length];

    cont.innerHTML += `
      <div style="font-size:16px;">
        • ${next.titulo}
      </div>
    `;
  }
}

// ===============================
// FORMATO TIEMPO
// ===============================
function formatearTiempo(seg) {
  let m = Math.floor(seg / 60);
  let s = seg % 60;

  return `${m}:${s.toString().padStart(2,"0")}`;
}

// ===============================
// CREAR CANALES
// ===============================
function crearCanales() {
  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {

    const div = document.createElement("div");
    div.className = "canal";
    div.innerText = (i + 1) + ". " + c.nombre;

    div.onclick = () => {
      canalActual = i;
      localStorage.setItem("canal", canalActual);

      iniciarCanal();
    };

    cont.appendChild(div);
  });
}

// ===============================
// CONTROLES TECLADO
// ===============================
document.addEventListener("keydown", (e) => {

  if (e.key === "ArrowUp") cambiarCanal(-1);
  if (e.key === "ArrowDown") cambiarCanal(1);
  if (e.key === "Enter") siguienteVideo();
});

// ===============================
function cambiarCanal(dir) {
  canalActual += dir;

  if (canalActual < 0) canalActual = canales.length - 1;
  if (canalActual >= canales.length) canalActual = 0;

  localStorage.setItem("canal", canalActual);

  iniciarCanal();
}