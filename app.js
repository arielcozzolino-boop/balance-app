/* ══════════════════════════════════════
   BALANCE — app.js v4.1
   URL Unificada: Centralizada en un solo Script
══════════════════════════════════════ */

const SHEET_URL     = 'https://script.google.com/macros/s/AKfycbwKVnOElPBwzRbmoaMmSBfdoRE2XrcTYqlJR1DoSpM5rqDAkpo1Z5K0NF9FyOeoLFUZkQ/exec'
const AH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKVnOElPBwzRbmoaMmSBfdoRE2XrcTYqlJR1DoSpM5rqDAkpo1Z5K0NF9FyOeoLFUZkQ/exec'

const hoy  = new Date().toISOString().split('T')[0]
const DIAS = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']

const TURNOS      = ['Desayuno','Almuerzo','Merienda','Cena','Extra']
const TURNO_EMOJI = { Desayuno:'🌅', Almuerzo:'☀️', Merienda:'🍎', Cena:'🌙', Extra:'⭐' }

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ── estado ── */
let consumidas   = parseInt(localStorage.getItem('consumidas') || '0')
let ejercicio    = parseInt(localStorage.getItem('ejercicio')  || '0')
let historial    = JSON.parse(localStorage.getItem('historial')           || '{}')
let registro     = JSON.parse(localStorage.getItem('registroComidas')     || '{}')
let regEjercicio = JSON.parse(localStorage.getItem('registroEjercicio')   || '{}')

/* reset diario */
if (localStorage.getItem('fecha') !== hoy) {
  localStorage.setItem('fecha', hoy)
  localStorage.setItem('consumidas', '0')
  localStorage.setItem('ejercicio',  '0')
  consumidas = 0
  ejercicio  = 0
}

/* base 2200 + ejercicio manual del día (Apple Health lo sobreescribirá si está disponible) */
let gastadas = 2200 + ejercicio

let actividadAH  = 0
let ultimaSyncAH = null
let estadoAH     = 'cargando'

/* fecha legible */
document.getElementById('fecha-hoy').textContent =
  new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

/* ══════════════════════════════════════
   SYNC A GOOGLE SHEETS
══════════════════════════════════════ */
async function syncSheet(payload) {
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch(e) {
    console.log('Sync error', e)
  }
}

function horaActual() {
  return new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

function getTurno(hora) {
  const h = parseInt(hora.split(':')[0])
  if (h >= 6  && h < 11) return 'Desayuno'
  if (h >= 11 && h < 15) return 'Almuerzo'
  if (h >= 15 && h < 19) return 'Merienda'
  if (h >= 19)           return 'Cena'
  return 'Extra'
}

/* ══════════════════════════════════════
   NAVEGACION
══════════════════════════════════════ */
function go(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('s-' + id).classList.add('active')
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  if (id === 'progreso')  dibujarGrafico()
  if (id === 'historial') renderHistorial()
}

/* ══════════════════════════════════════
   CALCULAR + UI
══════════════════════════════════════ */
function calcular() {
  const bal = consumidas - gastadas

  const arc    = document.getElementById('ring-arc')
  const valEl  = document.getElementById('ring-val')
  const statEl = document.getElementById('ring-status')
  const circ   = 2 * Math.PI * 95

  const pct = Math.min(Math.abs(bal) / 2200, 1)
  arc.style.strokeDashoffset = circ - pct * circ

  let color, statusTxt
  if (bal < 0)        { color = '#4ade80'; statusTxt = 'deficit'   }
  else if (bal < 300) { color = '#facc15'; statusTxt = 'limite'    }
  else                { color = '#f87171'; statusTxt = 'superavit' }

  arc.style.stroke   = color
  valEl.style.color  = color
  statEl.style.color = color
  valEl.textContent  = (bal > 0 ? '+' : '') + bal
  statEl.textContent = statusTxt

  arc.closest('svg').style.filter =
    `drop-shadow(0 0 18px ${color === '#4ade80'
      ? 'rgba(74,222,128,0.2)'
      : color === '#facc15'
        ? 'rgba(250,204,21,0.2)'
        : 'rgba(248,113,113,0.2)'})`

  document.getElementById('stat-con').innerHTML =
    consumidas + '<span class="s-unit">kcal</span>'
  document.getElementById('stat-gas').innerHTML =
    gastadas + '<span class="s-unit">kcal</span>'

  const ejercEl = document.getElementById('stat-ejercicio')
  if (ejercEl) {
    ejercEl.innerHTML = ejercicio + '<span class="s-unit">kcal</span>'
  }

  localStorage.setItem('consumidas', consumidas)
  historial[hoy] = { consumidas, gastadas, balance: bal }
  localStorage.setItem('historial', JSON.stringify(historial))

  renderRegistro()
}

/* ══════════════════════════════════════
   REGISTRO DEL DIA
══════════════════════════════════════ */
function renderRegistro() {
  const list  = document.getElementById('registro-list')
  const items = registro[hoy] || []

  if (!items.length) {
    list.innerHTML = '<div class="empty-state">Nada registrado aún</div>'
    return
  }

  const grupos = {}
  TURNOS.forEach(t => { grupos[t] = [] })
  items.forEach(item => {
    const t = item.turno || getTurno(item.hora || '12:00')
    if (!grupos[t]) grupos[t] = []
    grupos[t].push(item)
  })

  let html = ''
  TURNOS.forEach(turno => {
    if (!grupos[turno].length) return
    html += `<div class="turno-label">${TURNO_EMOJI[turno]} ${turno}</div>`
    grupos[turno].forEach((item, i) => {
      html += `
        <div class="registro-item" style="animation-delay:${i * 0.05}s">
          <span class="r-name">${esc(item.comida)}</span>
          <span class="r-cal">${esc(item.calorias)} kcal</span>
        </div>`
    })
  })

  list.innerHTML = html
}

/* ══════════════════════════════════════
   AGREGAR COMIDA MANUAL
══════════════════════════════════════ */
function toggleFilled(wrapId, input) {
  document.getElementById(wrapId).classList.toggle('filled', input.value.trim() !== '')
}

async function agregarManual() {
  const n = document.getElementById('inp-comida').value.trim()
  const c = parseInt(document.getElementById('inp-cal').value)
  if (!n || isNaN(c) || c <= 0) { toast('Completa los campos'); return }

  const hora  = horaActual()
  const turno = getTurno(hora)

  consumidas += c
  if (!registro[hoy]) registro[hoy] = []
  registro[hoy].push({ comida: n, calorias: c, hora, turno })
  localStorage.setItem('registroComidas', JSON.stringify(registro))

  document.getElementById('inp-comida').value = ''
  document.getElementById('inp-cal').value    = ''
  document.getElementById('wrap-comida').classList.remove('filled')
  document.getElementById('wrap-cal').classList.remove('filled')

  calcular()

  syncSheet({
    type: 'comida',
    fecha: hoy,
    comida: n,
    calorias: c,
    hora,
    turno,
    consumidasTotal: consumidas,
    gastadasTotal:   gastadas,
    balance:         consumidas - gastadas
  })

  toast(`${turno} · ${n} — ${c} kcal`)
  go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   AGREGAR EJERCICIO
══════════════════════════════════════ */
async function agregarEjercicio() {
  const act  = document.getElementById('inp-actividad').value.trim()
  const kcal = parseInt(document.getElementById('inp-kcal-ejercicio').value)
  if (!act || isNaN(kcal) || kcal <= 0) { toast('Completa los campos'); return }

  const hora = horaActual()

  ejercicio += kcal
  gastadas  += kcal
  localStorage.setItem('ejercicio', ejercicio)

  if (!regEjercicio[hoy]) regEjercicio[hoy] = []
  regEjercicio[hoy].push({ actividad: act, calorias: kcal, hora })
  localStorage.setItem('registroEjercicio', JSON.stringify(regEjercicio))

  document.getElementById('inp-actividad').value       = ''
  document.getElementById('inp-kcal-ejercicio').value  = ''
  document.getElementById('wrap-actividad').classList.remove('filled')
  document.getElementById('wrap-kcal-ej').classList.remove('filled')

  calcular()

  syncSheet({
    type: 'ejercicio',
    fecha: hoy,
    actividad: act,
    hora,
    calorias: kcal,
    notas: 'Ingreso manual desde app'
  })

  toast(`${act} — ${kcal} kcal quemadas`)
  go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   APPLE HEALTH
══════════════════════════════════════ */
function tiempoDesdeSync() {
  if (!ultimaSyncAH) return '—'
  const diff = Math.floor((Date.now() - ultimaSyncAH) / 60000)
  const hora = ultimaSyncAH.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (diff < 1)  return `Sincronizado ahora · ${hora}`
  if (diff < 60) return `Sincronizado hace ${diff} min · ${hora}`
  return `Última sync: ${hora}`
}

function actualizarCardAH() {
  const dotEl    = document.getElementById('ah-dot')
  const txtEl    = document.getElementById('ah-status-txt')
  const valEl    = document.getElementById('ah-val')
  const syncEl   = document.getElementById('ah-sync')
  if (!dotEl) return

  valEl.textContent  = actividadAH > 0 ? actividadAH : '—'
  syncEl.textContent = tiempoDesdeSync()

  dotEl.className = 'ah-dot'
  if (estadoAH === 'cargando') {
    dotEl.classList.add('loading')
    txtEl.textContent = 'Sincronizando...'
  } else if (estadoAH === 'ok') {
    dotEl.classList.add('ok')
    txtEl.textContent = 'Sincronizado'
  } else if (estadoAH === 'sin-datos') {
    txtEl.textContent = 'Sin datos hoy'
  } else {
    dotEl.classList.add('error')
    txtEl.textContent = 'Sin conexión'
  }
}

async function cargarAppleHealth() {
  estadoAH = 'cargando'
  document.getElementById('ah-refresh')?.classList.add('spinning')
  actualizarCardAH()
  
  try {
    const res = await fetch(`${AH_SCRIPT_URL}?fecha=${hoy}`, {
      method: 'GET',
      redirect: 'follow'
    })
    
    if (!res.ok) throw new Error("Status " + res.status)
    
    const data = await res.json()
    const actividad = Math.round(data.calorias || 0)

    actividadAH  = actividad
    ultimaSyncAH = new Date()
    estadoAH     = actividad > 0 ? 'ok' : 'sin-datos'

    if (actividad > 0) gastadas = 1800 + actividad + ejercicio
    calcular()
  } catch (e) {
    estadoAH = 'error'
    console.log('Error Apple Health', e)
  } finally {
    document.getElementById('ah-refresh')?.classList.remove('spinning')
    actualizarCardAH()
  }
}

/* ══════════════════════════════════════
   GRAFICO, HISTORIAL Y TOAST (Omitidos por brevedad, mantené los tuyos)
══════════════════════════════════════ */
// ... (mantené tus funciones dibujarGrafico, renderHistorial y toast tal cual las tenías)

/* ══════════════════════════════════════
   INICIO
══════════════════════════════════════ */
cargarAppleHealth()
calcular()
setInterval(cargarAppleHealth, 300000)
