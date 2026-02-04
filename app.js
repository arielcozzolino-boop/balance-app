/* ---- NAVEGACION ENTRE PANTALLAS ---- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  document.getElementById(id).classList.add('active');
}

/* ---- FECHA DE HOY ---- */
const hoy = new Date().toISOString().split('T')[0];
const ultimoDia = localStorage.getItem('fecha');

/* ---- SI ES UN DIA NUEVO, RESETEAMOS ---- */
if (ultimoDia !== hoy) {
  localStorage.setItem('fecha', hoy);
  localStorage.setItem('consumidas', 0);
}

/* ---- DATOS ---- */
let consumidas = localStorage.getItem('consumidas')
  ? parseInt(localStorage.getItem('consumidas'))
  : 0;

let gastadas = localStorage.getItem('gastadas')
  ? parseInt(localStorage.getItem('gastadas'))
  : 2200; // base diaria simulada

/* ---- FUNCION PRINCIPAL ---- */
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

  localStorage.setItem('consumidas', consumidas);
  localStorage.setItem('gastadas', gastadas);
}

/* ---- SACAR FOTO (SIMULADO IA) ---- */
function sacarFoto() {
  const estimacion = 650;

  const confirmar = confirm(
    `📸 Análisis de la comida\n\n` +
    `Estimación: ${estimacion} kcal\n\n` +
    `¿Agregar al día de hoy?`
  );

  if (confirmar) {
    consumidas += estimacion;
    calcularBalance();
  }
}

/* ---- AGREGAR COMIDA MANUAL ---- */
function agregarComida() {
  consumidas += 300;
  calcularBalance();
}

/* ---- INICIO ---- */
calcularBalance();



