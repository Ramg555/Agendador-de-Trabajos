// Variables
let DB;
const producto = document.querySelector("#producto");
const costoDeVenta = document.querySelector("#costo-de-venta");
const costoDeProduccion = document.querySelector("#costo-de-produccion");
const contactoCliente = document.querySelector("#contacto-cliente");
const descripcion = document.querySelector("#descripcion");
const formulario = document.querySelector(".formulario");

const contenedorTrabajos = document.querySelector("#trabajos")


// Event Listeners
window.onload =  ( )=> {
    eventListeners();
    crearDB();
}
function eventListeners(){
    producto.addEventListener("change", datosTrabajo);
    costoDeVenta.addEventListener("change", datosTrabajo);
    costoDeProduccion.addEventListener("change", datosTrabajo);
    contactoCliente.addEventListener("change", datosTrabajo);
    descripcion.addEventListener("change", datosTrabajo);
    formulario.addEventListener("submit", añadirTrabajo);
}




// Clases
class Trabajos {
    constructor(){
        this.trabajos = [];
    }

    agregarTrabajo(trabajo){
        this.trabajos = [...this.trabajos, trabajo];
        console.log(this.trabajos);
    }
}
class UI{
    mostrarMensaje(mensaje,tipo){
        const mensajeDiv = document.createElement("div")
        mensajeDiv.textContent = mensaje;
        mensajeDiv.classList.add('text-center', 'alert', 'd-block', 'col-12');
        if(tipo === "error"){
            mensajeDiv.classList.add("alert-danger");
        }else{
            mensajeDiv.classList.add("alert-success");

        }

        document.querySelector(".contenedor-formulario").insertBefore(mensajeDiv,formulario);

        setTimeout(() =>{
            mensajeDiv.remove();
        }, 4000)
    }

    imprimirTrabajos(){

    }
}
const trabajos = new Trabajos();
const ui = new UI();

const trabajo = {
    producto: "",
    costoDeVenta: "",
    costoDeProduccion: "",
    contactoCliente: "",
    descripcion: "",
}



// Funciones

function datosTrabajo(e){
    trabajo[e.target.name] = e.target.value;
}

function añadirTrabajo(e){
    e.preventDefault();
    const {producto,costoDeVenta,costoDeProduccion,contactoCliente,descripcion} = trabajo;

    if(producto === "" || costoDeVenta === "" || costoDeProduccion === "" || contactoCliente === "" || descripcion === ""){
        console.log("Todos los campos deben ser llenados");
        ui.mostrarMensaje("Todos los campos deben ser llenados", "error");
        return;
    }else{
        trabajo.id = Date.now();
        trabajos.agregarTrabajo({...trabajo});
        formulario.reset();

        // Insertando registro en Indexed DB

        const transaction = DB.transaction(["trabajos"], "readwrite");

        // Habilitando el object store
        const objectStore = transaction.objectStore("trabajos");  

        // Agregando objeto a la base de datos
        objectStore.add(trabajo);

        transaction.oncomplete = function (){
            console.log("Cita agregada correctamente");
            ui.mostrarMensaje("Trabajo agregado correctamente");
        }
    }

    reiniciarObjeto()
}

function reiniciarObjeto(){
    trabajo.producto = "",
    trabajo.costoDeVenta = "",
    trabajo.costoDeProduccion = "",
    trabajo.contactoCliente = "",
    trabajo.descripcion = ""
}

function crearDB(){
    const crearDB = window.indexedDB.open("trabajos", 1);

    // Si hay un error
    crearDB.onerror = function(){
        console.log("Hubo un error al crear la DB");
    }

    crearDB.onsuccess = function(){
        console.log("DB creada");
        DB = crearDB.result;
        // ui.imprimirTrabajos();
    }

    // Definir el schema

    crearDB.onupgradeneeded = function (e){
        const db = e.target.result;

        const objectStore = db.createObjectStore("trabajos",{
            keyPath: "id",
            autoIncrement: true
        })

            // Definir las columnas

    objectStore.createIndex("producto", "producto", {unique:false});
    objectStore.createIndex("costoDeVenta", "costoDeVenta", {unique:false});
    objectStore.createIndex("costoDeProduccion", "costoDeProduccion", {unique:false});
    objectStore.createIndex("contactoCliente", "contactoCliente", {unique:false});
    objectStore.createIndex("descripcion", "descripcion", {unique:false});


    }


}