document.body.onload = function() {
    const queryString = window.location.search;

const params = new URLSearchParams(queryString);

const valorParametro1 = params.get('butacas')
const butacasArray = valorParametro1.split(',').map(butaca => parseInt(butaca.trim(), 10));
let ultimoValorEliminado = butacasArray.pop();
  }