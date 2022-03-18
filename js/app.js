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

    eliminarTrabajo(id){
        this.trabajos = this.trabajos.filter( (trabajo) => trabajo.id !== id)
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

        this.limpiarHTML();
        // Leer el contenido de la DB

        const objectStore = DB.transaction("trabajos").objectStore("trabajos");
        objectStore.openCursor().onsuccess = function(e){
            const cursor = e.target.result;
            
            if(cursor){
                const {producto,costoDeVenta,costoDeProduccion,contactoCliente,descripcion,id} = cursor.value;

                const divTrabajo = document.createElement("div");
                divTrabajo.classList.add("trabajo");
                divTrabajo.dataset.id = id;

                divTrabajo.innerHTML = `
                    <div class="row" id="contenedor-trabajo">
                        <div style="width: 40%;">
                            <p class="t-bold">Producto</p>
                            <p class="fondo-gris">${producto}</p>
                        </div>
                        <div style="width: 20%;">
                            <p class="t-bold">Costo de venta</p>
                            <p class="fondo-gris">$${costoDeVenta}</p>
                        </div>
                        <div style="width: 20%;">
                            <p class="t-bold">Costo de produccion</p>
                            <p class="fondo-gris">$${costoDeProduccion}</p>
                        </div>
                        <div style="width: 20%;">
                        <p class="t-bold">Contacto de cliente</p>
                        <p class="fondo-gris">${contactoCliente}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div style="width: 100%;">
                            <p class="t-bold">Descripcion</p>
                            <p class="fondo-gris">
                            ${descripcion}
                            </p>
                        </div>
                    </div>
                `
                const btnEliminar = document.createElement("button");
                btnEliminar.onclick = function (){
                    eliminarTrabajo(id);
                }
                btnEliminar.classList.add("cancel-icon");
                btnEliminar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`

                
                contenedorTrabajos.appendChild(divTrabajo);
                divTrabajo.appendChild(btnEliminar);

                // Imrprime el siguiente elemento 

                cursor.continue();
            }
        }
    }

    limpiarHTML(){
        while(contenedorTrabajos.firstChild){
            contenedorTrabajos.removeChild(contenedorTrabajos.firstChild);
        }
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

    ui.imprimirTrabajos();
    reiniciarObjeto();
}

function reiniciarObjeto(){
    trabajo.producto = "",
    trabajo.costoDeVenta = "",
    trabajo.costoDeProduccion = "",
    trabajo.contactoCliente = "",
    trabajo.descripcion = ""
}

function eliminarTrabajo(id){
    
    const transaction = DB.transaction(["trabajos"], "readwrite")
    const objectStore = transaction.objectStore("trabajos");

    objectStore.delete(id);

    transaction.oncomplete = () => {
        console.log("Trabajo eliminado correctamente");
        ui.imprimirTrabajos();
    }
    transaction.onerror = () => {
        console.log("Hubo un error en el transaction");
    }

    
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
        ui.imprimirTrabajos();
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