/* ══════════════════════════════════════
   BALANCE — app.js v4
   con sync a Google Sheets + Ejercicio
══════════════════════════════════════ */

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzIcoU9vkng41n7wekGUItDsFDgehtYAHSX8oWPmtR_yPszRYoSfuh4sq8T2xrcfQ6-bQ/exec'

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

  // mostrar ejercicio en card si hay
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

  // sync sheet
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

  // sync sheet
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
   CAMARA + IA
══════════════════════════════════════ */
document.getElementById('camInput').addEventListener('change', async function (e) {
  const archivo = e.target.files[0]
  if (!archivo) return

  toast('Analizando imagen...')

  const reader = new FileReader()
  reader.onerror = () => { toast('Error al leer el archivo'); e.target.value = '' }
  reader.onload = async function () {
    try {
      const res = await fetch('https://calorias-foto.ariel-cozzolino.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: reader.result })
      })
      const data    = await res.json()
      const calorias = data.calorias || 650
      const comida   = data.comida   || 'Comida'
      const hora     = horaActual()
      const turno    = getTurno(hora)

      if (confirm(`${comida}\n${calorias} kcal\n¿Agregar?`)) {
        consumidas += calorias
        if (!registro[hoy]) registro[hoy] = []
        registro[hoy].push({ comida, calorias, hora, turno })
        localStorage.setItem('registroComidas', JSON.stringify(registro))

        calcular()

        syncSheet({
          type: 'comida',
          fecha: hoy,
          comida,
          calorias,
          hora,
          turno,
          consumidasTotal: consumidas,
          gastadasTotal:   gastadas,
          balance:         consumidas - gastadas
        })

        toast(`${turno} · ${comida} — ${calorias} kcal`)
      }
    } catch {
      toast('Error al analizar la imagen')
    }
    e.target.value = ''
  }
  reader.readAsDataURL(archivo)
})

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
  actualizarCardAH()
  try {
    const res  = await fetch(
      'https://docs.google.com/spreadsheets/d/1g8SMVE3-wGiHhxG3zsgoaA8HiGup0mrL8jiCybnEx4A/gviz/tq?tqx=out:json'
    )
    const text = await res.text()
    const json = JSON.parse(text.substr(47).slice(0, -2))
    const rows = json.table.rows

    const now   = new Date()
    const diaH  = now.getDate()
    const mesH  = now.getMonth() + 1
    const anioH = now.getFullYear()
    let actividad = 0

    rows.forEach(r => {
      const fechaRaw = r.c[1]?.v
      const cal      = r.c[3]?.v
      if (!fechaRaw || !cal) return

      let esHoy = false
      const s = String(fechaRaw)

      // Formato Google Visualization: "Date(año, mes0idx, día)"
      const gviz = s.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (gviz) {
        esHoy = +gviz[1] === anioH && +gviz[2] === mesH - 1 && +gviz[3] === diaH
      } else {
        // Formatos texto: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD (con posible hora)
        const clean = s.split(' ')[0]
        const slash = clean.split('/')
        const dash  = clean.split('-')
        if (slash.length === 3) {
          const [a, b, c] = slash.map(Number)
          esHoy = (a === diaH && b === mesH && c === anioH) ||  // DD/MM/YYYY
                  (a === mesH && b === diaH && c === anioH)     // MM/DD/YYYY
        } else if (dash.length === 3) {
          const [a, b, c] = dash.map(Number)
          esHoy = a === anioH && b === mesH && c === diaH       // YYYY-MM-DD
        }
      }

      if (esHoy) actividad = cal
    })

    actividadAH  = actividad
    ultimaSyncAH = new Date()
    estadoAH     = actividad > 0 ? 'ok' : 'sin-datos'

    // Solo reemplaza el fallback de 2200 si Apple Health tiene datos reales del día
    if (actividad > 0) gastadas = 1800 + actividad + ejercicio
    calcular()
  } catch (e) {
    estadoAH = 'error'
    console.log('Error Apple Health', e)
  }
  actualizarCardAH()
}

/* ══════════════════════════════════════
   GRAFICO
══════════════════════════════════════ */
function dibujarGrafico() {
  const bars  = document.getElementById('chart-bars')
  const stats = document.getElementById('prog-stats')
  const keys  = Object.keys(historial).slice(-7)

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
    const col  = b < 0 ? '#4ade80' : b < 300 ? '#facc15' : '#f87171'
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
      <div class="ps-val" style="color:${promedio<0?'#4ade80':promedio<300?'#facc15':'#f87171'}">${promedio>0?'+':''}${promedio}</div>
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
  const keys = Object.keys(historial).reverse()

  if (!keys.length) {
    list.innerHTML = '<div class="empty-state">Sin historial aún</div>'
    return
  }

  list.innerHTML = keys.map((k, i) => {
    const d     = historial[k]
    const bal   = d.balance
    const col   = bal < 0 ? '#4ade80' : bal < 300 ? '#facc15' : '#f87171'
    const bg    = bal < 0 ? 'rgba(74,222,128,0.12)' : bal < 300 ? 'rgba(250,204,21,0.12)' : 'rgba(248,113,113,0.12)'
    const label = bal < 0 ? 'deficit' : bal < 300 ? 'limite' : 'superavit'
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

cargarAppleHealth()
calcular()
setInterval(cargarAppleHealth, 300000)
setInterval(() => { if (ultimaSyncAH) actualizarCardAH() }, 60000)
