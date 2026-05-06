/* ══════════════════════════════════════
   BALANCE — app.js v5.0
   URL Unificada: https://script.google.com/macros/s/AKfycbx5IrRVKJasqrdXIErIRYFiSR_7m9s5VS3Ahplwx0xb2GcCxizCMhxBGzJksBhGfh2rOw/exec
══════════════════════════════════════ */

const SHEET_URL     = 'https://script.google.com/macros/s/AKfycbx5IrRVKJasqrdXIErIRYFiSR_7m9s5VS3Ahplwx0xb2GcCxizCMhxBGzJksBhGfh2rOw/exec'
const AH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5IrRVKJasqrdXIErIRYFiSR_7m9s5VS3Ahplwx0xb2GcCxizCMhxBGzJksBhGfh2rOw/exec'

const hoy  = new Date().toISOString().split('T')[0]
const DIAS = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']

const TURNOS      = ['Desayuno','Almuerzo','Merienda','Cena','Extra']
const TURNO_EMOJI = { Desayuno:'🌅', Almuerzo:'☀️', Merienda:'🍎', Cena:'🌙', Extra:'⭐' }

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/* ── estado inicial ── */
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
  consumidas = 0; ejercicio = 0;
}

/* base 2200 + ejercicio manual */
let gastadas = 2200 + ejercicio
let actividadAH  = 0
let ultimaSyncAH = null
let estadoAH     = 'cargando'

/* UI: Fecha en cabecera */
document.getElementById('fecha-hoy').textContent =
  new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

/* ══════════════════════════════════════
   FUNCIONES DE SYNC Y DATOS
══════════════════════════════════════ */
async function syncSheet(payload) {
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch(e) { console.log('Sync error', e) }
}

function horaActual() { return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) }

function getTurno(hora) {
  const h = parseInt(hora.split(':')[0])
  if (h >= 6  && h < 11) return 'Desayuno'
  if (h >= 11 && h < 15) return 'Almuerzo'
  if (h >= 15 && h < 19) return 'Merienda'
  if (h >= 19)           return 'Cena'
  return 'Extra'
}

function go(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('s-' + id).classList.add('active')
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  if (id === 'progreso')  dibujarGrafico()
  if (id === 'historial') renderHistorial()
}

/* ══════════════════════════════════════
   CÁLCULOS Y RENDER
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

  arc.closest('svg').style.filter = `drop-shadow(0 0 18px ${color}33)`

  document.getElementById('stat-con').innerHTML = consumidas + '<span class="s-unit">kcal</span>'
  document.getElementById('stat-gas').innerHTML = gastadas + '<span class="s-unit">kcal</span>'

  const ejercEl = document.getElementById('stat-ejercicio')
  if (ejercEl) { ejercEl.innerHTML = ejercicio + '<span class="s-unit">kcal</span>' }

  localStorage.setItem('consumidas', consumidas)
  historial[hoy] = { consumidas, gastadas, balance: bal }
  localStorage.setItem('historial', JSON.stringify(historial))
  renderRegistro()
}

function renderRegistro() {
  const list  = document.getElementById('registro-list')
  const items = registro[hoy] || []
  if (!items.length) { list.innerHTML = '<div class="empty-state">Nada registrado aún</div>'; return }
  const grupos = {}; TURNOS.forEach(t => { grupos[t] = [] })
  items.forEach(item => {
    const t = item.turno || getTurno(item.hora || '12:00')
    if (grupos[t]) grupos[t].push(item)
  })
  let html = ''
  TURNOS.forEach(turno => {
    if (!grupos[turno].length) return
    html += `<div class="turno-label">${TURNO_EMOJI[turno]} ${turno}</div>`
    grupos[turno].forEach((item) => {
      html += `<div class="registro-item"><span class="r-name">${esc(item.comida)}</span><span class="r-cal">${esc(item.calorias)} kcal</span></div>`
    })
  })
  list.innerHTML = html
}

/* ══════════════════════════════════════
   APPLE HEALTH (CORREGIDO)
══════════════════════════════════════ */
function tiempoDesdeSync() {
  if (!ultimaSyncAH) return '—'
  const diff = Math.floor((Date.now() - ultimaSyncAH) / 60000)
  const hora = ultimaSyncAH.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  return diff < 1 ? `Sincronizado ahora · ${hora}` : `Hace ${diff} min · ${hora}`
}

function actualizarCardAH() {
  const dotEl = document.getElementById('ah-dot'), txtEl = document.getElementById('ah-status-txt'), valEl = document.getElementById('ah-val'), syncEl = document.getElementById('ah-sync')
  if (!dotEl) return
  valEl.textContent = actividadAH > 0 ? actividadAH : '—'
  syncEl.textContent = tiempoDesdeSync()
  dotEl.className = 'ah-dot ' + (estadoAH === 'cargando' ? 'loading' : estadoAH === 'ok' ? 'ok' : estadoAH === 'error' ? 'error' : '')
  txtEl.textContent = estadoAH === 'cargando' ? 'Sincronizando...' : estadoAH === 'ok' ? 'Sincronizado' : estadoAH === 'sin-datos' ? 'Sin datos hoy' : 'Sin conexión'
}

async function cargarAppleHealth() {
  estadoAH = 'cargando'; actualizarCardAH()
  document.getElementById('ah-refresh')?.classList.add('spinning')
  try {
    // Agregamos t= para evitar caché y redirect follow para Apps Script
    const res = await fetch(`${AH_SCRIPT_URL}?fecha=${hoy}&t=${Date.now()}`, {
      method: 'GET',
      redirect: 'follow'
    })
    if (!res.ok) throw new Error("Error HTTP " + res.status)
    const data = await res.json()
    actividadAH = Math.round(data.calorias || 0)
    ultimaSyncAH = new Date()
    estadoAH = actividadAH > 0 ? 'ok' : 'sin-datos'
    if (actividadAH > 0) gastadas = 1800 + actividadAH + ejercicio
    calcular()
  } catch (e) {
    estadoAH = 'error'; console.log('Error Apple Health', e)
  } finally {
    document.getElementById('ah-refresh')?.classList.remove('spinning'); actualizarCardAH()
  }
}

/* ══════════════════════════════════════
   ACCIONES MANUALES
══════════════════════════════════════ */
async function agregarManual() {
  const n = document.getElementById('inp-comida').value.trim()
  const c = parseInt(document.getElementById('inp-cal').value)
  if (!n || isNaN(c)) { toast('Completa los campos'); return }
  const hora = horaActual(); const turno = getTurno(hora);
  consumidas += c;
  if (!registro[hoy]) registro[hoy] = []
  registro[hoy].push({ comida: n, calorias: c, hora, turno })
  localStorage.setItem('registroComidas', JSON.stringify(registro))
  document.getElementById('inp-comida').value = ''; document.getElementById('inp-cal').value = '';
  calcular();
  syncSheet({ type: 'comida', fecha: hoy, comida: n, calorias: c, hora, turno, consumidasTotal: consumidas, gastadasTotal: gastadas, balance: consumidas - gastadas })
  toast(`${turno} · ${n} — ${c} kcal`); go('hoy', document.querySelectorAll('.nav-btn')[0])
}

async function agregarEjercicio() {
  const act = document.getElementById('inp-actividad').value.trim()
  const kcal = parseInt(document.getElementById('inp-kcal-ejercicio').value)
  if (!act || isNaN(kcal)) { toast('Completa los campos'); return }
  ejercicio += kcal; gastadas += kcal;
  localStorage.setItem('ejercicio', ejercicio)
  if (!regEjercicio[hoy]) regEjercicio[hoy] = []
  regEjercicio[hoy].push({ actividad: act, calorias: kcal, hora: horaActual() })
  localStorage.setItem('registroEjercicio', JSON.stringify(regEjercicio))
  document.getElementById('inp-actividad').value = ''; document.getElementById('inp-kcal-ejercicio').value = '';
  calcular();
  syncSheet({ type: 'ejercicio', fecha: hoy, actividad: act, hora: horaActual(), calorias: kcal, notas: 'Ingreso manual' })
  toast(`${act} — ${kcal} kcal`); go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   HISTORIAL Y GRÁFICOS
══════════════════════════════════════ */
function dibujarGrafico() {
  const bars  = document.getElementById('chart-bars'); const stats = document.getElementById('prog-stats');
  const keys  = Object.keys(historial).slice(-7)
  if (!keys.length) { bars.innerHTML = '<div class="empty-state">Sin datos</div>'; return }
  const valores = keys.map(k => historial[k]?.balance || 0)
  const maxVal  = Math.max(...valores.map(Math.abs), 1)
  bars.innerHTML = keys.map((k, i) => {
    const b = historial[k]?.balance || 0; const h = Math.max((Math.abs(b) / maxVal) * 110, 3)
    const col = b < 0 ? '#4ade80' : b < 300 ? '#facc15' : '#f87171'
    return `<div class="bar-col"><div class="b-val">${b}</div><div class="b" style="height:${h}px;background:${col}"></div><div class="b-day">${DIAS[new Date(k+'T12:00:00').getDay()]}</div></div>`
  }).join('')
}

function renderHistorial() {
  const list = document.getElementById('hist-list'); const keys = Object.keys(historial).reverse()
  if (!keys.length) { list.innerHTML = '<div class="empty-state">Sin historial</div>'; return }
  list.innerHTML = keys.map(k => {
    const d = historial[k]; const col = d.balance < 0 ? '#4ade80' : '#f87171'
    return `<div class="hist-item"><div class="hist-date">${k}</div><div class="hist-row"><span>Balance</span><span style="color:${col}">${d.balance} kcal</span></div></div>`
  }).join('')
}

function toast(msg) {
  const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2800)
}

/* ══════════════════════════════════════
   INICIO
══════════════════════════════════════ */
document.getElementById('inp-cal')?.addEventListener('keydown', e => { if (e.key === 'Enter') agregarManual() })
document.getElementById('inp-kcal-ejercicio')?.addEventListener('keydown', e => { if (e.key === 'Enter') agregarEjercicio() })

cargarAppleHealth()
calcular()
setInterval(cargarAppleHealth, 300000)
