document.body.onload = function() {
  convertirFecha();
}

function convertirFecha() {
  var fechaTexto = document.getElementById("fecha").innerHTML;
    var fechaProvida = new Date(fechaTexto);

// Obtener el día y año
var dia = fechaProvida.getDate();
var anio = fechaProvida.getFullYear();

// Array con los nombres de los meses en español
var meses = [
"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Obtener el nombre del mes en español
var mesNombre = meses[fechaProvida.getMonth()];

// Formatear 
var fechaFormateada = `${dia} de ${mesNombre} de ${anio}`;

document.getElementById("fecha").innerHTML = fechaFormateada
}


async function bloquearButacas() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const butacaIds = Array.from(checkboxes).map(checkbox => checkbox.value);
   

    try {
      const response = await fetch('/bloquear-butacas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ butacaIds })
      });
    
      if (response.ok) {
        const butacas =  butacaIds
        alert('Butacas bloqueadas correctamente.');
      } else {
        alert('Error al bloquear las butacas.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error en la solicitud.');
    } 
  }

function validar() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
      alert('Por favor, selecciona al menos una opción');
      event.preventDefault()
    } else if(checkboxes.length > 5) {
      alert('No puede reservar más de 5 butacas');
      event.preventDefault()
    }else{
      document.getElementById('formulario').submit();
    }
  }
