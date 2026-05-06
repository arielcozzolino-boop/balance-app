/* ══════════════════════════════════════
   BALANCE — app.js v5.1 (FIX DEFINITIVO)
   Cámara/IA Restaurada + Apple Health Fix
══════════════════════════════════════ */

const SHEET_URL     = 'https://script.google.com/macros/s/AKfycbx5IrRVKJasqrdXIErIRYFiSR_7m9s5VS3Ahplwx0xb2GcCxizCMhxBGzJksBhGfh2rOw/exec'
const AH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5IrRVKJasqrdXIErIRYFiSR_7m9s5VS3Ahplwx0xb2GcCxizCMhxBGzJksBhGfh2rOw/exec'

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

/* base 2200 + ejercicio manual */
let gastadas = 2200 + ejercicio
let actividadAH  = 0
let ultimaSyncAH = null
let estadoAH     = 'cargando'

/* UI: Fecha */
document.getElementById('fecha-hoy').textContent =
  new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

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
  let color = bal < 0 ? '#4ade80' : bal < 300 ? '#facc15' : '#f87171'
  arc.style.stroke = color; valEl.style.color = color; statEl.style.color = color
  valEl.textContent = (bal > 0 ? '+' : '') + bal
  statEl.textContent = bal < 0 ? 'deficit' : bal < 300 ? 'limite' : 'superavit'
  arc.closest('svg').style.filter = `drop-shadow(0 0 18px ${color}33)`
  document.getElementById('stat-con').innerHTML = consumidas + '<span class="s-unit">kcal</span>'
  document.getElementById('stat-gas').innerHTML = gastadas + '<span class="s-unit">kcal</span>'
  const ejercEl = document.getElementById('stat-ejercicio')
  if (ejercEl) ejercEl.innerHTML = ejercicio + '<span class="s-unit">kcal</span>'
  localStorage.setItem('consumidas', consumidas)
  historial[hoy] = { consumidas, gastadas, balance: bal }
  localStorage.setItem('historial', JSON.stringify(historial))
  renderRegistro()
}

function renderRegistro() {
  const list = document.getElementById('registro-list')
  const items = registro[hoy] || []
  if (!items.length) { list.innerHTML = '<div class="empty-state">Nada registrado aún</div>'; return }
  const grupos = {}; TURNOS.forEach(t => { grupos[t] = [] })
  items.forEach(item => { const t = item.turno || getTurno(item.hora || '12:00'); if (grupos[t]) grupos[t].push(item) })
  let html = ''
  TURNOS.forEach(turno => {
    if (!grupos[turno].length) return
    html += `<div class="turno-label">${TURNO_EMOJI[turno]} ${turno}</div>`
    grupos[turno].forEach(item => { html += `<div class="registro-item"><span class="r-name">${esc(item.comida)}</span><span class="r-cal">${esc(item.calorias)} kcal</span></div>` })
  })
  list.innerHTML = html
}

/* ══════════════════════════════════════
   AGREGAR REGISTROS (MANUAL, EJERCICIO)
══════════════════════════════════════ */
async function agregarManual() {
  const n = document.getElementById('inp-comida').value.trim(), c = parseInt(document.getElementById('inp-cal').value)
  if (!n || isNaN(c)) { toast('Completa los campos'); return }
  const h = horaActual(), t = getTurno(h); consumidas += c
  if (!registro[hoy]) registro[hoy] = []
  registro[hoy].push({ comida: n, calorias: c, hora: h, turno: t })
  localStorage.setItem('registroComidas', JSON.stringify(registro))
  document.getElementById('inp-comida').value = ''; document.getElementById('inp-cal').value = ''
  calcular(); syncSheet({ type: 'comida', fecha: hoy, comida: n, calorias: c, hora: h, turno: t, consumidasTotal: consumidas, gastadasTotal: gastadas, balance: consumidas - gastadas })
  toast(`${turno} · ${n} — ${c} kcal`); go('hoy', document.querySelectorAll('.nav-btn')[0])
}

async function agregarEjercicio() {
  const act = document.getElementById('inp-actividad').value.trim(), kcal = parseInt(document.getElementById('inp-kcal-ejercicio').value)
  if (!act || isNaN(kcal)) { toast('Completa los campos'); return }
  ejercicio += kcal; gastadas += kcal; localStorage.setItem('ejercicio', ejercicio)
  if (!regEjercicio[hoy]) regEjercicio[hoy] = []
  regEjercicio[hoy].push({ actividad: act, calorias: kcal, hora: horaActual() })
  localStorage.setItem('registroEjercicio', JSON.stringify(regEjercicio))
  document.getElementById('inp-actividad').value = ''; document.getElementById('inp-kcal-ejercicio').value = ''
  calcular(); syncSheet({ type: 'ejercicio', fecha: hoy, actividad: act, hora: horaActual(), calorias: kcal, notas: 'Manual' })
  toast(`${act} — ${kcal} kcal`); go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   CAMARA + IA (CORREGIDO)
══════════════════════════════════════ */
let fotoItems = []

document.getElementById('camInput').addEventListener('change', async function (e) {
  const archivo = e.target.files[0]
  if (!archivo) return
  toast('Analizando imagen...')
  
  const reader = new FileReader()
  // FIX: Movimos la limpieza de e.target.value a reader.onloadend para que siempre se limpie
  reader.onloadend = () => { e.target.value = '' }
  
  reader.onerror = () => { toast('Error al leer el archivo') }
  reader.onload = async function () {
    try {
      const res = await fetch('https://calorias-foto.ariel-cozzolino.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: reader.result })
      })
      const data = await res.json()
      // FIX: Asegurar que data tenga la estructura correcta antes de abrir el modal
      abrirFotoModal([{ comida: data.comida || 'Comida', calorias: data.calorias || 650 }])
    } catch {
      toast('Error al analizar la imagen')
    }
  }
  reader.readAsDataURL(archivo)
})

function abrirFotoModal(items) { fotoItems = items.map(i => ({...i})); renderFotoItems(); document.getElementById('foto-modal').classList.add('active') }
function cerrarFotoModal() { document.getElementById('foto-modal').classList.remove('active') }

function renderFotoItems() {
  document.getElementById('fm-items').innerHTML = fotoItems.map((item, i) => `
    <div class="fm-item">
      <div class="inp-wrap ${item.comida?'filled':''}" id="fm-wrap-n${i}"><label class="inp-label">Alimento</label><input class="inp" value="${esc(item.comida)}" oninput="fotoItems[${i}].comida=this.value"/></div>
      <div class="inp-wrap fm-cal-wrap ${item.calorias?'filled':''}" id="fm-wrap-c${i}"><label class="inp-label">kcal</label><input class="inp" type="number" inputmode="numeric" value="${item.calorias}" oninput="fotoItems[${i}].calorias=parseInt(this.value)||0"/></div>
    </div>`).join('')
}

function agregarItemFoto() { fotoItems.push({comida:'', calorias:0}); renderFotoItems(); document.querySelector('#fm-items .fm-item:last-child input').focus() }

async function confirmarFotoItems() {
  const validos = fotoItems.filter(i => i.comida.trim() && i.calorias > 0)
  if (!validos.length) { toast('Completá al menos un ítem'); return }
  const h = horaActual(), t = getTurno(h)
  validos.forEach(item => {
    consumidas += item.calorias
    if (!registro[hoy]) registro[hoy] = []
    registro[hoy].push({ comida: item.comida, calorias: item.calorias, hora: h, turno: t })
    syncSheet({ type: 'comida', fecha: hoy, comida: item.comida, calorias: item.calorias, hora: h, turno: t, consumidasTotal: consumidas, gastadasTotal: gastadas, balance: consumidas - gastadas })
  })
  localStorage.setItem('registroComidas', JSON.stringify(registro))
  calcular(); cerrarFotoModal(); toast(`${t} · ${validos.length>1?validos.length+' ítems':validos[0].comida}`); go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   APPLE HEALTH (FUSIONADO)
══════════════════════════════════════ */
async function cargarAppleHealth() {
  estadoAH = 'cargando'; document.getElementById('ah-dot')?.classList.add('loading')
  document.getElementById('ah-refresh')?.classList.add('spinning')
  try {
    const res = await fetch(`${AH_SCRIPT_URL}?fecha=${hoy}&t=${Date.now()}`, { method: 'GET', redirect: 'follow' })
    if (!res.ok) throw new Error()
    const data = await res.json()
    actividadAH = Math.round(data.calorias || 0); ultimaSyncAH = new Date()
    estadoAH = actividadAH > 0 ? 'ok' : 'sin-datos'
    if (actividadAH > 0) gastadas = 1800 + actividadAH + ejercicio
    calcular()
  } catch { estadoAH = 'error' } finally {
    const dot = document.getElementById('ah-dot'), txt = document.getElementById('ah-status-txt'), val = document.getElementById('ah-val'), sync = document.getElementById('ah-sync')
    if (dot) {
      val.textContent = actividadAH > 0 ? actividadAH : '—'
      sync.textContent = ultimaSyncAH ? `Sync ${ultimaSyncAH.toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})}` : '—'
      dot.className = 'ah-dot '+estadoAH
      txt.textContent = estadoAH==='ok'?'Sincronizado':estadoAH==='sin-datos'?'Sin datos hoy':estadoAH==='error'?'Error':'Sincronizando...'
    }
    document.getElementById('ah-refresh')?.classList.remove('spinning')
  }
}

/* ══════════════════════════════════════
   HISTORIAL Y GRÁFICOS (FUSIONADO)
══════════════════════════════════════ */
function dibujarGrafico() {
  const bars = document.getElementById('chart-bars'), keys = Object.keys(historial).slice(-7)
  if (!keys.length) { bars.innerHTML = '<div class="empty-state">Sin datos</div>'; return }
  const valores = keys.map(k => historial[k]?.balance || 0), maxVal = Math.max(...valores.map(Math.abs), 1)
  bars.innerHTML = keys.map(k => {
    const b = historial[k]?.balance || 0, h = Math.max((Math.abs(b)/maxVal)*110, 3)
    const col = b<0?'#4ade80':b<300?'#facc15':'#f87171'
    return `<div class="bar-col"><div class="b" style="height:${h}px;background:${col}"></div><div class="b-day">${DIAS[new Date(k+'T12:00:00').getDay()]}</div></div>`
  }).join('')
}

function renderHistorial() {
  const list = document.getElementById('hist-list'), keys = Object.keys(historial).reverse()
  if (!keys.length) { list.innerHTML = '<div class="empty-state">Sin historial</div>'; return }
  list.innerHTML = keys.map(k => {
    const d = historial[k], col = d.balance<0?'#4ade80':'#f87171'
    return `<div class="hist-item"><div class="hist-date">${k}</div><div class="hist-row"><span>Balance</span><span style="color:${col}">${d.balance} kcal</span></div></div>`
  }).join('')
}

function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 2800) }

/* ══════════════════════════════════════
   INICIO
══════════════════════════════════════ */
cargarAppleHealth()
calcular()
setInterval(cargarAppleHealth, 300000)
