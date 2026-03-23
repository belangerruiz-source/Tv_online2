let canalActual = 0;
let canales = [];
let indiceVideo = 0;
let timeoutCambio = null;
mostrarGuiaGlobal();

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
const EPOCH = 1700000000;

function reproducir() {
  const canal = canales[canalActual];

  const total = canal.programas.reduce((acc, p) => acc + (p.duracion || 1800), 0);

  const ahora = Math.floor(Date.now() / 1000);
  const tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;

  for (let i = 0; i < canal.programas.length; i++) {
    let dur = canal.programas[i].duracion || 1800;

    if (tiempo < acumulado + dur) {
      indiceVideo = i;
      let offset = tiempo - acumulado;

      const video = canal.programas[i].id;

      document.getElementById("player").innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/${video}?autoplay=1&start=${offset}&mute=0"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen>
        </iframe>
      `;

      return;
    }

    acumulado += dur;
  }
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
  const cont = document.getElementById("programacion");
  cont.innerHTML = "";

  const ahora = new Date();
  const canal = canales[canalActual];

  let tiempoBase = ahora.getTime();

  for (let i = 0; i < 24; i++) {

    let prog = canal.programas[(indiceVideo + i) % canal.programas.length];
    let dur = (prog.duracion || 1800) * 1000;

    let hora = new Date(tiempoBase);

    let div = document.createElement("div");

    div.innerHTML = `
      <b style="color:#00ffcc">
        ${hora.getHours().toString().padStart(2,"0")}:${hora.getMinutes().toString().padStart(2,"0")}
      </b>
      <div style="font-size:18px">${prog.titulo}</div>
      <div style="font-size:14px; color:#aaa">${prog.descripcion}</div>
    `;

    cont.appendChild(div);

    tiempoBase += dur;
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


function mostrarGuiaGlobal() {
  const guia = document.getElementById("guia");
  guia.innerHTML = "";

  canales.forEach((canal, index) => {
    let div = document.createElement("div");
    div.className = "guia-canal";

    let contenido = `<b>${index + 1}. ${canal.nombre}</b><br>`;

    for (let i = 0; i < 5; i++) {
      let prog = canal.programas[i];

      contenido += `
        <div style="font-size:14px;">
          • ${prog.titulo}
        </div>
      `;
    }

    div.innerHTML = contenido;
    guia.appendChild(div);
  });
}