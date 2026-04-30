const hoy = new Date().toISOString().split('T')[0]
const dias = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']

let consumidas = parseInt(localStorage.getItem('consumidas') || '0')
let gastadas = 2200
let historial = JSON.parse(localStorage.getItem('historial') || '{}')
let registroComidas = JSON.parse(localStorage.getItem('registroComidas') || '{}')

/* --- RESET DIARIO --- */
if (localStorage.getItem('fecha') !== hoy) {
  localStorage.setItem('fecha', hoy)
  localStorage.setItem('consumidas', '0')
  consumidas = 0
}

/* --- FECHA LEGIBLE --- */
document.getElementById('fecha-hoy').textContent =
  new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

/* ===============================
   NAVEGACION
=============================== */
function go(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('s-' + id).classList.add('active')
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  if (id === 'progreso') dibujarGrafico()
  if (id === 'historial') renderHistorial()
}

/* ===============================
   CALCULAR Y ACTUALIZAR UI
=============================== */
function calcular() {
  const bal = consumidas - gastadas

  /* anillo */
  const ringEl = document.getElementById('ring-arc')
  const pct = Math.min(Math.abs(bal) / 2200, 1)
  const circ = 427
  ringEl.style.strokeDashoffset = circ - pct * circ
  ringEl.style.stroke = bal < 0 ? '#34d399' : bal < 300 ? '#fbbf24' : '#f87171'

  /* numero central */
  document.getElementById('ring-num').textContent = (bal > 0 ? '+' : '') + bal

  /* stat cards */
  document.getElementById('stat-con').innerHTML =
    consumidas + '<span class="s-unit">kcal</span>'
  document.getElementById('stat-gas').innerHTML =
    gastadas + '<span class="s-unit">kcal</span>'

  /* guardar */
  localStorage.setItem('consumidas', consumidas)
  historial[hoy] = { consumidas, gastadas, balance: bal }
  localStorage.setItem('historial', JSON.stringify(historial))

  renderRegistro()
}

/* ===============================
   REGISTRO DEL DIA
=============================== */
function renderRegistro() {
  const list = document.getElementById('registro-list')
  const items = registroComidas[hoy] || []

  if (!items.length) {
    list.innerHTML = '<div class="empty-state">Nada registrado aun</div>'
    return
  }

  list.innerHTML = items.map(i => `
    <div class="registro-item">
      <span class="r-name">${i.comida}</span>
      <span class="r-cal">${i.calorias} kcal</span>
    </div>
  `).join('')
}

/* ===============================
   AGREGAR MANUAL
=============================== */
function agregarManual() {
  const n = document.getElementById('inp-comida').value.trim()
  const c = parseInt(document.getElementById('inp-cal').value)
  if (!n || isNaN(c)) return

  consumidas += c
  if (!registroComidas[hoy]) registroComidas[hoy] = []
  registroComidas[hoy].push({ comida: n, calorias: c })
  localStorage.setItem('registroComidas', JSON.stringify(registroComidas))

  document.getElementById('inp-comida').value = ''
  document.getElementById('inp-cal').value = ''

  calcular()
  go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ===============================
   CAMARA + IA
=============================== */
document.getElementById('camInput').addEventListener('change', async function (e) {
  const archivo = e.target.files[0]
  if (!archivo) return

  const reader = new FileReader()
  reader.onload = async function () {
    try {
      const res = await fetch('https://calorias-foto.ariel-cozzolino.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: reader.result })
      })

      const data = await res.json()
      const calorias = data.calorias || 650
      const comida = data.comida || 'Comida'

      if (confirm(`${comida}\n${calorias} kcal\n¿Agregar?`)) {
        consumidas += calorias
        if (!registroComidas[hoy]) registroComidas[hoy] = []
        registroComidas[hoy].push({ comida, calorias })
        localStorage.setItem('registroComidas', JSON.stringify(registroComidas))
        calcular()
      }
    } catch {
      alert('Error IA')
    }
    e.target.value = ''
  }
  reader.readAsDataURL(archivo)
})

/* ===============================
   APPLE HEALTH
=============================== */
async function cargarCaloriasAppleHealth() {
  try {
    const res = await fetch(
      'https://docs.google.com/spreadsheets/d/1g8SMVE3-wGiHhxG3zsgoaA8HiGup0mrL8jiCybnEx4A/gviz/tq?tqx=out:json'
    )
    const text = await res.text()
    const json = JSON.parse(text.substr(47).slice(0, -2))
    const rows = json.table.rows

    const hoyObj = new Date()
    const diaHoy = hoyObj.getDate()
    const mesHoy = hoyObj.getMonth() + 1
    const anioHoy = hoyObj.getFullYear()

    let actividad = 0
    rows.forEach(r => {
      const fechaRaw = r.c[1]?.v
      const cal = r.c[3]?.v
      if (!fechaRaw || !cal) return
      const partes = fechaRaw.split(' ')[0].split('/')
      if (
        parseInt(partes[0]) === diaHoy &&
        parseInt(partes[1]) === mesHoy &&
        parseInt(partes[2]) === anioHoy
      ) {
        actividad = cal
      }
    })

    gastadas = 1800 + actividad
    calcular()
  } catch (e) {
    console.log('Error leyendo Sheet', e)
  }
}

/* ===============================
   GRAFICO
=============================== */
function dibujarGrafico() {
  const bars = document.getElementById('chart-bars')
  const keys = Object.keys(historial).slice(-7)

  if (!keys.length) {
    bars.innerHTML = '<div class="empty-state" style="width:100%;text-align:center;">Sin datos aun</div>'
    return
  }

  const maxVal = Math.max(...keys.map(k => Math.abs(historial[k]?.balance || 0)), 1)

  bars.innerHTML = keys.map(k => {
    const d = historial[k]
    const b = d?.balance || 0
    const h = Math.max((Math.abs(b) / maxVal) * 100, 4)
    const col = b < 0 ? '#34d399' : b < 300 ? '#fbbf24' : '#f87171'
    const dayName = dias[new Date(k + 'T12:00:00').getDay()]
    return `
      <div class="bar-col">
        <div class="b-label">${b > 0 ? '+' : ''}${b}</div>
        <div class="b" style="height:${h}px;background:${col};"></div>
        <div class="b-day">${dayName}</div>
      </div>
    `
  }).join('')
}

/* ===============================
   HISTORIAL
=============================== */
function renderHistorial() {
  const list = document.getElementById('hist-list')
  const keys = Object.keys(historial).reverse()

  if (!keys.length) {
    list.innerHTML = '<div class="empty-state">Sin historial</div>'
    return
  }

  list.innerHTML = keys.map(k => {
    const d = historial[k]
    const col = d.balance < 0 ? '#34d399' : d.balance < 300 ? '#fbbf24' : '#f87171'
    const fecha = new Date(k + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    return `
      <div class="hist-item">
        <div class="hist-date">${fecha}</div>
        <div class="hist-row">
          <span class="h-k">Consumidas</span>
          <span class="h-v">${d.consumidas} kcal</span>
        </div>
        <div class="hist-row">
          <span class="h-k">Gastadas</span>
          <span class="h-v">${d.gastadas} kcal</span>
        </div>
        <div class="hist-row">
          <span class="h-k">Balance</span>
          <span class="h-v" style="color:${col}">${d.balance > 0 ? '+' : ''}${d.balance} kcal</span>
        </div>
      </div>
    `
  }).join('')
}

/* ===============================
   INICIO
=============================== */
cargarCaloriasAppleHealth()
calcular()
setInterval(cargarCaloriasAppleHealth, 300000)
