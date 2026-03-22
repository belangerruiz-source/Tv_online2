let canalActual = 0;
let canales = [];
let indiceVideo = 0;
let timeoutCambio = null;

// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;

    //  recuperar último canal
    const guardado = localStorage.getItem("canal");
    if (guardado !== null) canalActual = parseInt(guardado);

    crearCanales();
    iniciarCanal();
  });

// ===============================
function iniciarCanal() {
  indiceVideo = 0;
  reproducir();
  mostrarProgramacion();
}

// ===============================
function reproducir() {
  const canal = canales[canalActual];
  const video = canal.programas[indiceVideo];

  if (!video) return;

  document.getElementById("player").innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/${video.id}?autoplay=1&mute=0"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;

  //  cambio automático al siguiente video
  clearTimeout(timeoutCambio);
  timeoutCambio = setTimeout(() => {
    siguienteVideo();
  }, (video.duracion || 1800) * 1000);
}

// ===============================
function siguienteVideo() {
  const canal = canales[canalActual];

  indiceVideo++;

  if (indiceVideo >= canal.programas.length) {
    indiceVideo = 0; // loop
  }

  reproducir();
  mostrarProgramacion();
}

// ===============================
function cambiarCanal(direccion) {
  canalActual += direccion;

  if (canalActual < 0) canalActual = canales.length - 1;
  if (canalActual >= canales.length) canalActual = 0;

  //  guardar canal
  localStorage.setItem("canal", canalActual);

  iniciarCanal();
}

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
function mostrarProgramacion() {
  const canal = canales[canalActual];
  const cont = document.getElementById("programacion");

  cont.innerHTML = "";

  let ahora = new Date();

  for (let i = 0; i < 5; i++) {
    let prog = canal.programas[(indiceVideo + i) % canal.programas.length];

    let hora = new Date(ahora.getTime() + i * (prog.duracion || 1800) * 1000);

    let div = document.createElement("div");

    div.innerHTML = `
      <b>${hora.getHours().toString().padStart(2,"0")}:${hora.getMinutes().toString().padStart(2,"0")}</b>
      - ${prog.titulo || "Programa"}
    `;

    cont.appendChild(div);
  }
}

// ===============================
//  CONTROL REMOTO (TECLADO / TV)
// ===============================
document.addEventListener("keydown", (e) => {

  if (e.key === "ArrowUp") {
    cambiarCanal(-1);
  }

  if (e.key === "ArrowDown") {
    cambiarCanal(1);
  }

  if (e.key === "Enter") {
    siguienteVideo();
  }
});