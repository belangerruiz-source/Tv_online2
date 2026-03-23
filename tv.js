// ===============================
let canales = [];
let canalActual = 0;

//  estado por canal
let estadoCanales = {};

let intervalo = null;

// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;

    crearCanales();
    iniciarCanal(true); // inicia en mute
  });

// ===============================
function iniciarCanal(mute = true) {

  if (!estadoCanales[canalActual]) {
    estadoCanales[canalActual] = {
      indice: 0,
      tiempo: 0,
      inicio: Date.now()
    };
  }

  reproducir(mute);
}

// ===============================
function reproducir(mute = true, delay = 0) {

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

    let transcurrido = Math.floor((Date.now() - estado.inicio) / 1000);
    let actual = estado.tiempo + transcurrido;
    let total = prog.duracion || 1800;

    if (actual >= total) {
      siguienteVideo();
      return;
    }

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

  reproducir(false); // sigue sin mute después del primer click
}

// ===============================
function crearCanales() {

  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {

    let div = document.createElement("div");
    div.className = "canal";
    div.innerText = (i + 1) + ". " + c.nombre;

    div.onclick = () => cambiarCanal(i);

    cont.appendChild(div);
  });
}

// ===============================
function cambiarCanal(nuevo) {

  guardarEstado();

  canalActual = nuevo;

  //  delay natural de 2 segundos + sonido activado
  iniciarCanal(false);
  reproducir(false, 2000);
}

// ===============================
function guardarEstado() {

  const estado = estadoCanales[canalActual];

  if (!estado) return;

  let transcurrido = Math.floor((Date.now() - estado.inicio) / 1000);
  estado.tiempo += transcurrido;
}