document.body.style.background = "black";

// ===============================
const cont = document.getElementById("canales");

if (!cont) {
  document.body.innerHTML = "<h1 style='color:red'>NO EXISTE DIV #canales</h1>";
} else {
  cont.innerHTML = "<h2 style='color:lime'>JS FUNCIONANDO</h2>";
}

// ===============================
fetch("canales.json")
  .then(res => res.json())
  .then(data => {
    cont.innerHTML += "<p style='color:white'>JSON cargado OK</p>";

    data.forEach((c, i) => {
      let div = document.createElement("div");
      div.style.color = "yellow";
      div.style.padding = "10px";
      div.innerText = (i+1) + ". " + c.nombre;
      cont.appendChild(div);
    });

    iniciarYouTube(data);
  })
  .catch(err => {
    cont.innerHTML += "<p style='color:red'>ERROR JSON</p>";
    console.error(err);
  });

// ===============================
function iniciarYouTube(canales) {

  const playerDiv = document.getElementById("player");

  if (!playerDiv) {
    document.body.innerHTML += "<h1 style='color:red'>NO EXISTE #player</h1>";
    return;
  }

  playerDiv.innerHTML = "<p style='color:white'>Cargando YouTube...</p>";

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);

  window.onYouTubeIframeAPIReady = function () {

    playerDiv.innerHTML = "";

    const player = new YT.Player("player", {
      width: "100%",
      height: "300",
      videoId: canales[0].programas[0].id,
      playerVars: {
        autoplay: 1,
        mute: 1
      }
    });
  };
}