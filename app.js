/* ══════════════════════════════════════
   BALANCE — app.js v6
   Base: v4 completa (antes de la compactación) + correcciones:
   - Fecha LOCAL (antes UTC: después de las 21 h guardaba en el día siguiente)
   - Cambio de día detectado aunque la app quede abierta
   - Foto: valida respuesta del Worker, sin valor inventado de 650 kcal, imagen reducida
   - Apple Health: timeout, botón para ejecutar el Atajo desde la app
   - Gasto calculado en un solo lugar (constantes BASAL / FALLBACK)
══════════════════════════════════════ */

const SHEET_URL     = 'https://script.google.com/macros/s/AKfycbx5IrRVKJasqrdXIErIRYFiSR_7m9s5VS3Ahplwx0xb2GcCxizCMhxBGzJksBhGfh2rOw/exec'
const AH_SCRIPT_URL = SHEET_URL
const WORKER_URL    = 'https://calorias-foto.ariel-cozzolino.workers.dev/'

/* Nombre EXACTO del Atajo de iOS que lee Apple Health y lo manda a la planilla */
const ATAJO_NOMBRE  = 'Balance Health'

/* Criterio de gasto (revisar antes de cambiar):
   - con datos de Apple Health: BASAL + activas AH + ejercicio manual
   - sin datos:                 FALLBACK + ejercicio manual             */
const BASAL    = 1800
const FALLBACK = 2200

const DIAS = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']
const TURNOS      = ['Desayuno','Almuerzo','Merienda','Cena','Extra']
const TURNO_EMOJI = { Desayuno:'🌅', Almuerzo:'☀️', Merienda:'🍎', Cena:'🌙', Extra:'⭐' }

/* Fecha local YYYY-MM-DD (toISOString usa UTC → en Argentina cambia de día a las 21 h) */
function fechaLocal(d = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

let hoy = fechaLocal()

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

let actividadAH  = 0
let ultimaSyncAH = null
let estadoAH     = 'cargando'
let gastadas     = FALLBACK

function recalcularGastadas() {
  gastadas = actividadAH > 0 ? BASAL + actividadAH + ejercicio : FALLBACK + ejercicio
}

function mostrarFecha() {
  document.getElementById('fecha-hoy').textContent =
    new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/* reset diario: al abrir y cada vez que la app vuelve a primer plano */
function verificarCambioDeDia() {
  const ahora = fechaLocal()
  if (localStorage.getItem('fecha') === ahora && ahora === hoy) return false
  const esNuevoDia = localStorage.getItem('fecha') !== ahora
  hoy = ahora
  localStorage.setItem('fecha', hoy)
  if (esNuevoDia) {
    consumidas = 0
    ejercicio  = 0
    actividadAH = 0
    ultimaSyncAH = null
    localStorage.setItem('consumidas', '0')
    localStorage.setItem('ejercicio',  '0')
  }
  recalcularGastadas()
  mostrarFecha()
  return true
}

verificarCambioDeDia()
recalcularGastadas()
mostrarFecha()

/* ══════════════════════════════════════
   SYNC A GOOGLE SHEETS
   (no-cors: no se puede leer la respuesta; la confirmación real está en la planilla)
══════════════════════════════════════ */
async function syncSheet(payload) {
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
function colorBalance(bal) {
  if (bal < 0)   return { color: '#4ade80', label: 'deficit',   glow: 'rgba(74,222,128,0.2)' }
  if (bal < 300) return { color: '#facc15', label: 'limite',    glow: 'rgba(250,204,21,0.2)' }
  return               { color: '#f87171', label: 'superavit', glow: 'rgba(248,113,113,0.2)' }
}

function calcular() {
  const bal = consumidas - gastadas

  const arc    = document.getElementById('ring-arc')
  const valEl  = document.getElementById('ring-val')
  const statEl = document.getElementById('ring-status')
  const circ   = 2 * Math.PI * 95

  const pct = Math.min(Math.abs(bal) / Math.max(gastadas, 1), 1)
  arc.style.strokeDasharray  = circ
  arc.style.strokeDashoffset = circ - pct * circ

  const { color, label, glow } = colorBalance(bal)
  arc.style.stroke   = color
  valEl.style.color  = color
  statEl.style.color = color
  valEl.textContent  = (bal > 0 ? '+' : '') + bal
  statEl.textContent = label
  arc.closest('svg').style.filter = `drop-shadow(0 0 18px ${glow})`

  document.getElementById('stat-con').innerHTML = consumidas + '<span class="s-unit">kcal</span>'
  document.getElementById('stat-gas').innerHTML = gastadas   + '<span class="s-unit">kcal</span>'

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
  verificarCambioDeDia()
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
    type: 'comida', fecha: hoy, comida: n, calorias: c, hora, turno,
    consumidasTotal: consumidas, gastadasTotal: gastadas, balance: consumidas - gastadas
  })

  toast(`${turno} · ${n} — ${c} kcal`)
  go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   AGREGAR EJERCICIO
══════════════════════════════════════ */
async function agregarEjercicio() {
  verificarCambioDeDia()
  const act  = document.getElementById('inp-actividad').value.trim()
  const kcal = parseInt(document.getElementById('inp-kcal-ejercicio').value)
  if (!act || isNaN(kcal) || kcal <= 0) { toast('Completa los campos'); return }

  const hora = horaActual()

  ejercicio += kcal
  localStorage.setItem('ejercicio', ejercicio)
  recalcularGastadas()

  if (!regEjercicio[hoy]) regEjercicio[hoy] = []
  regEjercicio[hoy].push({ actividad: act, calorias: kcal, hora })
  localStorage.setItem('registroEjercicio', JSON.stringify(regEjercicio))

  document.getElementById('inp-actividad').value       = ''
  document.getElementById('inp-kcal-ejercicio').value  = ''
  document.getElementById('wrap-actividad').classList.remove('filled')
  document.getElementById('wrap-kcal-ej').classList.remove('filled')

  calcular()

  syncSheet({
    type: 'ejercicio', fecha: hoy, actividad: act, hora,
    calorias: kcal, notas: 'Ingreso manual desde app'
  })

  toast(`${act} — ${kcal} kcal quemadas`)
  go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   CAMARA + IA
══════════════════════════════════════ */
let fotoItems = []

/* Reduce la foto (las del iPhone pesan 3–5 MB): menos espera y menos costo de OpenAI */
function reducirImagen(archivo, maxLado = 1024, calidad = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * escala)
      canvas.height = Math.round(img.height * escala)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', calidad))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}

document.getElementById('camInput').addEventListener('change', async function (e) {
  const archivo = e.target.files[0]
  e.target.value = ''
  if (!archivo) return
  toast('Analizando imagen...')
  try {
    const imagen = await reducirImagen(archivo)
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imagen })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) throw new Error(data.error?.message || data.error || `HTTP ${res.status}`)

    const kcal = Math.round(Number(data.calorias))
    if (!data.comida || !Number.isFinite(kcal) || kcal <= 0) throw new Error('Respuesta incompleta de la IA')

    abrirFotoModal([{ comida: data.comida, calorias: kcal }])
  } catch (err) {
    console.log('Error IA', err)
    toast('No se pudo analizar la foto. Cargala manual.')
  }
})

function abrirFotoModal(items) {
  fotoItems = items.map(i => ({ ...i }))
  renderFotoItems()
  document.getElementById('foto-modal').classList.add('active')
}

function cerrarFotoModal() {
  document.getElementById('foto-modal').classList.remove('active')
}

function renderFotoItems() {
  document.getElementById('fm-items').innerHTML = fotoItems.map((item, i) => `
    <div class="fm-item">
      <div class="inp-wrap ${item.comida ? 'filled' : ''}" id="fm-wrap-n${i}">
        <label class="inp-label">Alimento</label>
        <input class="inp" value="${esc(item.comida)}"
          oninput="fotoItems[${i}].comida=this.value;toggleFilled('fm-wrap-n${i}',this)"/>
      </div>
      <div class="inp-wrap fm-cal-wrap ${item.calorias ? 'filled' : ''}" id="fm-wrap-c${i}">
        <label class="inp-label">kcal</label>
        <input class="inp" type="number" inputmode="numeric" value="${item.calorias || ''}"
          oninput="fotoItems[${i}].calorias=parseInt(this.value)||0;toggleFilled('fm-wrap-c${i}',this)"/>
      </div>
    </div>`).join('')
}

function agregarItemFoto() {
  fotoItems.push({ comida: '', calorias: 0 })
  renderFotoItems()
  document.querySelector('#fm-items .fm-item:last-child input').focus()
}

async function confirmarFotoItems() {
  verificarCambioDeDia()
  const validos = fotoItems.filter(i => i.comida.trim() && i.calorias > 0)
  if (!validos.length) { toast('Completá al menos un ítem'); return }

  const hora  = horaActual()
  const turno = getTurno(hora)

  for (const item of validos) {
    consumidas += item.calorias
    if (!registro[hoy]) registro[hoy] = []
    registro[hoy].push({ comida: item.comida.trim(), calorias: item.calorias, hora, turno })
    syncSheet({
      type: 'comida', fecha: hoy,
      comida: item.comida.trim(), calorias: item.calorias, hora, turno,
      consumidasTotal: consumidas, gastadasTotal: gastadas,
      balance: consumidas - gastadas
    })
  }

  localStorage.setItem('registroComidas', JSON.stringify(registro))
  calcular()
  cerrarFotoModal()
  const total = validos.reduce((s, i) => s + i.calorias, 0)
  const label = validos.length > 1 ? `${validos.length} ítems` : validos[0].comida
  toast(`${turno} · ${label} — ${total} kcal`)
  go('hoy', document.querySelectorAll('.nav-btn')[0])
}

/* ══════════════════════════════════════
   APPLE HEALTH
   Flujo: Atajo iOS lee Salud → escribe en la planilla → la app lee la planilla.
   La app NO puede leer Salud directo; si el Atajo no corre, no hay datos.
══════════════════════════════════════ */
function tiempoDesdeSync() {
  if (!ultimaSyncAH) return '—'
  const diff = Math.floor((Date.now() - ultimaSyncAH) / 60000)
  const hora = ultimaSyncAH.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (diff < 1)  return `Consultado ahora · ${hora}`
  if (diff < 60) return `Consultado hace ${diff} min · ${hora}`
  return `Última consulta: ${hora}`
}

function actualizarCardAH() {
  const dotEl  = document.getElementById('ah-dot')
  const txtEl  = document.getElementById('ah-status-txt')
  const valEl  = document.getElementById('ah-val')
  const syncEl = document.getElementById('ah-sync')
  if (!dotEl) return

  valEl.textContent  = actividadAH > 0 ? actividadAH : '—'
  syncEl.textContent = tiempoDesdeSync()

  dotEl.className = 'ah-dot'
  if (estadoAH === 'cargando') {
    dotEl.classList.add('loading')
    txtEl.textContent = 'Consultando...'
  } else if (estadoAH === 'ok') {
    dotEl.classList.add('ok')
    txtEl.textContent = 'Sincronizado'
  } else if (estadoAH === 'sin-datos') {
    txtEl.textContent = 'Sin datos hoy'
  } else {
    dotEl.classList.add('error')
    txtEl.textContent = 'Sin conexión'
  }

  const atajoBtn = document.getElementById('ah-atajo')
  if (atajoBtn) atajoBtn.style.display = estadoAH === 'ok' ? 'none' : ''
}

let cargandoAH = false
async function cargarAppleHealth() {
  if (cargandoAH) return
  cargandoAH = true
  verificarCambioDeDia()
  estadoAH = 'cargando'
  document.getElementById('ah-refresh')?.classList.add('spinning')
  actualizarCardAH()

  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res  = await fetch(`${AH_SCRIPT_URL}?fecha=${hoy}&t=${Date.now()}`, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const actividad = Math.round(Number(data.calorias) || 0)

    actividadAH  = actividad
    ultimaSyncAH = new Date()
    estadoAH     = actividad > 0 ? 'ok' : 'sin-datos'
  } catch (e) {
    estadoAH = 'error'
    console.log('Error Apple Health', e)
  } finally {
    clearTimeout(timer)
    cargandoAH = false
  }
  recalcularGastadas()
  calcular()
  document.getElementById('ah-refresh')?.classList.remove('spinning')
  actualizarCardAH()
}

/* Ejecuta el Atajo de iOS y vuelve a la app al terminar */
function ejecutarAtajo() {
  const volver = encodeURIComponent(location.href.split('#')[0] + '#ah')
  location.href = `shortcuts://x-callback-url/run-shortcut?name=${encodeURIComponent(ATAJO_NOMBRE)}&x-success=${volver}`
}

/* ══════════════════════════════════════
   GRAFICO
══════════════════════════════════════ */
function ultimas7Claves() {
  return Object.keys(historial).sort().slice(-7)
}

function dibujarGrafico() {
  const bars  = document.getElementById('chart-bars')
  const stats = document.getElementById('prog-stats')
  const keys  = ultimas7Claves()

  if (!keys.length) {
    bars.innerHTML  = '<div class="empty-state" style="width:100%;text-align:center">Sin datos aún</div>'
    stats.innerHTML = ''
    return
  }

  const valores  = keys.map(k => historial[k]?.balance || 0)
  const maxVal   = Math.max(...valores.map(Math.abs), 1)
  const promedio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
  const minVal   = Math.min(...valores)
  const mejorDia = keys[valores.indexOf(minVal)]

  bars.innerHTML = keys.map((k, i) => {
    const b    = historial[k]?.balance || 0
    const h    = Math.max((Math.abs(b) / maxVal) * 110, 3)
    const col  = colorBalance(b).color
    const dayN = DIAS[new Date(k + 'T12:00:00').getDay()]
    return `
      <div class="bar-col">
        <div class="b-val">${b > 0 ? '+' : ''}${b}</div>
        <div class="b" style="height:${h}px;background:${col};animation-delay:${i*0.07}s"></div>
        <div class="b-day">${dayN}</div>
      </div>`
  }).join('')

  const mejorFecha = mejorDia
    ? new Date(mejorDia + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
    : '—'

  stats.innerHTML = `
    <div class="prog-stat">
      <div class="ps-label">Promedio</div>
      <div class="ps-val" style="color:${colorBalance(promedio).color}">${promedio>0?'+':''}${promedio}</div>
    </div>
    <div class="prog-stat">
      <div class="ps-label">Mejor día</div>
      <div class="ps-val" style="color:#4ade80;font-size:11px">${mejorFecha}</div>
    </div>
    <div class="prog-stat">
      <div class="ps-label">Días reg.</div>
      <div class="ps-val">${keys.length}</div>
    </div>`
}

/* ══════════════════════════════════════
   HISTORIAL
══════════════════════════════════════ */
function renderHistorial() {
  const list = document.getElementById('hist-list')
  const keys = Object.keys(historial).sort().reverse()

  if (!keys.length) {
    list.innerHTML = '<div class="empty-state">Sin historial aún</div>'
    return
  }

  list.innerHTML = keys.map((k, i) => {
    const d     = historial[k]
    const bal   = d.balance
    const { color: col, label } = colorBalance(bal)
    const bg    = bal < 0 ? 'rgba(74,222,128,0.12)' : bal < 300 ? 'rgba(250,204,21,0.12)' : 'rgba(248,113,113,0.12)'
    const fecha = new Date(k + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    const comidasDia = registro[k] || []
    let comidasHtml = ''
    TURNOS.forEach(turno => {
      const del = comidasDia.filter(c => (c.turno || getTurno(c.hora || '12:00')) === turno)
      if (!del.length) return
      comidasHtml += `<div class="hist-turno">${TURNO_EMOJI[turno]} ${turno}</div>`
      del.forEach(c => {
        comidasHtml += `
          <div class="hist-comida-row">
            <span>${esc(c.comida)}</span>
            <span class="r-cal">${esc(c.calorias)} kcal</span>
          </div>`
      })
    })

    return `
      <div class="hist-item" style="animation-delay:${i * 0.04}s">
        <div class="hist-date">${fecha}</div>
        <div class="hist-row">
          <span class="h-k">Consumidas</span>
          <span class="h-v">${d.consumidas} kcal</span>
        </div>
        <div class="hist-row">
          <span class="h-k">Gastadas</span>
          <span class="h-v">${d.gastadas} kcal</span>
        </div>
        <div class="hist-row" style="margin-bottom:${comidasHtml ? '12px' : '0'}">
          <span class="h-k">Balance</span>
          <span class="hist-badge" style="color:${col};background:${bg}">
            ${bal > 0 ? '+' : ''}${bal} kcal · ${label}
          </span>
        </div>
        ${comidasHtml ? `<div class="hist-comidas">${comidasHtml}</div>` : ''}
      </div>`
  }).join('')
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let toastTimer
function toast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800)
}

/* ══════════════════════════════════════
   INICIO
══════════════════════════════════════ */
document.getElementById('inp-cal').addEventListener('keydown', e => {
  if (e.key === 'Enter') agregarManual()
})
document.getElementById('inp-kcal-ejercicio').addEventListener('keydown', e => {
  if (e.key === 'Enter') agregarEjercicio()
})

/* Al volver a la app (p. ej. después del Atajo) se revisa el día y se reconsulta Salud */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return
  if (verificarCambioDeDia()) calcular()
  cargarAppleHealth()
})

calcular()
cargarAppleHealth()
setInterval(cargarAppleHealth, 300000)
setInterval(() => { if (ultimaSyncAH) actualizarCardAH() }, 60000)
