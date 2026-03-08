/* =========================================================
   NAVEGACION ENTRE PANTALLAS
========================================================= */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

/* =========================================================
   FECHA Y DIA NUEVO
========================================================= */
const hoy = new Date().toISOString().split('T')[0];
const ultimoDia = localStorage.getItem('fecha');

if (ultimoDia !== hoy) {
  localStorage.setItem('fecha', hoy);
  localStorage.setItem('consumidas', 0);
}

/* =========================================================
   DATOS PRINCIPALES
========================================================= */
let consumidas = localStorage.getItem('consumidas')
  ? parseInt(localStorage.getItem('consumidas'))
  : 0;

let gastadas = localStorage.getItem('gastadas')
  ? parseInt(localStorage.getItem('gastadas'))
  : 2200;

/* =========================================================
   HISTORIAL
========================================================= */
let historial = localStorage.getItem('historial')
  ? JSON.parse(localStorage.getItem('historial'))
  : {};

/* =========================================================
   BALANCE
========================================================= */
function calcularBalance() {

  const balance = consumidas - gastadas;

  document.querySelector('#hoy p:nth-child(2)').innerText =
    `🔥 Consumidas: ${consumidas} kcal`;

  document.querySelector('#hoy p:nth-child(3)').innerText =
    `🏃 Gastadas: ${gastadas} kcal`;

  document.querySelector('#hoy p:nth-child(4)').innerText =
    `⚖️ Balance: ${balance} kcal`;

  const section = document.getElementById('hoy');

  section.style.background =
    balance < 0 ? '#e6f7ec' :
    balance < 200 ? '#fff7e6' :
    '#fdecea';

  historial[hoy] = balance;

  localStorage.setItem('historial', JSON.stringify(historial));
  localStorage.setItem('consumidas', consumidas);
  localStorage.setItem('gastadas', gastadas);

  dibujarGrafico();
}

/* =========================================================
   GRAFICO
========================================================= */
function dibujarGrafico() {

  const grafico = document.getElementById('grafico');
  if (!grafico) return;

  grafico.innerHTML = '';

  let dias = Object.keys(historial).slice(-7);

  if (dias.length === 0) {
    dias = [hoy];
    historial[hoy] = consumidas - gastadas;
  }

  dias.forEach(dia => {

    const valor = historial[dia];

    const barra = document.createElement('div');
    barra.className = 'barra';

    const altura = Math.max(Math.abs(valor) / 5, 40);
    barra.style.height = Math.min(altura, 180) + 'px';

    barra.style.background =
      valor < 0 ? '#2ecc71' :
      valor < 200 ? '#f1c40f' :
      '#e74c3c';

    barra.innerText = valor;

    grafico.appendChild(barra);

  });

}

/* =========================================================
   ABRIR CAMARA
========================================================= */
function abrirCamara() {
  const input = document.getElementById('cameraInput');
  if (input) {
    input.click();
  }
}

/* =========================================================
   FOTO + IA
========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const input = document.getElementById('cameraInput');
  if (!input) return;

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

        const estimacion = data.calorias || 650;

        const confirmar = confirm(
          `📸 Foto analizada\n\n` +
          `Estimación IA: ${estimacion} kcal\n\n` +
          `¿Agregar al día de hoy?`
        );

        if (confirmar) {
          consumidas += estimacion;
          calcularBalance();
        }

      } catch (err) {

        alert("Error analizando la imagen");

      }

    };

    reader.readAsDataURL(archivo);

    event.target.value = '';

  });

});

/* =========================================================
   AGREGAR MANUAL
========================================================= */
function agregarComida() {

  consumidas += 300;

  calcularBalance();

}

/* =========================================================
   INICIO
========================================================= */
calcularBalance();


