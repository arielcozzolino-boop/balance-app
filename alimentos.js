/* ══════════════════════════════════════
   BALANCE — alimentos.js
   Tabla local de calorías aproximadas (sin IA, sin internet, costo cero).
   Cada entrada: [nombres posibles, kcal por porción típica, descripción de la porción, kcal cada 100 g (opcional)]
   Los valores son aproximados: sirven para estimar, no son exactos.
   Para agregar un alimento: sumá una línea con el mismo formato.
══════════════════════════════════════ */

const ALIMENTOS = [
  /* ── Desayuno / merienda ── */
  [['cafe con leche', 'lagrima'],                 90,  'taza'],
  [['cortado'],                                   30,  'pocillo'],
  [['cafe', 'espresso', 'americano'],              5,  'taza'],
  [['mate cocido con leche'],                     80,  'taza'],
  [['mate cocido', 'te', 'infusion'],              3,  'taza'],
  [['mate', 'mates'],                              5,  'ronda'],
  [['leche descremada'],                          90,  'vaso 250 ml', 36],
  [['leche'],                                    150,  'vaso 250 ml', 60],
  [['yogur con granola', 'yogurt con granola'],  300,  'pote + granola'],
  [['yogur descremado', 'yogurt descremado'],     90,  'pote'],
  [['yogur', 'yogurt'],                          150,  'pote'],
  [['granola'],                                  180,  'porción 40 g', 450],
  [['avena'],                                    150,  'porción 40 g', 380],
  [['cereal', 'cereales', 'copos'],              150,  'porción 40 g', 380],
  [['medialuna de grasa'],                       170,  'unidad'],
  [['medialuna'],                                190,  'unidad'],
  [['factura', 'vigilante', 'bola de fraile', 'cañoncito'], 230, 'unidad'],
  [['bizcochito', 'bizcocho'],                    40,  'unidad'],
  [['tostada con manteca'],                      130,  'unidad'],
  [['tostada con mermelada'],                    120,  'unidad'],
  [['tostada con queso crema', 'tostada con queso blanco'], 130, 'unidad'],
  [['tostada con palta', 'tostada de palta'],    180,  'unidad'],
  [['tostada'],                                   80,  'unidad'],
  [['pan de hamburguesa', 'pan de pancho'],      150,  'unidad'],
  [['pan integral'],                             120,  'porción 50 g', 250],
  [['pan'],                                      135,  'porción 50 g', 270],
  [['galletita de agua', 'galleta de agua', 'criollita', 'cracker'], 20, 'unidad'],
  [['galleta de arroz', 'galletita de arroz'],    30,  'unidad'],
  [['galletita', 'galleta', 'cookie'],            45,  'unidad'],
  [['manteca'],                                   35,  'cucharadita'],
  [['mermelada'],                                 40,  'cucharada'],
  [['dulce de leche'],                            60,  'cucharada'],
  [['queso crema', 'queso blanco', 'casancrem'],  45,  'cucharada'],
  [['miel'],                                      60,  'cucharada'],
  [['mantequilla de mani', 'pasta de mani'],      95,  'cucharada'],
  [['huevos revueltos', 'revuelto'],             200,  'porción (2 huevos)'],
  [['omelette', 'omelet'],                       250,  'unidad (2 huevos)'],
  [['huevo frito'],                              100,  'unidad'],
  [['huevo duro', 'huevo'],                       75,  'unidad'],
  [['panqueque con dulce de leche'],             300,  'unidad'],
  [['panqueque con mantequilla de mani'],        350,  'unidad'],
  [['panqueque', 'pancake', 'crepe'],            150,  'unidad'],
  [['licuado', 'smoothie'],                      250,  'vaso'],
  [['jugo de naranja', 'exprimido'],             110,  'vaso'],
  [['jugo'],                                     110,  'vaso'],

  /* ── Frutas ── */
  [['ensalada de frutas'],                       120,  'taza'],
  [['banana'],                                   105,  'unidad'],
  [['manzana'],                                   80,  'unidad'],
  [['naranja'],                                   65,  'unidad'],
  [['mandarina'],                                 40,  'unidad'],
  [['pera'],                                     100,  'unidad'],
  [['durazno'],                                   60,  'unidad'],
  [['kiwi'],                                      45,  'unidad'],
  [['frutilla'],                                  50,  'taza'],
  [['uva'],                                      100,  'taza'],
  [['ciruela'],                                   30,  'unidad'],
  [['anana'],                                     80,  'taza'],
  [['sandia', 'melon'],                           60,  'tajada'],
  [['fruta'],                                     80,  'unidad'],
  [['palta'],                                    160,  'media unidad'],

  /* ── Carnes ── */
  [['milanesa napolitana', 'napolitana'],        600,  'unidad'],
  [['milanesa a caballo'],                       550,  'unidad'],
  [['milanesa de pollo', 'suprema'],             350,  'unidad'],
  [['milanesa al horno'],                        300,  'unidad'],
  [['milanesa de soja'],                         250,  'unidad'],
  [['milanesa', 'mila'],                         400,  'unidad'],
  [['bife de chorizo', 'ojo de bife'],           550,  'porción 250 g', 220],
  [['bife', 'churrasco', 'carne a la plancha'],  350,  'porción 200 g', 180],
  [['asado', 'tira de asado', 'costilla'],       700,  'porción 250 g', 280],
  [['vacio'],                                    600,  'porción 250 g', 240],
  [['entraña'],                                  450,  'porción 200 g', 225],
  [['lomo'],                                     400,  'porción 200 g', 200],
  [['colita de cuadril', 'cuadril', 'peceto', 'nalga'], 350, 'porción 200 g', 175],
  [['matambre'],                                 400,  'porción'],
  [['choripan'],                                 450,  'unidad'],
  [['chorizo'],                                  300,  'unidad'],
  [['morcilla'],                                 300,  'unidad'],
  [['carne picada'],                             250,  'porción 100 g', 250],
  [['carne'],                                    450,  'porción 200 g', 225],
  [['pechuga'],                                  250,  'unidad', 165],
  [['pollo al horno', 'cuarto de pollo', 'pata muslo'], 400, 'cuarto'],
  [['pollo'],                                    300,  'porción', 165],
  [['hamburguesa completa', 'hamburguesa con pan'], 550, 'unidad'],
  [['hamburguesa', 'medallon'],                  250,  'medallón'],
  [['pancho', 'hot dog'],                        300,  'unidad'],
  [['salchicha'],                                130,  'unidad'],
  [['salmon'],                                   350,  'porción 200 g', 175],
  [['merluza', 'filet de pescado', 'pescado'],   200,  'filet', 90],
  [['atun'],                                     180,  'lata'],
  [['sushi', 'roll', 'pieza de sushi'],           45,  'pieza'],
  [['jamon cocido', 'jamon crudo', 'jamon'],      30,  'feta'],
  [['fiambre', 'salame', 'mortadela'],           120,  'porción'],
  [['queso rallado'],                             25,  'cucharada'],
  [['queso'],                                    110,  'porción 30 g', 350],

  /* ── Pastas, cereales y harinas ── */
  [['fideos con salsa', 'pasta con salsa', 'tallarines con salsa'], 550, 'plato'],
  [['fideos con manteca', 'fideos con aceite'],  550,  'plato'],
  [['fideos', 'pasta', 'tallarines', 'spaghetti', 'tirabuzones', 'mostachol'], 450, 'plato', 150],
  [['ñoquis', 'noquis'],                         500,  'plato'],
  [['sorrentinos'],                              600,  'plato'],
  [['ravioles'],                                 550,  'plato'],
  [['lasaña', 'lasagna'],                        600,  'porción'],
  [['canelones'],                                550,  'porción (2)'],
  [['salsa bolognesa', 'bolognesa', 'tuco'],     150,  'porción'],
  [['salsa'],                                     80,  'porción'],
  [['risotto'],                                  500,  'plato'],
  [['arroz con pollo'],                          550,  'plato'],
  [['arroz'],                                    200,  'taza cocido', 130],
  [['polenta'],                                  300,  'plato'],
  [['quinoa'],                                   220,  'taza cocida', 120],
  [['empanada de carne'],                        300,  'unidad'],
  [['empanada de jamon y queso', 'empanada de jyq'], 280, 'unidad'],
  [['empanada de verdura', 'empanada de humita', 'empanada de pollo'], 260, 'unidad'],
  [['empanada'],                                 280,  'unidad'],
  [['fugazzeta'],                                330,  'porción'],
  [['pizza'],                                    280,  'porción'],
  [['faina'],                                    150,  'porción'],
  [['tarta de jamon y queso'],                   400,  'porción'],
  [['tarta de verdura', 'tarta de acelga', 'tarta de zapallito', 'tarta de calabaza'], 300, 'porción'],
  [['tarta', 'quiche'],                          350,  'porción'],
  [['tortilla de papa', 'tortilla'],             300,  'porción'],
  [['frittata'],                                 250,  'porción'],
  [['revuelto gramajo'],                         500,  'plato'],
  [['pastel de papa'],                           500,  'porción'],
  [['zapallitos rellenos', 'tomates rellenos', 'berenjenas rellenas'], 250, 'porción (2)'],
  [['pollo con papas', 'pollo al horno con papas'], 600, 'plato'],
  [['estofado', 'carne al horno', 'carne con papas'], 550, 'plato'],
  [['albondigas'],                               400,  'porción (4)'],
  [['bondiola'],                                 450,  'porción 200 g'],
  [['sandwich de milanesa', 'milanesa al pan'],  700,  'unidad'],
  [['lomito', 'sandwich de lomo'],               750,  'unidad'],
  [['tostado', 'sandwich de jamon y queso'],     350,  'unidad'],
  [['sandwich de miga', 'sanguche de miga'],     120,  'unidad'],
  [['sandwich', 'sanguche', 'sanguchito'],       400,  'unidad'],
  [['wrap'],                                     400,  'unidad'],
  [['burrito'],                                  600,  'unidad'],
  [['taco'],                                     200,  'unidad'],

  /* ── Guarniciones y verduras ── */
  [['pure de papa', 'pure'],                     200,  'porción'],
  [['pure de calabaza', 'pure de zapallo'],      100,  'porción'],
  [['papas fritas de paquete', 'papitas', 'chizitos'], 250, 'bolsita'],
  [['papas fritas', 'papas a la francesa'],      400,  'porción'],
  [['papas al horno', 'papa al horno'],          180,  'porción'],
  [['papa', 'papas'],                            130,  'unidad', 80],
  [['batata', 'boniato'],                        130,  'unidad', 90],
  [['ensalada rusa'],                            300,  'porción'],
  [['ensalada cesar'],                           350,  'plato'],
  [['ensalada'],                                 100,  'plato (con aceite)'],
  [['verduras salteadas', 'vegetales salteados', 'wok de verduras'], 120, 'porción'],
  [['verduras asadas', 'vegetales asados', 'verduras al horno'], 120, 'porción'],
  [['verdura', 'vegetales', 'brocoli', 'zapallito', 'espinaca', 'acelga'], 50, 'porción'],
  [['calabaza', 'zapallo'],                       60,  'porción'],
  [['tomate'],                                    25,  'unidad'],
  [['lechuga'],                                   10,  'porción'],
  [['zanahoria'],                                 30,  'unidad'],
  [['choclo'],                                    90,  'unidad'],
  [['lentejas', 'guiso de lentejas'],            350,  'plato'],
  [['garbanzos', 'porotos'],                     270,  'taza'],
  [['guiso'],                                    450,  'plato'],
  [['locro'],                                    550,  'plato'],
  [['sopa', 'crema de verduras'],                120,  'plato'],
  [['caldo'],                                     30,  'taza'],
  [['aceite de oliva', 'aceite'],                120,  'cucharada'],
  [['mayonesa'],                                  90,  'cucharada'],
  [['ketchup', 'mostaza'],                        20,  'cucharada'],

  /* ── Postres y snacks ── */
  [['alfajor triple'],                           350,  'unidad'],
  [['alfajor'],                                  250,  'unidad'],
  [['barra de chocolate', 'chocolate', 'bombon'], 160, 'porción 30 g', 540],
  [['barra de cereal', 'barrita de cereal'],     100,  'unidad'],
  [['barra de proteina', 'barrita de proteina'], 200,  'unidad'],
  [['turron'],                                    90,  'unidad'],
  [['helado'],                                   140,  'bocha'],
  [['flan con dulce de leche'],                  300,  'porción'],
  [['flan'],                                     200,  'porción'],
  [['torta', 'cheesecake', 'lemon pie', 'chocotorta'], 400, 'porción'],
  [['budin', 'bizcochuelo'],                     300,  'porción'],
  [['brownie'],                                  300,  'unidad'],
  [['gelatina'],                                  60,  'porción'],
  [['mani'],                                     170,  'puñado 30 g', 570],
  [['almendras', 'nueces', 'frutos secos', 'castañas'], 180, 'puñado 30 g', 600],
  [['pochoclo', 'pochoclos'],                    150,  'porción'],

  /* ── Bebidas ── */
  [['coca zero', 'coca light', 'gaseosa zero', 'gaseosa light', 'pepsi black'], 1, 'vaso'],
  [['coca', 'coca cola', 'gaseosa', 'sprite', 'fanta', 'pepsi'], 100, 'vaso 250 ml', 42],
  [['agua saborizada', 'aquarius', 'levite'],     50,  'vaso'],
  [['agua', 'soda'],                               0,  'vaso'],
  [['cerveza', 'birra', 'porron'],               200,  'lata/porrón', 43],
  [['pinta'],                                    250,  'pinta'],
  [['vino'],                                     125,  'copa', 85],
  [['fernet con coca', 'fernet'],                220,  'vaso'],
  [['trago', 'gin tonic', 'daiquiri', 'mojito', 'aperol'], 200, 'vaso'],
  [['batido de proteina', 'proteina con leche'], 250,  'vaso'],
  [['proteina', 'scoop', 'whey'],                120,  'scoop'],
  [['isotonica', 'gatorade', 'powerade'],         60,  'botella 500 ml'],
]

/* ── Motor de estimación ── */
const _NUM = {
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8,
  nueve: 9, diez: 10, medio: 0.5, media: 0.5, doble: 2, par: 2, cuarto: 0.25
}
const _UNIDADES = /^(porcion|porciones|plato|platos|vaso|vasos|taza|tazas|unidad|unidades|feta|fetas|rodaja|rodajas|cucharada|cucharadas|cucharadita|cucharaditas|bocha|bochas|lata|latas|copa|copas|pote|potes|puñado|puñados|scoop|scoops|tajada|tajadas|pieza|piezas|de|del|con|la|el|las|los)$/
const _RELLENO  = new Set(['y', 'e', 'con', 'de', 'del', 'la', 'el', 'las', 'los', 'un', 'una', 'unos', 'unas', 'mas', 'tambien', 'comi', 'cene', 'almorce', 'tome', 'me', 'a', 'al', 'en', 'para', 'casero', 'casera', 'grande', 'chico', 'chica', 'mediano', 'mediana', 'poco', 'poquito', 'algo', 'sin', 'x'])

function _norm(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/½/g, ' 0.5 ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\bx\s*(\d)/g, ' x $1')
    .replace(/(\d)\s*\/\s*(\d)/g, (m, a, b) => ' ' + (Number(a) / Number(b)) + ' ')
    .replace(/(\d?)\.(\d?)/g, (m, a, b) => (a && b) ? m : `${a} ${b}`)
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

/* Índice: todos los nombres normalizados, del más largo al más corto
   (así "cafe con leche" gana antes que "cafe" y "leche"). */
const _INDICE = (() => {
  const out = []
  ALIMENTOS.forEach(([nombres, kcal, porcion, k100]) => {
    nombres.forEach(n => out.push({ clave: _norm(n), nombre: nombres[0], kcal, porcion, k100 }))
  })
  return out.sort((a, b) => b.clave.length - a.clave.length)
})()

function _escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

/* Busca la cantidad en las palabras justo antes del alimento:
   "2 empanadas", "dos porciones de pizza", "media milanesa", "200 g de arroz" */
function _cantidadAntes(palabras) {
  let gramos = null, cant = null
  for (let i = palabras.length - 1, saltos = 0; i >= 0 && saltos < 4; i--, saltos++) {
    const w = palabras[i]
    if (/^\d+(\.\d+)?(g|gr|grs|gramos)$/.test(w)) { gramos = parseFloat(w); break }
    if (/^(g|gr|grs|gramos)$/.test(w) && i > 0 && /^\d+(\.\d+)?$/.test(palabras[i - 1])) { gramos = parseFloat(palabras[i - 1]); break }
    if (/^\d+(\.\d+)?$/.test(w)) { cant = parseFloat(w); break }
    if (_NUM[w] !== undefined) { cant = _NUM[w]; if (w === 'medio' || w === 'media') { /* "un medio" no aplica */ } break }
    if (!_UNIDADES.test(w)) break
  }
  return { cant, gramos }
}

function _modificador(despues) {
  const w = despues.slice(0, 1).join(' ')
  if (/\b(grande|abundante|doble)\b/.test(w)) return 1.4
  if (/\b(chico|chica|chiquito|chiquita|pequeno|pequena|poco|poquito)\b/.test(w)) return 0.7
  return 1
}

/* Devuelve { total, items: [{nombre, cantidad, kcal, porcion}], sinReconocer: [palabras] } */
function estimarCalorias(texto) {
  let resto = ' ' + _norm(texto) + ' '
  const items = []

  for (const ali of _INDICE) {
    const patron = ali.clave.split(' ').map(w => _escRe(w) + '(?:s|es)?').join(' ')
    const re = new RegExp(`\\s(${patron})(?=\\s)`, 'g')
    let m
    while ((m = re.exec(resto)) !== null) {
      const inicio = m.index, fin = m.index + m[0].length
      const antes   = resto.slice(0, inicio).trim().split(' ').filter(Boolean)
      const despues = resto.slice(fin).trim().split(' ').filter(Boolean)
      let { cant, gramos } = _cantidadAntes(antes)
      // Cantidad escrita después: "sushi 12 piezas", "empanadas x3"
      if (!cant && !gramos && despues.length) {
        const d0 = despues[0], d1 = despues[1]
        const n = /^\d+(\.\d+)?$/.test(d0) ? parseFloat(d0) : null
        if (n && (!d1 || _UNIDADES.test(d1) || !_INDICE.some(a => a.clave.startsWith(d1)))) cant = n
        else if (d0 === 'x' && /^\d+$/.test(d1 || '')) cant = parseFloat(d1)
      }
      const mod = _modificador(despues)

      let kcal, cantidadTxt
      if (gramos && ali.k100) {
        kcal = Math.round(ali.k100 * gramos / 100 * mod)
        cantidadTxt = `${gramos} g`
      } else {
        const c = cant || 1
        kcal = Math.round(ali.kcal * c * mod)
        cantidadTxt = `${c} ${ali.porcion}`
      }
      items.push({ nombre: ali.nombre, cantidad: cantidadTxt, kcal, porcion: ali.porcion })

      // Se borra lo reconocido (y su cantidad) para no contarlo dos veces
      resto = resto.slice(0, inicio) + ' ' + '·'.repeat(m[0].length - 1) + resto.slice(fin)
      re.lastIndex = 0
    }
  }

  const sinReconocer = resto.replace(/·+/g, ' ').split(' ')
    .filter(w => w && !_RELLENO.has(w) && !/^\d/.test(w) && _NUM[w] === undefined && !_UNIDADES.test(w) && w.length > 2)

  return { total: items.reduce((s, i) => s + i.kcal, 0), items, sinReconocer }
}
