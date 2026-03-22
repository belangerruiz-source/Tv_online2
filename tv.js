const EPOCH = 1700000000;

let canalActual = 0;
let player;

// ===============================
//  CANALES (TUS PLAYLISTS)
// ===============================
const canales = [

  {
    nombre: "UNIVERSO",
    programas: [
      { id: "Yw7q6xHneN0", titulo: "El universo profundo", descripcion: "Exploración del cosmos.", duracion: 3000, inicio: 1700000000, diasActivo: 100 },
      { id: "nzICDsGjAEA", titulo: "Galaxias lejanas", descripcion: "Viaje a otras galaxias.", duracion: 2600, inicio: 1700000000, diasActivo: 100 },
      { id: "11hpS7F0YuI", titulo: "Agujeros negros", descripcion: "Los misterios del universo.", duracion: 2500, inicio: 1700000000, diasActivo: 100 }
    ]
  },

  {
    nombre: "PROCESOS",
    programas: [
      { id: "loz_i80X7ug", titulo: "Cómo se fabrica", descripcion: "Procesos industriales.", duracion: 1500, inicio: 1700000000, diasActivo: 100 },
      { id: "hQj_MwShpPA", titulo: "Tecnología en acción", descripcion: "Máquinas avanzadas.", duracion: 3000, inicio: 1700000000, diasActivo: 100 },
      { id: "6fELDNXn3ZY", titulo: "Ingeniería moderna", descripcion: "Sistemas complejos.", duracion: 3100, inicio: 1700000000, diasActivo: 100 }
    ]
  },

  {
    nombre: "DOCUMENTALES",
    programas: [
      { id: "EgaG_aKBSno", titulo: "Documental completo", descripcion: "Historia y sociedad.", duracion: 2600, inicio: 1700000000, diasActivo: 100 },
      { id: "6ZcF7hklYQg", titulo: "Planeta Tierra", descripcion: "Naturaleza extrema.", duracion: 1100, inicio: 1700000000, diasActivo: 100 },
      { id: "aqxpcRod_9k", titulo: "Vida salvaje", descripcion: "Fauna mundial.", duracion: 1000, inicio: 1700000000, diasActivo: 100 }
    ]
  },

  {
    nombre: "HISTORIA",
    programas: [
      { id: "aDcKkboqLKw", titulo: "Imperios antiguos", descripcion: "Civilizaciones antiguas.", duracion: 2400, inicio: 1700000000, diasActivo: 100 },
      { id: "n1JXIUsGZR8", titulo: "Guerras mundiales", descripcion: "Eventos históricos.", duracion: 2400, inicio: 1700000000, diasActivo: 100 },
      { id: "4dKumyZhw24", titulo: "Edad media", descripcion: "Historia europea.", duracion: 2500, inicio: 1700000000, diasActivo: 100 }
    ]
  },

  {
    nombre: "CIUDADES",
    programas: [
      { id: "ui3n5jDnZo8", titulo: "Tokio de noche", descripcion: "Ciudad iluminada.", duracion: 1300, inicio: 1700000000, diasActivo: 100 },
      { id: "1Np-Ea6XCgc", titulo: "Dubái futurista", descripcion: "Arquitectura extrema.", duracion: 900, inicio: 1700000000, diasActivo: 100 },
      { id: "VkIuG4AYTp0", titulo: "Nueva York", descripcion: "La ciudad que nunca duerme.", duracion: 1100, inicio: 1700000000, diasActivo: 100 }
    ]
  }

];

// ===============================
//  YOUTUBE API
// ===============================
function cargarYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("player", {
    width: "100%",
    height: "100%",
    videoId: "",
    playerVars: {
      autoplay: 1,
      controls: 1
    },
    events: {
      onReady: iniciarTV,
      onStateChange: onPlayerStateChange
    }
  });
};

// ===============================
//  SIGUIENTE VIDEO AUTOMÁTICO
// ===============================
function onPlayerStateChange(event) {
  if (event.data === 0) {
    reproducir();
  }
}

// ===============================
//  ACTIVOS
// ===============================
function obtenerActivos(canal) {
  const ahora = Math.floor(Date.now() / 1000);

  return canal.programas.filter(p => {
    const fin = p.inicio + (p.diasActivo * 86400);
    return ahora >= p.inicio && ahora <= fin;
  });
}

// ===============================
//  ROTACIÓN
// ===============================
function rotar(lista) {
  const dia = Math.floor((Date.now()/1000 - EPOCH) / 86400);
  const r = dia % lista.length;
  return lista.slice(r).concat(lista.slice(0, r));
}

// ===============================
//  REPRODUCCIÓN
// ===============================
function reproducir() {
  let canal = canales[canalActual];
  let activos = obtenerActivos(canal);

  if (activos.length === 0) return;

  activos = rotar(activos);

  const total = activos.reduce((a,b)=>a+b.duracion,0);
  const ahora = Math.floor(Date.now()/1000);
  const tiempo = (ahora - EPOCH) % total;

  let acumulado = 0;

  for (let i = 0; i < activos.length; i++) {
    let p = activos[i];

    if (tiempo < acumulado + p.duracion) {
      let offset = tiempo - acumulado;

      player.loadVideoById({
        videoId: p.id,
        startSeconds: Math.floor(offset)
      });

      mostrarProgramacion(activos, i);
      return;
    }

    acumulado += p.duracion;
  }
}

// ===============================
//  CANALES UI
// ===============================
function crearCanales() {
  const cont = document.getElementById("canales");
  cont.innerHTML = "";

  canales.forEach((c, i) => {
    const div = document.createElement("div");

    div.className = "canal" + (i===canalActual?" activo":"");
    div.innerText = (i+1) + ". " + c.nombre;

    div.onclick = () => {
      canalActual = i;
      reproducir();
      crearCanales();
    };

    cont.appendChild(div);
  });
}

// ===============================
//  PROGRAMACIÓN
// ===============================
function mostrarProgramacion(programas, actual) {
  const cont = document.getElementById("programacion");

  let html = `<h3>${canales[canalActual].nombre}</h3>`;

  let inicio = new Date();

  for (let i = 0; i < 10; i++) {
    let index = (actual + i) % programas.length;
    let p = programas[index];

    let fin = new Date(inicio.getTime() + p.duracion*1000);

    html += `
      <div style="margin:10px; color:${i===0?"yellow":"white"};">
        <b>${formatearHora(inicio)} - ${formatearHora(fin)}</b><br>
        ${p.titulo}<br>
        <span style="color:gray; font-size:12px;">${p.descripcion}</span>
      </div>
    `;

    inicio = fin;
  }

  cont.innerHTML = html;
}

// ===============================
function formatearHora(f) {
  return f.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

// ===============================
function iniciarTV() {
  crearCanales();
  reproducir();
}

// ===============================
cargarYouTubeAPI();