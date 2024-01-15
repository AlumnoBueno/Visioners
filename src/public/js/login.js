

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
            window.location.href = '/';
        }
      }
    };
    xhr.send(JSON.stringify(data));
  }