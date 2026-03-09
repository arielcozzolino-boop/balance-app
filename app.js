function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

const hoy = new Date().toISOString().split('T')[0];

const ultimoDia = localStorage.getItem("fecha");

if (ultimoDia !== hoy) {
  localStorage.setItem("fecha", hoy);
  localStorage.setItem("consumidas", 0);
}

let consumidas = localStorage.getItem("consumidas")
  ? parseInt(localStorage.getItem("consumidas"))
  : 0;

let gastadas = 2200;

function calcularBalance() {

  const balance = consumidas - gastadas;

  document.querySelector('#hoy p:nth-child(2)').innerText =
    `🔥 Consumidas: ${consumidas} kcal`;

  document.querySelector('#hoy p:nth-child(3)').innerText =
    `🏃 Gastadas: ${gastadas} kcal`;

  document.querySelector('#hoy p:nth-child(4)').innerText =
    `⚖️ Balance: ${balance} kcal`;

  localStorage.setItem("consumidas", consumidas);

  mostrarRegistro();

}

function abrirCamara() {
  document.getElementById("cameraInput").click();
}

function guardarComida(comida, calorias) {

  const hoy = new Date().toISOString().split("T")[0];

  let registro = localStorage.getItem("registroComidas")
    ? JSON.parse(localStorage.getItem("registroComidas"))
    : {};

  if (!registro[hoy]) {
    registro[hoy] = [];
  }

  registro[hoy].push({
    comida: comida,
    calorias: calorias
  });

  localStorage.setItem("registroComidas", JSON.stringify(registro));

}

function mostrarRegistro() {

  const hoy = new Date().toISOString().split("T")[0];

  const registro = JSON.parse(localStorage.getItem("registroComidas")) || {};

  const comidasHoy = registro[hoy] || [];

  const contenedor = document.getElementById("registro");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  comidasHoy.forEach(item => {

    const div = document.createElement("div");

    div.innerText = `${item.comida} — ${item.calorias} kcal`;

    contenedor.appendChild(div);

  });

}

document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("cameraInput");

  if (!input) return;

  input.addEventListener("change", async function (event) {

    const archivo = event.target.files[0];

    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = async function () {

      const base64 = reader.result;

      try {

        const respuesta = await fetch(
          "https://calorias-foto.ariel-cozzolino.workers.dev/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              image: base64
            })
          }
        );

        const data = await respuesta.json();

        const calorias = data.calorias || 650;

        const comida = data.comida || "Comida";

        const confirmar = confirm(
          `📸 ${comida}\n\n🔥 ${calorias} kcal\n\n¿Agregar al día de hoy?`
        );

        if (confirmar) {

          consumidas += calorias;

          guardarComida(comida, calorias);

          calcularBalance();

        }

      } catch {

        alert("Error analizando la imagen");

      }

    };

    reader.readAsDataURL(archivo);

    event.target.value = "";

  });

});

calcularBalance();
mostrarRegistro();
