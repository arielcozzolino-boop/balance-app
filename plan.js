/* ══════════════════════════════════════
   BALANCE — plan.js
   Plan de alimentación semanal (tomado de "Mi plan semanal").
   kcal aproximadas (±20 %). red: true = carne vacuna o de cerdo.
══════════════════════════════════════ */

const PLAN_COMIDAS = [
  { id: 'desayuno', nombre: 'Desayuno', turno: 'Desayuno', hora: '08:00', grupo: 'dm', color: '#facc15' },
  { id: 'almuerzo', nombre: 'Almuerzo', turno: 'Almuerzo', hora: '12:30', grupo: 'ac', color: '#4ade80' },
  { id: 'merienda', nombre: 'Merienda', turno: 'Merienda', hora: '17:00', grupo: 'dm', color: '#fb923c' },
  { id: 'cena',     nombre: 'Cena',     turno: 'Cena',     hora: '21:00', grupo: 'ac', color: '#60a5fa' }
]

function _M(items, kcal, red) { return { items, kcal, red: !!red } }
function _A(nombre, items, kcal, red) { return { nombre, items, kcal, red: !!red } }

/* Menú base: PLAN_MENU[día 0=lunes][comida 0..3] */
const PLAN_MENU = [
  [ _M(['Mate o café', '2 galletitas de arroz integrales + 1 cda de pasta de maní', '30 g de queso untable descremado', '1 fruta'], 260),
    _M(['Omelette de 2 huevos + 2 claras con 30 g de queso descremado', 'Espinaca salteada + tomate crudo (½ plato)', '100 g de papa hervida y enfriada', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 580),
    _M(['Mate', '2 galletitas de arroz integrales + 1 cda de pasta de maní', '200 g de yogur descremado natural', '1 fruta'], 300),
    _M(['Pechuga de pollo a la plancha (180 g)', 'Ensalada de lechuga, tomate y pepino + zapallitos al horno', '100 g de batata', '1 cda de aceite de oliva crudo'], 470) ],
  [ _M(['Mate', '200 g de yogur descremado natural', '40 g de granola sin azúcar', 'Frutillas o 1 kiwi', '8–10 almendras'], 380),
    _M(['Pechuga de pollo (180 g)', 'Brócoli y morrón al vapor + tomate crudo', '100 g de batata', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 540),
    _M(['Mate o café', '2 galletitas de arroz integrales', '30 g de queso descremado', '1 cda de semillas molidas', '1 fruta'], 255),
    _M(['Carne vacuna magra (180 g, sin grasa visible)', 'Ensalada verde + calabaza asada', '100 g de quinoa cocida', '1 cda de aceite de oliva crudo'], 535, true) ],
  [ _M(['Mate', '2 galletitas de arroz integrales', '2 cdas de ricota descremada', '1 cda de semillas molidas', '1 fruta'], 225),
    _M(['Omelette de 2 huevos + 2 claras con espinaca y 30 g de queso descremado', 'Ensalada de tomate y lechuga', '100 g de choclo', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 600),
    _M(['200 g de yogur descremado natural', '40 g de quinoa pop', 'Arándanos o frutillas', '8–10 nueces'], 360),
    _M(['Pollo al horno con hierbas (180 g)', 'Vegetales asados + ensalada cruda', '100 g de papa hervida y enfriada', '1 cda de aceite de oliva crudo', '1 cda de chía o lino molido sobre la ensalada'], 515) ],
  [ _M(['Mate o café', 'Pancake de avena y banana (receta del plan)', '1 cda de pasta de maní'], 340),
    _M(['Pollo (180 g)', 'Ensalada grande + vegetales al vapor', '100 g de quinoa cocida', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 570),
    _M(['Mate', '2 galletitas de arroz integrales', '30 g de queso untable descremado', '8–10 nueces', '1 fruta'], 250),
    _M(['Tarta de brócoli con huevo y queso descremado (masa integral)', 'Ensalada verde', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 650) ],
  [ _M(['Mate', '2 galletitas de arroz integrales + 1 cda de pasta de maní', '200 g de yogur descremado natural', '1 fruta'], 300),
    _M(['Carne vacuna magra (180 g, sin grasa visible)', 'Ensalada de tomate, lechuga y zanahoria + berenjena grillada', '100 g de arroz integral o yamaní cocido', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 600, true),
    _M(['Mate cocido con 150 ml de leche descremada', '40 g de granola sin azúcar', '8–10 almendras', '1 fruta'], 370),
    _M(['Milanesa de pollo al horno (180 g) — el pan rallado es el almidón', 'Ensalada grande + vegetales asados', '1 cda de aceite de oliva crudo'], 530) ],
  [ _M(['Café con 150 ml de leche descremada', '1 rebanada de pan integral sin sal', '1 huevo revuelto + ½ palta + tomate', '1 fruta'], 400),
    _M(['Pollo (180 g)', 'Ensalada abundante + vegetales cocidos', '100 g de garbanzos o lentejas cocidos', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 590),
    _M(['Mate', '2 galletitas de arroz integrales', '2 cdas de ricota descremada', '1 cda de semillas molidas', '1 fruta'], 225),
    _M(['Hamburguesas caseras de pollo (180 g)', 'Ensalada verde + calabaza asada', '100 g de arroz yamaní cocido', '1 cda de aceite de oliva crudo'], 495) ],
  [ _M(['Mate o café', '200 g de yogur descremado natural', '40 g de granola sin azúcar', 'Frutillas o arándanos', '8–10 nueces'], 380),
    _M(['Carne vacuna magra (180 g, sin grasa visible)', 'Ensalada grande + vegetales grillados', '100 g de pasta integral o de legumbres al dente', '1 cda de aceite de oliva crudo', '1 fruta de postre'], 615, true),
    _M(['Mate o café', 'Muffin de ricota y arándanos (receta del plan)', '1 fruta'], 210),
    _M(['Pechuga de pollo (180 g)', 'Verduras cocidas + ensalada cruda', '100 g de papa hervida y enfriada', '1 cda de aceite de oliva crudo'], 460) ]
]

/* Alternativas compatibles: dm = desayuno/merienda, ac = almuerzo/cena */
const PLAN_ALTS = {
  dm: [
    _A('Yogur con granola', ['200 g de yogur descremado natural', '40 g de granola sin azúcar', '1 fruta', '8–10 almendras'], 400),
    _A('Galletitas con queso y maní', ['2 galletitas de arroz integrales', '30 g de queso untable descremado', '1 cda de pasta de maní', '1 fruta'], 260),
    _A('Tostada con huevo y palta', ['1 rebanada de pan integral sin sal', '1 huevo revuelto + ½ palta + tomate', '1 fruta'], 350),
    _A('Pancake de avena y banana', ['Pancake (receta del plan)', '1 cda de pasta de maní'], 340),
    _A('Muffin de ricota', ['Muffin de ricota y arándanos (receta del plan)', '1 fruta'], 210),
    _A('Leche con granola', ['150 ml de leche descremada', '40 g de granola sin azúcar', '8–10 nueces', '1 fruta'], 370),
    _A('Yogur con quinoa pop', ['200 g de yogur descremado natural', '40 g de quinoa pop', 'Arándanos o frutillas', '8–10 nueces'], 360),
    _A('Galletitas con ricota', ['2 galletitas de arroz integrales', '2 cdas de ricota descremada', '1 cda de semillas molidas', '1 fruta'], 225),
    _A('Tostada con queso', ['1 rebanada de pan integral sin sal', '30 g de queso untable descremado', '1 cda de semillas molidas', '1 fruta'], 235)
  ],
  ac: [
    _A('Pollo a la plancha con papa', ['Pechuga de pollo (180 g)', 'Ensalada + verduras cocidas (½ plato)', '100 g de papa hervida y enfriada', '1 cda de aceite de oliva crudo'], 460),
    _A('Milanesa de pollo al horno', ['Milanesa de pollo al horno (180 g) — el pan rallado es el almidón', 'Ensalada grande + vegetales asados', '1 cda de aceite de oliva crudo'], 530),
    _A('Pollo al horno con batata', ['Pollo al horno con hierbas (180 g)', 'Vegetales asados + ensalada cruda', '100 g de batata', '1 cda de aceite de oliva crudo'], 470),
    _A('Hamburguesas caseras de pollo', ['Hamburguesas caseras de pollo (180 g)', 'Ensalada verde + vegetales cocidos', '100 g de arroz yamaní cocido', '1 cda de aceite de oliva crudo'], 495),
    _A('Wok de pollo con arroz', ['Pollo en tiras (180 g) salteado sin aceite con vegetales', '100 g de arroz integral cocido', '1 cda de aceite de oliva crudo al final'], 495),
    _A('Pasta integral con pollo', ['100 g de pasta integral o de legumbres al dente', 'Pollo (180 g) con vegetales salteados', '1 cda de aceite de oliva crudo'], 510),
    _A('Lentejas con pollo y verduras', ['100 g de lentejas cocidas', 'Pollo (180 g) y verduras', '1 cda de aceite de oliva crudo'], 495),
    _A('Omelette con papa', ['Omelette de 2 huevos + 2 claras con 30 g de queso descremado', 'Tomate + espinaca (½ plato)', '100 g de papa hervida y enfriada', '1 cda de aceite de oliva crudo'], 510),
    _A('Tortilla de espinaca y papa', ['Tortilla de 2 huevos + 2 claras, espinaca, 100 g de papa y 30 g de queso descremado', 'Ensalada verde', '1 cda de aceite de oliva crudo'], 515),
    _A('Ensalada completa', ['2 huevos duros', '30 g de queso descremado', '100 g de garbanzos cocidos', 'Verduras crudas y cocidas (½ plato)', '1 cda de aceite de oliva crudo'], 540),
    _A('Tarta de verduras', ['Porción de tarta de brócoli o espinaca (masa integral)', 'Ensalada verde', '1 cda de aceite de oliva crudo'], 580),
    _A('Carne magra con quinoa', ['Carne vacuna magra (180 g, sin grasa visible)', 'Ensalada + vegetales grillados', '100 g de quinoa cocida', '1 cda de aceite de oliva crudo'], 535, true),
    _A('Solomillo de cerdo con choclo', ['Solomillo de cerdo (180 g, sin grasa visible)', 'Ensalada + vegetales al horno', '100 g de choclo', '1 cda de aceite de oliva crudo'], 490, true)
  ]
}

const PLAN_PAUTAS = [
  'Calorías aproximadas (±20 %): son referencia, no meta.',
  '½ plato de verduras crudas y cocidas en almuerzo y cena.',
  '1 solo almidón por comida (papa, batata, choclo, cereal, legumbre o masa). El pan rallado de la milanesa cuenta.',
  'Papa hervida y enfriada; pastas al dente.',
  '180 g de proteína en almuerzo y cena.',
  '3 frutas enteras por día, sin jugos.',
  'Aceite crudo: 1 cucharada en almuerzo y 1 en cena.',
  'Carne roja hasta 3 veces por semana, sin grasa visible.',
  'Sin pescado: omega 3 de nueces y semillas molidas (chía o lino).',
  'Lácteos descremados; hasta 3 huevos enteros por día.',
  'Al menos 1,5 L de agua por día.',
  'Evitar frituras, embutidos, ultraprocesados, aderezos comerciales, manteca y panificados.'
]

const PLAN_RECETAS = [
  { nombre: 'Pancake de avena y banana', texto: '1 huevo, 3 cdas de avena, ½ cdita de polvo de hornear, 2 cditas de queso untable descremado o yogur, ½ banana pisada, esencia de vainilla y edulcorante. Mezclar y cocinar en sartén.' },
  { nombre: 'Muffin de ricota y arándanos', texto: '2 cdas de ricota descremada, 1 huevo, un puñado de arándanos, edulcorante y esencia de vainilla. Mezclar y cocinar 3 minutos en microondas.' },
  { nombre: 'Milanesa de pollo al horno', texto: 'Filetes de pechuga pasados por clara y pan rallado integral. Hornear sobre placa con papel manteca, dando vuelta a mitad de cocción.' },
  { nombre: 'Sustituto de clara', texto: '3 g de albúmina en polvo (1 cdita de té) + 30 ml de agua.' }
]

/* ══════════════════════════════════════
   ESTADO
   planCambios: { 'YYYY-MM-DD': { desayuno: índiceAlternativa } }
   planHechas:  { 'YYYY-MM-DD': { desayuno: { id, kcal } } }   (id = registro en Balance)
══════════════════════════════════════ */
let planCambios = _leer('planCambios')
let planHechas  = _leer('planHechas')
let planSemana  = 0          // 0 = esta semana, -1 anterior, +1 siguiente
let planDiaSel  = null       // 'YYYY-MM-DD' seleccionado

function _leer(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') } catch { return {} } }
function _guardar() {
  localStorage.setItem('planCambios', JSON.stringify(planCambios))
  localStorage.setItem('planHechas',  JSON.stringify(planHechas))
}

function _lunes(offsetSemanas) {
  const d = new Date(); d.setHours(12, 0, 0, 0)
  const dow = (d.getDay() + 6) % 7          // 0 = lunes
  d.setDate(d.getDate() - dow + offsetSemanas * 7)
  return d
}
function _diasSemana(offset) {
  const l = _lunes(offset)
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(l); d.setDate(l.getDate() + i); return d })
}
function _idxDia(fecha) { return (new Date(fecha + 'T12:00:00').getDay() + 6) % 7 }

/* Comida efectiva de un día: la base o la alternativa elegida */
function comidaPlan(fecha, ci) {
  const c = PLAN_COMIDAS[ci]
  const alt = planCambios[fecha]?.[c.id]
  if (alt !== undefined && PLAN_ALTS[c.grupo][alt]) {
    const a = PLAN_ALTS[c.grupo][alt]
    return { ...a, cambiada: true }
  }
  const b = PLAN_MENU[_idxDia(fecha)][ci]
  return { ...b, nombre: _resumen(b.items), cambiada: false }
}
function _resumen(items) {
  const principal = items.find(i => !/^(mate|café|cafe|mate o café)$/i.test(i.trim())) || items[0]
  return principal.length > 48 ? principal.slice(0, 46) + '…' : principal
}

function _rojasSemana(dias) {
  let n = 0
  dias.forEach(d => { const f = fechaLocal(d); PLAN_COMIDAS.forEach((_, ci) => { if (comidaPlan(f, ci).red) n++ }) })
  return n
}

/* ══════════════════════════════════════
   RENDER
══════════════════════════════════════ */
function renderPlan() {
  const cont = document.getElementById('plan-cont')
  if (!cont) return
  const dias = _diasSemana(planSemana)
  const fechas = dias.map(fechaLocal)
  if (!planDiaSel || !fechas.includes(planDiaSel)) planDiaSel = fechas.includes(hoy) ? hoy : fechas[0]

  const rojas = _rojasSemana(dias)
  const ini = dias[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  const fin = dias[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  const chips = dias.map((d, i) => {
    const f = fechas[i]
    const total = PLAN_COMIDAS.reduce((s, _, ci) => s + comidaPlan(f, ci).kcal, 0)
    const hechas = Object.keys(planHechas[f] || {}).length
    const cls = ['plan-chip', f === planDiaSel ? 'sel' : '', f === hoy ? 'hoy' : ''].join(' ')
    return `<button class="${cls}" onclick="planElegirDia('${f}')">
      <span class="pc-d">${['L','M','M','J','V','S','D'][i]}</span>
      <span class="pc-n">${d.getDate()}</span>
      <span class="pc-dots">${'●'.repeat(hechas)}${'○'.repeat(4 - hechas)}</span>
      <span class="pc-k">${total}</span>
    </button>`
  }).join('')

  const f = planDiaSel
  const esFuturo = f > hoy
  const totalDia = PLAN_COMIDAS.reduce((s, _, ci) => s + comidaPlan(f, ci).kcal, 0)
  const hechoKcal = Object.values(planHechas[f] || {}).reduce((s, h) => s + (h.kcal || 0), 0)
  const diaLargo = new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  const cards = PLAN_COMIDAS.map((c, ci) => {
    const m = comidaPlan(f, ci)
    const hecha = planHechas[f]?.[c.id]
    const items = m.items.map(t => `<li>${esc(t)}</li>`).join('')
    let acciones
    if (hecha) {
      acciones = `<div class="pm-done">✓ Hecha · ${hecha.kcal} kcal</div>
        <button class="pm-btn ghost" onclick="planDeshacer('${f}','${c.id}')">Deshacer</button>`
    } else if (esFuturo) {
      acciones = `<button class="pm-btn ghost" onclick="planAbrirCambio('${f}',${ci})">Cambiar</button>`
    } else {
      acciones = `<button class="pm-btn" onclick="planMarcar('${f}',${ci})">✓ Hecha</button>
        <button class="pm-btn ghost" onclick="planAbrirCambio('${f}',${ci})">Cambiar</button>`
    }
    return `<div class="plan-meal ${hecha ? 'done' : ''}" style="--mc:${c.color}">
      <div class="pm-head">
        <span class="pm-name">${c.nombre}</span>
        <span class="pm-hora">${c.hora}</span>
        <span class="pm-kcal">≈ ${m.kcal} kcal</span>
      </div>
      ${m.cambiada ? `<div class="pm-alt">Cambiado por: ${esc(m.nombre)}</div>` : ''}
      ${m.red ? '<span class="pm-red">carne roja</span>' : ''}
      <ul class="pm-items">${items}</ul>
      <div class="pm-actions">${acciones}</div>
    </div>`
  }).join('')

  cont.innerHTML = `
    <div class="plan-week">
      <button class="plan-arrow" onclick="planMoverSemana(-1)" aria-label="Semana anterior">‹</button>
      <div class="plan-week-txt">${ini} – ${fin}${planSemana === 0 ? '' : ` · <a onclick="planMoverSemana(${-planSemana})">ir a hoy</a>`}</div>
      <button class="plan-arrow" onclick="planMoverSemana(1)" aria-label="Semana siguiente">›</button>
    </div>
    <div class="plan-chips">${chips}</div>
    <div class="plan-sum">
      <div><span class="ps-big">${hechoKcal}</span> / ${totalDia} kcal del plan</div>
      <div class="ps-sub">${diaLargo.charAt(0).toUpperCase() + diaLargo.slice(1)} · carne roja esta semana: <b class="${rojas > 3 ? 'warn' : ''}">${rojas} de 3</b></div>
    </div>
    ${cards}
    <details class="plan-info"><summary>Pautas del plan</summary><ul>${PLAN_PAUTAS.map(p => `<li>${esc(p)}</li>`).join('')}</ul></details>
    <details class="plan-info"><summary>Recetas</summary>${PLAN_RECETAS.map(r => `<p><b>${esc(r.nombre)}:</b> ${esc(r.texto)}</p>`).join('')}</details>`
}

function planElegirDia(f) { planDiaSel = f; renderPlan() }
function planMoverSemana(n) { planSemana += n; planDiaSel = null; renderPlan() }

/* ══════════════════════════════════════
   ACCIONES
══════════════════════════════════════ */
function planMarcar(fecha, ci, kcalOverride, nombreOverride) {
  if (fecha > hoy) { toast('No se puede marcar un día futuro'); return }
  const c = PLAN_COMIDAS[ci]
  if (planHechas[fecha]?.[c.id]) return
  const m = comidaPlan(fecha, ci)
  const kcal = kcalOverride ?? m.kcal
  const nombre = nombreOverride ?? m.nombre
  const id = registrarComida({ fecha, comida: nombreOverride ? nombre : 'Plan · ' + nombre, calorias: kcal, turno: c.turno, hora: c.hora })
  if (!planHechas[fecha]) planHechas[fecha] = {}
  planHechas[fecha][c.id] = { id, kcal }
  _guardar()
  renderPlan()
  toast(`${c.nombre} ✓ — ${kcal} kcal sumadas${fecha === hoy ? '' : ' a ese día'}`)
}

function planDeshacer(fecha, comidaId) {
  const h = planHechas[fecha]?.[comidaId]
  if (!h) return
  quitarComida(fecha, h.id)
  delete planHechas[fecha][comidaId]
  if (!Object.keys(planHechas[fecha]).length) delete planHechas[fecha]
  _guardar()
  renderPlan()
  toast('Desmarcada')
}

/* ── Hoja "Cambiar comida" ── */
let _planCtx = null

function planAbrirCambio(fecha, ci) {
  _planCtx = { fecha, ci }
  const c = PLAN_COMIDAS[ci]
  const actual = planCambios[fecha]?.[c.id]
  const base = PLAN_MENU[_idxDia(fecha)][ci]
  const opts = [`<button class="alt-opt ${actual === undefined ? 'sel' : ''}" onclick="planElegirAlt(null)">
      <div class="ao-top"><b>Menú del día</b><span>${base.kcal} kcal</span></div>
      <div class="ao-items">${esc(base.items.join(' · '))}</div></button>`]
  PLAN_ALTS[c.grupo].forEach((a, i) => {
    opts.push(`<button class="alt-opt ${actual === i ? 'sel' : ''}" onclick="planElegirAlt(${i})">
      <div class="ao-top"><b>${esc(a.nombre)}</b><span>${a.kcal} kcal${a.red ? ' · carne roja' : ''}</span></div>
      <div class="ao-items">${esc(a.items.join(' · '))}</div></button>`)
  })
  const futuro = fecha > hoy
  document.getElementById('alt-title').textContent = `Cambiar ${c.nombre.toLowerCase()}`
  document.getElementById('alt-list').innerHTML = opts.join('')
  document.getElementById('alt-otra').hidden = futuro
  document.getElementById('alt-modal').classList.add('active')
}

function planCerrarCambio() { document.getElementById('alt-modal').classList.remove('active') }

function planElegirAlt(i) {
  const { fecha, ci } = _planCtx
  const c = PLAN_COMIDAS[ci]
  if (planHechas[fecha]?.[c.id]) { toast('Primero deshacé la comida marcada'); return }
  if (!planCambios[fecha]) planCambios[fecha] = {}
  if (i === null) delete planCambios[fecha][c.id]
  else planCambios[fecha][c.id] = i
  if (!Object.keys(planCambios[fecha]).length) delete planCambios[fecha]
  _guardar()
  planCerrarCambio()
  renderPlan()
}

/* "Comí otra cosa": va a Comer con el día y el momento ya elegidos */
let _planPendiente = null

function planTrasCargaManual(fecha, turno, id, kcal) {
  const p = _planPendiente
  _planPendiente = null
  if (!p || p.fecha !== fecha || PLAN_COMIDAS[p.ci].turno !== turno) return
  const c = PLAN_COMIDAS[p.ci]
  if (planHechas[fecha]?.[c.id]) return
  if (!planHechas[fecha]) planHechas[fecha] = {}
  planHechas[fecha][c.id] = { id, kcal, otra: true }
  _guardar()
}

function planComiOtra() {
  const { fecha, ci } = _planCtx
  _planPendiente = { fecha, ci }
  planCerrarCambio()
  go('comer')
  const selDia = document.getElementById('sel-dia')
  if (selDia && [...selDia.options].some(o => o.value === fecha)) selDia.value = fecha
  document.getElementById('sel-turno').value = PLAN_COMIDAS[ci].turno
  document.getElementById('inp-comida').focus()
  toast(`Cargá lo que comiste en ${PLAN_COMIDAS[ci].nombre.toLowerCase()}`)
}
