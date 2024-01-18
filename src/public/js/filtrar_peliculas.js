
function filtrarPeliculas(){

    var genero = document.getElementById("generoSelect").value;
     fetch(`/filtrar?genero=${genero}`, { method: 'GET' })
     .then(response => response.json())
     .then(data => {    
      var contenedorPeliculas = document.getElementById("contenedorPeliculas")
      contenedorPeliculas.innerHTML = "";

      data.forEach(pelicula => {
        var contenedor = document.createElement("div");
        contenedor.className = "grid-cartelera animate__bounce";
          contenedorPeliculas.appendChild(contenedor)
          var enlace = document.createElement("a");
          enlace.href=`/film/${pelicula.id}`;
          var imagen = document.createElement("img");
          imagen.src = `./img/caratulas/${pelicula.caratula}`;
          imagen.className = `peliculas animate__bounce`;
          enlace.appendChild(imagen)
          contenedor.appendChild(enlace)
      })
  })
  }  

  document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('generoSelect').addEventListener('change', filtrarPeliculas)
});