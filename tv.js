let canalActual = 0;
let canales = [];

// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;
    crearCanales();
    reproducir();
    mostrarProgramacion();
  });

// ===============================
function reproducir() {
  const canal = canales[canalActual];
  const video = canal.programas[0].id;

  document.getElementById("player").innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/${video}?autoplay=1&mute=0"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen>
    </iframe>
  `;
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
      reproducir();
      mostrarProgramacion();
    };

    cont.appendChild(div);
  });
}

// ===============================
function mostrarProgramacion() {
  const canal = canales[canalActual];
  const cont = document.getElementById("programacion");

  cont.innerHTML = "";

  canal.programas.slice(0, 5).forEach((p, i) => {
    const div = document.createElement("div");
    div.innerText = "• " + (p.titulo || "Programa") ;
    cont.appendChild(div);
  });
}

// ===============================
//  FULLSCREEN REAL
// ===============================
document.getElementById("fullscreenBtn").onclick = () => {
  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
};