let canalActual = 0;
let canales = [];

// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    canales = data;
    crearCanales();
    reproducir();
  });

// ===============================
function reproducir() {
  const canal = canales[canalActual];

  if (!canal || !canal.programas.length) return;

  const video = canal.programas[0].id;

  const player = document.getElementById("player");

  player.innerHTML = `
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

    div.innerText = (i + 1) + ". " + c.nombre;
    div.style.padding = "12px";
    div.style.cursor = "pointer";
    div.style.color = "yellow";

    div.onclick = () => {
      canalActual = i;
      reproducir();
    };

    cont.appendChild(div);
  });
}