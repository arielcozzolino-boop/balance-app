/* ===============================
NAVEGACION
=============================== */

function showScreen(id) {

document.querySelectorAll(".screen").forEach(s=>{
s.classList.remove("active")
})

document.getElementById(id).classList.add("active")

}

/* ===============================
FECHA
=============================== */

const hoy = new Date().toISOString().split("T")[0]

const ultimoDia = localStorage.getItem("fecha")

if(ultimoDia !== hoy){

localStorage.setItem("fecha",hoy)
localStorage.setItem("consumidas",0)

}

/* ===============================
DATOS
=============================== */

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

historial[hoy] = balance

localStorage.setItem("historial",JSON.stringify(historial))

mostrarRegistro()

dibujarGrafico()

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

registro[hoy].push({

comida: comida,
calorias: calorias

})

localStorage.setItem("registroComidas",JSON.stringify(registro))

}

function mostrarRegistro(){

const registro = JSON.parse(localStorage.getItem("registroComidas")) || {}

const comidasHoy = registro[hoy] || []

const contenedor = document.getElementById("registro")

if(!contenedor) return

contenedor.innerHTML = ""

comidasHoy.forEach(item=>{

const div = document.createElement("div")

div.innerText = `${item.comida} — ${item.calorias} kcal`

contenedor.appendChild(div)

})

}

/* ===============================
GRAFICO SEMANAL
=============================== */

function dibujarGrafico(){

const grafico = document.getElementById("grafico")

if(!grafico) return

grafico.innerHTML=""

let dias = Object.keys(historial).slice(-7)

if(dias.length===0){

dias=[hoy]

historial[hoy]=consumidas-gastadas

}

dias.forEach(dia=>{

const valor = historial[dia]

const barra = document.createElement("div")

barra.className="barra"

const altura = Math.max(Math.abs(valor)/5,40)

barra.style.height=Math.min(altura,180)+"px"

barra.style.background =
valor<0 ? "#2ecc71"
: valor<200 ? "#f1c40f"
: "#e74c3c"

barra.innerText = valor

grafico.appendChild(barra)

})

}

/* ===============================
CAMARA
=============================== */

function abrirCamara(){

document.getElementById("cameraInput").click()

}

document.addEventListener("DOMContentLoaded",()=>{

const input = document.getElementById("cameraInput")

if(!input) return

input.addEventListener("change", async function(event){

const archivo = event.target.files[0]

if(!archivo) return

const reader = new FileReader()

reader.onload = async function(){

const base64 = reader.result

try{

const respuesta = await fetch(
"https://calorias-foto.ariel-cozzolino.workers.dev/",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
image:base64
})
}
)

const data = await respuesta.json()

const calorias = data.calorias || 650

const comida = data.comida || "Comida"

const confirmar = confirm(

`📸 ${comida}

🔥 ${calorias} kcal

¿Agregar al día de hoy?`

)

if(confirmar){

consumidas += calorias

guardarComida(comida,calorias)

calcularBalance()

}

}catch{

alert("Error analizando la imagen")

}

}

reader.readAsDataURL(archivo)

event.target.value=""

})

})

/* ===============================
INICIO
=============================== */

calcularBalance()

mostrarRegistro()

dibujarGrafico()
