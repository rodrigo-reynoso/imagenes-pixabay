const formulario = document.querySelector('#formulario'),
      resultado = document.querySelector('#resultado'),
      paginadorDiv = document.querySelector('#paginacion')

const registrosporPagina = 40;
let totalPaginas;// para que este disponible en todas las function
let iterador;
let paginaActual =1; // siempre va empezar lo que se ve primero

window.onload = ()=>{
    formulario.addEventListener('submit',validarBusqueda);
};

function validarBusqueda(e){
    e.preventDefault();
    const busqueda = document.querySelector('#termino').value;
    if(busqueda===''){
        mostrarAlerta('Todos los campos son obligatorios');
        return;
    }
    busquedaImagenes();
}

function busquedaImagenes(){
    while(resultado.firstChild){
        resultado.removeChild(resultado.firstChild)
    };
    const termino = document.querySelector('#termino').value;
    const keyAPI = '24140356-2a19b7a224016ca373d3a4f5a',
          url = `https://pixabay.com/api/?key=${keyAPI}&q=${termino}&per_page=${registrosporPagina}&page=${paginaActual}`;
    spinner();
    fetch(url)
        .then(respuesta=>respuesta.json())
        .then(resultado =>{
            totalPaginas = calcularPaginas(resultado.totalHits);
            mostrarImagenes(resultado.hits)})
}
// Creando paginador, con generador es ideal sirve para detectar cuando llega a la ultima pagina automaticamente. Va registrar la cantidad de elementos de acuerdo a las paginas
function *crearPaginador(total){
    for(let i =1;i<=total;i++){
        yield i;

    }
}
function calcularPaginas(total){
    // Math.ceil siempre redondea para arriba, en este caso sirve par no dejar colgada ninguna imagen
    return Math.ceil(total/registrosporPagina);
}
function spinner(){
    const spinner = document.createElement('div');
    spinner.classList.add('sk-fading-circle')
    spinner.innerHTML =`
        <div class="sk-circle1 sk-circle"></div>
        <div class="sk-circle2 sk-circle"></div>
        <div class="sk-circle3 sk-circle"></div>
        <div class="sk-circle4 sk-circle"></div>
        <div class="sk-circle5 sk-circle"></div>
        <div class="sk-circle6 sk-circle"></div>
        <div class="sk-circle7 sk-circle"></div>
        <div class="sk-circle8 sk-circle"></div>
        <div class="sk-circle9 sk-circle"></div>
        <div class="sk-circle10 sk-circle"></div>
        <div class="sk-circle11 sk-circle"></div>
        <div class="sk-circle12 sk-circle"></div>
    `;
    resultado.appendChild(spinner);
}
function mostrarImagenes(imagenes){
    while(resultado.firstChild){
        resultado.removeChild(resultado.firstChild);
    }
    if(imagenes.length===0){
        mostrarAlerta('Termino no encontrado, intente con otra busqueda')
    } else {
        imagenes.forEach(imagen=>{
            const {previewURL,views,likes,largeImageURL} = imagen;
            // En el ancla se le pone un target _blank para que vaya a otra pestaña y como es muy vulnerable se le pone rel noopenner noreferrer asi es mas seguro, es decir, cuando pongo un target pongo un rel --PARA QUE NO HAYA PROBLEMAS DE SEGURIDAD--
            // IMPORTANTE-- los enlaces o anclas son de tipo inline
            resultado.innerHTML +=`
            <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
                <div class="bg-white">
                    <img class="w-full" src="${previewURL}">
                    <div class="p-4">
                        <p class="font-bold">${views} <span class="font-light">Vista</span></p>
                        <p class="font-bold">${likes} <span class="font-light">Me gusta</span></p>
                        <a 
                            class="block bg-blue-600 text-white hover:bg-blue-400 p-2 mt-2 rounded uppercase text-center w-full"
                            href="${largeImageURL}" target="_blank" rel="noopenner noreferrer "
                        > 
                            Ver Imagen
                        </a>
                    </div>
                </div>
            </div>
            `
        })  
    }
    // Limpiar paginador previo
    while(paginadorDiv.firstChild){
        paginadorDiv.removeChild(paginadorDiv.firstChild);
    }
    // Inicializar paginador ---Generador hace lo que tiene que hacer y despues se duerme
    // Generador se despierta con .next(), y luego se duerme
    imprimirPaginador()
    
}
function imprimirPaginador(){
    iterador = crearPaginador(totalPaginas);
    // console.log(iterador.next());
    // Se va estar ejecutando todo el tiempo el while --IMPORTANTE -- ASI FUNCIONA LA LOGICA DEL GENERADOR
    while(true){
        const {done,value} = iterador.next();// la manera que se despierta .done si termino, y .value el valor que produce el yield.
        // Para frenarlo si el generador llega al final arroja en iterador.next().done false en ese momento no se ejecutan las lineas posteriores.
        // --MUY IMPORTANTE -- Asi se ve como funciono el generador, se ejectuta todo el tiempo con el while(true), se frena con el .done cuando tira false, sino se ejecutan las lineas posteriores
        if(done) return;

        // Caso contrario genera un boton por cada elemento que yield(produce) el generador
        const boton = document.createElement('a');
        boton.href ='#'; // no nos lleva a ningun lado, solo a una pagina a la otra
        boton.dataset.pagina = value;
        boton.textContent = value;
        boton.classList.add('siguiente','rounded','bg-yellow-400','px-4','py-2','mr-2','uppercase','font-bold','mb-10');
        boton.onclick =()=>{
            paginaActual = value; // este value es de iterador.next()
            busquedaImagenes();
        }
        paginadorDiv.appendChild(boton)
    }
}
function mostrarAlerta(mensaje){
    // Esta variable no interviene con la del mismo nombre debido al scope(alcance), es donde va a vivir --IMPORTANTE--
    const alerta = document.querySelector('.bg-red-300');
    if(!alerta){
        const alerta = document.createElement('p');
        alerta.classList.add('bg-red-300','text-red-700','border-red-400','rounded','mx-w-lg','mx-auto','mt-6','text-center','py-4','px-3');
        alerta.innerHTML = `
        <strong class = "font-bold">Error!</strong>
        <span class = "block sm:inline">${mensaje}</span>
        `
        formulario.appendChild(alerta);
        setTimeout(()=>{
            alerta.remove();
        },3000)    
    }
}