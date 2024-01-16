

function verificarCredenciales() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const data = { email, password };

    // Enviar datos al servidor usando AJAX
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/signin', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
         
            // Credenciales inválidas
            console.log(response.message);
            var contenedor = document.getElementById("mensajeError");
            contenedor.innerText = response.message
            console.log(contenedor)
        }else{
          var modal2 = document.getElementById("modalLogin");
          var overlay2 = document.getElementById("overlayLogin");
          console.log(modal2)
          console.log(overlay2)
        
          modal2.style.display = "block";
          overlay2.style.display = "block";

          // Oculta el mensaje emergente y redirige después de 3 segundos adicionales (puedes ajustar el tiempo)
          setTimeout(function() {
              modal2.style.display = "none";
              overlay2.style.display = "none";
              window.location.href = '/';
          }, 3000);
           
        }
      }
    };
    xhr.send(JSON.stringify(data));
  }