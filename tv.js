// ===============================
// CONFIG GLOBAL
// ===============================
const EPOCH = 1700000000;

let canales = [];
let canalActual = 0;
let indiceVideo = 0;

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
    reproducir();
    mostrarProgramacion();
  })
  .catch(err => {
    document.body.innerHTML = "<h2 style='color:red'>Error cargando canales.json</h2>";
    console.error(err);
  });

// ===============================
// REPRODUCCIÓN TIPO TV REAL
// ===============================
function reproducir() {

  const canal = canales[canalActual];
  if (!canal || !canal.programas) return;

  const total = canal.programas.reduce((acc, p) => acc + (p.duracion || 1800), 0);

  const ahora = Math.floor(Date.now() / 1000);
  const tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;

  for (let i = 0; i < canal.programas.length; i++) {

    let dur = canal.programas[i].duracion || 1800;

    if (tiempo < acumulado + dur) {

      indiceVideo = i;
      let offset = tiempo - acumulado;
      let video = canal.programas[i];

      document.getElementById("player").innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/${video.id}?autoplay=1&start=${offset}&mute=0&controls=0&modestbranding=1&rel=0"
          frameborder="0"
          allow="autoplay"
          allowfullscreen>
        </iframe>
      `;

      return;
    }

    acumulado += dur;
  }
}

// ===============================
// CREAR LISTA DE CANALES
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

      reproducir();
      mostrarProgramacion();
    };

    cont.appendChild(div);
  });
}

// ===============================
// PROGRAMACIÓN (EPG LIGERO)
// ===============================
function mostrarProgramacion() {

  const cont = document.getElementById("programacion");
  cont.innerHTML = "";

  const canal = canales[canalActual];
  let ahora = new Date();

  //  SOLO 6 PROGRAMAS PARA NO LAG
  for (let i = 0; i < 6; i++) {

    let prog = canal.programas[(indiceVideo + i) % canal.programas.length];
    let dur = (prog.duracion || 1800) * 1000;

    let hora = new Date(ahora.getTime() + i * dur);

    let div = document.createElement("div");
    div.style.marginBottom = "12px";

    div.innerHTML = `
      <div style="color:#00ffcc; font-size:18px;">
        ${hora.getHours().toString().padStart(2,"0")}:${hora.getMinutes().toString().padStart(2,"0")}
      </div>

      <div style="font-size:20px; font-weight:bold;">
        ${prog.titulo || "Programa"}
      </div>

      <div style="font-size:16px; color:#aaa;">
        ${prog.descripcion || ""}
      </div>
    `;

    cont.appendChild(div);
  }
}

// ===============================
// CONTROL REMOTO (TECLADO)
// ===============================
document.addEventListener("keydown", (e) => {

  if (e.key === "ArrowUp") {
    cambiarCanal(-1);
  }

  if (e.key === "ArrowDown") {
    cambiarCanal(1);
  }

  if (e.key === "Enter") {
    reproducir();
  }
});

// ===============================
// CAMBIAR CANAL
// ===============================
function cambiarCanal(dir) {

  canalActual += dir;

  if (canalActual < 0) canalActual = canales.length - 1;
  if (canalActual >= canales.length) canalActual = 0;

  localStorage.setItem("canal", canalActual);

  reproducir();
  mostrarProgramacion();
}