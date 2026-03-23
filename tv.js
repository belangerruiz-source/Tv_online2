// ===============================
let canales = [];
let canalActual = null;

let estadoCanales = {};
let intervalo = null;

// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;
    crearCanales();
  });

// ===============================
function crearCanales() {

  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {

    let div = document.createElement("div");
    div.className = "canal";
    div.innerText = (i + 1) + ". " + c.nombre;

    div.onclick = () => seleccionarCanal(i);

    cont.appendChild(div);
  });
}

// ===============================
function seleccionarCanal(i) {

  if (canalActual !== null) guardarEstado();

  canalActual = i;

  if (!estadoCanales[i]) {
    estadoCanales[i] = {
      indice: 0,
      tiempo: 0,
      inicio: 0
    };
  }

  reproducir(false, 2000); //  sonido + delay
  mostrarProgramacion();
}

// ===============================
function reproducir(mute = false, delay = 0) {

  const canal = canales[canalActual];
  const estado = estadoCanales[canalActual];
  const prog = canal.programas[estado.indice];

  let start = Math.floor(estado.tiempo);

  setTimeout(() => {

    document.getElementById("player").innerHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${prog.id}?autoplay=1&start=${start}&mute=${mute ? 1 : 0}&controls=0&modestbranding=1&rel=0"
        frameborder="0"
        allow="autoplay"
        allowfullscreen>
      </iframe>
    `;

    estado.inicio = Date.now();
    iniciarProgreso();

  }, delay);
}

// ===============================
function iniciarProgreso() {

  clearInterval(intervalo);

  intervalo = setInterval(() => {

    const estado = estadoCanales[canalActual];
    const canal = canales[canalActual];
    const prog = canal.programas[estado.indice];

    let trans = Math.floor((Date.now() - estado.inicio) / 1000);
    let actual = estado.tiempo + trans;
    let total = prog.duracion || 1800;

    if (actual >= total) {
      siguienteVideo();
      return;
    }

    actualizarUI(actual, total, prog);

  }, 1000);
}

// ===============================
function siguienteVideo() {

  const estado = estadoCanales[canalActual];
  const canal = canales[canalActual];

  estado.indice++;
  estado.tiempo = 0;

  if (estado.indice >= canal.programas.length) {
    estado.indice = 0;
  }

  reproducir(false);
  mostrarProgramacion();
}

// ===============================
function guardarEstado() {

  const estado = estadoCanales[canalActual];

  let trans = Math.floor((Date.now() - estado.inicio) / 1000);
  estado.tiempo += trans;
}

// ===============================
function actualizarUI(actual, total, prog) {

  const cont = document.getElementById("programacion");

  let porcentaje = (actual / total) * 100;

  cont.innerHTML = `
    <div style="font-size:22px; color:#00ffcc;">
       ${prog.titulo}
    </div>

    <div style="color:#aaa;">
      ${prog.descripcion || ""}
    </div>

    <div style="margin-top:10px;">
      ${formato(actual)} / ${formato(total)}
    </div>

    <div style="width:100%; height:6px; background:#333;">
      <div style="width:${porcentaje}%; height:100%; background:#00ffcc;"></div>
    </div>

    <hr>

    <div style="font-size:18px;">Siguiente:</div>
  `;

  const canal = canales[canalActual];

  for (let i = 1; i <= 5; i++) {

    let next = canal.programas[(estadoCanales[canalActual].indice + i) % canal.programas.length];

    cont.innerHTML += `
      <div>
        • ${next.titulo} (${formato(next.duracion || 1800)})
      </div>
    `;
  }
}

// ===============================
function mostrarProgramacion() {

  if (canalActual === null) return;

  actualizarUI(0, 1, { titulo: "Cargando...", descripcion: "" });
}

// ===============================
function formato(seg) {
  let m = Math.floor(seg / 60);
  let s = seg % 60;
  return `${m}:${s.toString().padStart(2,"0")}`;
}

// ===============================
// FULLSCREEN + HORIZONTAL
// ===============================
document.getElementById("player").onclick = () => {

  let elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }

  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("landscape").catch(()=>{});
  }
};