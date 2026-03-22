function showScreen(id){
document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"))
document.getElementById(id).classList.add("active")
}

const hoy = new Date().toISOString().split("T")[0]

const ultimoDia = localStorage.getItem("fecha")

if(ultimoDia !== hoy){
localStorage.setItem("fecha",hoy)
localStorage.setItem("consumidas",0)
}

let consumidas = localStorage.getItem("consumidas")
? parseInt(localStorage.getItem("consumidas"))
: 0

let gastadas = 2200

let historial = localStorage.getItem("historial")
? JSON.parse(localStorage.getItem("historial"))
: {}

/* ===============================
BALANCE
=============================== */

function calcularBalance(){

const balance = consumidas - gastadas

document.querySelector("#hoy p:nth-child(2)").innerText =
`🔥 Consumidas: ${consumidas} kcal`

document.querySelector("#hoy p:nth-child(3)").innerText =
`🏃 Gastadas: ${gastadas} kcal`

document.querySelector("#hoy p:nth-child(4)").innerText =
`⚖️ Balance: ${balance} kcal`

localStorage.setItem("consumidas",consumidas)

historial[hoy] = {
consumidas: consumidas,
gastadas: gastadas,
balance: balance
}

localStorage.setItem("historial",JSON.stringify(historial))

mostrarRegistro()
dibujarGrafico()
mostrarHistorial()

}

/* ===============================
REGISTRO COMIDAS
=============================== */

function guardarComida(comida,calorias){

let registro = localStorage.getItem("registroComidas")
? JSON.parse(localStorage.getItem("registroComidas"))
: {}

if(!registro[hoy]){
registro[hoy] = []
}

registro[hoy].push({comida,calorias})

localStorage.setItem("registroComidas",JSON.stringify(registro))
}

/* ===============================
MOSTRAR REGISTRO
=============================== */

function mostrarRegistro(){

const registro = JSON.parse(localStorage.getItem("registroComidas")) || {}

const comidasHoy = registro[hoy] || []

const contenedor = document.getElementById("registro")

if(!contenedor) return

contenedor.innerHTML=""

comidasHoy.forEach(item=>{
const div = document.createElement("div")
div.innerText = `${item.comida} — ${item.calorias} kcal`
contenedor.appendChild(div)
})

}

/* ===============================
GRAFICO
=============================== */

function dibujarGrafico(){

const grafico = document.getElementById("grafico")
if(!grafico) return

grafico.innerHTML=""

let dias = Object.keys(historial).slice(-7)

dias.forEach(dia=>{

const valor = historial[dia]?.balance || 0

const barra = document.createElement("div")

barra.style.height = Math.min(Math.abs(valor)/5,180)+"px"

barra.style.background =
valor<0 ? "#2ecc71"
: valor<200 ? "#f1c40f"
: "#e74c3c"

barra.innerText = valor

grafico.appendChild(barra)

})

}

/* ===============================
HISTORIAL
=============================== */

function mostrarHistorial(){

const contenedor = document.getElementById("historialDias")
if(!contenedor) return

contenedor.innerHTML=""

Object.keys(historial).reverse().forEach(dia=>{

const d = historial[dia]

const div = document.createElement("div")

div.innerHTML = `
<b>${dia}</b><br>
🔥 Consumidas: ${d.consumidas}<br>
🏃 Gastadas: ${d.gastadas}<br>
⚖️ Balance: ${d.balance}<br>
<hr>
`

contenedor.appendChild(div)

})

}

/* ===============================
CAMARA + IA
=============================== */

function abrirCamara(){
document.getElementById("cameraInput").click()
}

document.addEventListener("DOMContentLoaded",()=>{

const input = document.getElementById("cameraInput")

input.addEventListener("change", async function(e){

const archivo = e.target.files[0]
if(!archivo) return

const reader = new FileReader()

reader.onload = async function(){

try{

const res = await fetch("https://calorias-foto.ariel-cozzolino.workers.dev/",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({image:reader.result})
})

const data = await res.json()

const calorias = data.calorias || 650
const comida = data.comida || "Comida"

if(confirm(`📸 ${comida}\n🔥 ${calorias} kcal\n¿Agregar?`)){

consumidas += calorias
guardarComida(comida,calorias)
calcularBalance()

}

}catch{
alert("Error IA")
}

}

reader.readAsDataURL(archivo)

e.target.value=""

})

})

/* ===============================
APPLE HEALTH
=============================== */
async function cargarCaloriasAppleHealth(){

try{

const res = await fetch("https://docs.google.com/spreadsheets/d/1g8SMVE3-wGiHhxG3zsgoaA8HiGup0mrL8jiCybnEx4A/gviz/tq?tqx=out:json")

const text = await res.text()

const json = JSON.parse(text.substr(47).slice(0,-2))

const rows = json.table.rows

let actividad = 0

const hoyObj = new Date()
const dia = hoyObj.getDate()
const mes = hoyObj.getMonth() + 1
const anio = hoyObj.getFullYear()

rows.forEach(r=>{

const fecha = r.c[1]?.v
const cal = r.c[3]?.v

if(!fecha || !cal) return

const fechaObj = new Date(fecha)

const d = fechaObj.getDate()
const m = fechaObj.getMonth() + 1
const a = fechaObj.getFullYear()

if(d === dia && m === mes && a === anio){
actividad = cal
}

})

gastadas = 1800 + actividad

calcularBalance()

}catch(e){
console.log("Error leyendo Sheet")
}

}

/* ===============================
INICIO
=============================== */

cargarCaloriasAppleHealth()
calcularBalance()
mostrarRegistro()
dibujarGrafico()
mostrarHistorial()
setInterval(cargarCaloriasAppleHealth,300000)
