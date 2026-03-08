function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

const hoy = new Date().toISOString().split('T')[0];
const ultimoDia = localStorage.getItem('fecha');

if (ultimoDia !== hoy) {
  localStorage.setItem('fecha', hoy);
  localStorage.setItem('consumidas', 0);
}

let consumidas = localStorage.getItem('consumidas')
  ? parseInt(localStorage.getItem('consumidas'))
  : 0;

let gastadas = localStorage.getItem('gastadas')
  ? parseInt(localStorage.getItem('gastadas'))
  : 2200;

function calcularBalance() {

  const balance = consumidas - gastadas;

  document.querySelector('#hoy p:nth-child(2)').innerText =
    `🔥 Consumidas: ${consumidas} kcal`;

  document.querySelector('#hoy p:nth-child(3)').innerText =
    `🏃 Gastadas: ${gastadas} kcal`;

  document.querySelector('#hoy p:nth-child(4)').innerText =
    `⚖️ Balance: ${balance} kcal`;

  localStorage.setItem('consumidas', consumidas);
}

function abrirCamara() {
  document.getElementById('cameraInput').click();
}

document.addEventListener('DOMContentLoaded', () => {

  const input = document.getElementById('cameraInput');

  input.addEventListener('change', async function (event) {

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
        const comida = data.comida || "Comida detectada";

        const confirmar = confirm(
          `📸 ${comida}\n\n🔥 ${calorias} kcal\n\n¿Agregar al día de hoy?`
        );

        if (confirmar) {

          consumidas += calorias;

          calcularBalance();

        }

      } catch {

        alert("Error analizando la imagen");

      }

    };

    reader.readAsDataURL(archivo);

    event.target.value = '';

  });

});

calcularBalance();
