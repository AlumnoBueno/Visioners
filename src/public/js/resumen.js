document.body.onload = function() {
    const queryString = window.location.search;

// Crear un objeto a partir de la cadena de consulta
const params = new URLSearchParams(queryString);

// Ejemplo: Obtener el valor del parámetro "parametro1"
const valorParametro1 = params.get('butacas')
const butacasArray = valorParametro1.split(',').map(butaca => parseInt(butaca.trim(), 10));
let ultimoValorEliminado = butacasArray.pop();
console.log(butacasArray);
  }