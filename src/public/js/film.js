
                        
        document.body.onload = function() {
            let horarios = document.getElementById("horario");

   
            let listaHorario = document.getElementById("horario").innerHTML.split(",")

           listaHorario.forEach(horario =>{
                let botonHorario = document.createElement("button");
                botonHorario.innerHTML=horario;
                botonHorario.className="btn btn-secondary"
                botonHorario.value = horario
                document.getElementById("horario").appendChild(botonHorario)
            })

            let horarioSpan = document.getElementById('horario');
            let botones = horarioSpan.querySelectorAll('button');
            let textoSpan = horarioSpan.childNodes[0];
            horarioSpan.removeChild(textoSpan); 
            
document.getElementById("dateSelector").addEventListener('change',() => {buscarPorFecha()})
            desplegableFechas() 
            eliminarBoton()

}

function desplegableFechas() {
    let fechaActual = new Date();
  
    // Mostrar la fecha actual
    let formatoFechaActual = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' });
    console.log('Fecha actual:', formatoFechaActual.format(fechaActual));
  
    let selectFecha = document.getElementById("dateSelector");
    selectFecha.innerHTML = ''; // Limpiar el select antes de agregar nuevas fechas
  
    // Iterar desde hoy hasta 2 días más adelante
    for (let i = 0; i <= 2; i++) {
      let fechaFutura = new Date(fechaActual);
      fechaFutura.setDate(fechaFutura.getDate() + i);
  
      // Formatear la fecha
      let formatoFecha = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' });
      let fechaFormateada = formatoFecha.format(fechaFutura);
  
      let opcionFecha = document.createElement("option");
      opcionFecha.innerHTML = fechaFormateada;
      opcionFecha.value = fechaFutura;
      selectFecha.appendChild(opcionFecha);
    }
  
    // Al cargar la página, mostrar automáticamente los horarios del día actual
    buscarPorFecha();
  }
  
  function eliminarBoton() {
    let botones = document.querySelectorAll('.btn');
  
    // Obtener el último botón con la clase 'btn'
    let ultimoBoton = botones[botones.length - 1];
  
    // Eliminar el último botón seleccionado
    ultimoBoton.remove();
  }

function buscarPorFecha(){
    const fechaSeleccionada = document.getElementById("dateSelector").value;

    const fecha = new Date(fechaSeleccionada);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
  
    const fechaFinal =  `${year}-${month}-${day}`;




    

    const peliculaIdElement = document.getElementById('nombre_pelicula');
    const idPelicula = peliculaIdElement.dataset.id;
    console.log(idPelicula)
         

     fetch(`/buscarPorFecha/${fechaFinal}/${idPelicula}`)
        .then(response => response.json())
         .then(data => {
          // Mostrar los resultados en el div 'resultados'
          const resultadosDiv = document.getElementById('horario');
          // Actualizar los datos en la página sin recargar

          resultadosDiv.innerHTML="";

        data.forEach(elemento =>{
            
                let enlace = document.createElement("a");
                enlace.href = `../entradas/${elemento.id_sala}`
                 document.getElementById("horario").appendChild(enlace)
                let botonHorario = document.createElement("button");
                botonHorario.type="submit"
                botonHorario.innerHTML=elemento.hora;
                botonHorario.className="btn btn-secondary"
                botonHorario.value = elemento.hora
                enlace.appendChild(botonHorario)          
        })

        })
        .catch(error => {
          console.error('Error al buscar por fecha:', error);
        });
}


