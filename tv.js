// ===============================
let canales = [];
let canalActual = null;
let estadoCanales = {};
let intervalo = null;

// ===============================
fetch("canales.json")
  .then(r => r.json())
  .then(data => {
    canales = data;

    const guardado = localStorage.getItem("estadoTV");
    if (guardado) estadoCanales = JSON.parse(guardado);

    crearCanales();
  });

// ===============================
function guardarTodo() {
  localStorage.setItem("estadoTV", JSON.stringify(estadoCanales));
}

// ===============================
function crearCanales() {

  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {

    const div = document.createElement("div");
    div.className = "canal";
    div.innerText = (i + 1) + ". " + c.nombre;

    div.onclick = () => cambiarCanal(i);

    cont.appendChild(div);
  });
}

// ===============================
function cambiarCanal(i) {

  if (canalActual !== null) guardarEstado();

  canalActual = i;

  if (!estadoCanales[i]) {
    estadoCanales[i] = {
      indice: 0,
      tiempo: 0
    };
  }

  //  destruir video actual (simula pausa real)
  document.getElementById("player").innerHTML = "";

  //  delay limpio
  setTimeout(() => {
    reproducir();
  }, 2000);

  mostrarProgramacion();
}

// ===============================
function reproducir() {

  const estado = estadoCanales[canalActual];
  const canal = canales[canalActual];
  const prog = canal.programas[estado.indice];

  const start = Math.floor(estado.tiempo);

  document.getElementById("player").innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/${prog.id}?autoplay=1&start=${start}&mute=0&controls=0&modestbranding=1&rel=0"
      frameborder="0"
      allow="autoplay"
      allowfullscreen>
    </iframe>
  `;

  estado.inicio = Date.now();

  iniciarProgreso();
}

// ===============================
function iniciarProgreso() {

  clearInterval(intervalo);

  intervalo = setInterval(() => {

    const estado = estadoCanales[canalActual];
    const canal = canales[canalActual];
    const prog = canal.programas[estado.indice];

    const actual = estado.tiempo + Math.floor((Date.now() - estado.inicio) / 1000);
    const total = prog.duracion;

    if (actual >= total) {
      siguiente();
      return;
    }

    actualizarUI(actual, total, prog);

  }, 1000);
}

// ===============================
function siguiente() {

  const estado = estadoCanales[canalActual];
  const canal = canales[canalActual];

  estado.indice++;
  estado.tiempo = 0;

  if (estado.indice >= canal.programas.length) {
    estado.indice = 0;
  }

  guardarTodo();

  reproducir();
}

// ===============================
function guardarEstado() {

  const estado = estadoCanales[canalActual];

  if (!estado.inicio) return;

  estado.tiempo += Math.floor((Date.now() - estado.inicio) / 1000);

  guardarTodo();
}

// ===============================
function actualizarUI(actual, total, prog) {

  const cont = document.getElementById("programacion");

  const porcentaje = (actual / total) * 100;

  cont.innerHTML = `
    <div style="font-size:22px; color:#00ffcc;">
      ${prog.titulo}
    </div>

    <div style="color:#aaa;">
      ${prog.descripcion || ""}
    </div>

    <div style="margin-top:10px;">
      ${fmt(actual)} / ${fmt(total)}
    </div>

    <div style="width:100%; height:6px; background:#333;">
      <div style="width:${porcentaje}%; height:100%; background:#00ffcc;"></div>
    </div>

    <hr>

    <div>Siguiente:</div>
  `;

  const canal = canales[canalActual];
  const estado = estadoCanales[canalActual];

  for (let i = 1; i <= 5; i++) {

    const next = canal.programas[(estado.indice + i) % canal.programas.length];

    cont.innerHTML += `<div>${next.titulo}</div>`;
  }
}

// ===============================
function mostrarProgramacion(){}

// ===============================
function fmt(s){
  let m = Math.floor(s/60);
  let sec = s%60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

// ===============================
// FULLSCREEN REAL
// ===============================
let fs = false;

document.getElementById("player").onclick = () => {

  if (!fs) {

    document.documentElement.requestFullscreen();

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(()=>{});
    }

    fs = true;

  } else {

    document.exitFullscreen();

    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }

    fs = false;
  }
};