error = true;


    const formulario = document.getElementById('signup-form');
    const botonEnvio = formulario.querySelector('input[type="submit"]');

    const campoNombre = document.querySelector("[name=nombre]");
    const campoApellidos = document.querySelector("[name=apellidos]");
    const campoTelefono = document.querySelector("[name=telefono]");
    const campoEmail = document.querySelector("[name=email]");
    const campoPassword = document.querySelector("[name=password]");


    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/;
    const regexApellidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    const regexTelefono = /^(\+34|0034|34)?[6-9]\d{8}$/;
    const regexEmail = /[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}/;
    const regexPassword = /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-])(?=.*[A-Z])(?=.*[0-9]).{8,15}$/;

    function validarNombre(message, e){
      const field = e.target;
      const fieldValue = e.target.value;

     

      if (fieldValue.trim().length === 0 || !regexNombre.test(fieldValue)) {
        field.classList.add("invalid")
        field.nextElementSibling.classList.add("error")
        field.nextElementSibling.innerText = message;
        error = false;
      } else {
        field.classList.remove("invalid")
        field.nextElementSibling.classList.remove("error")
        field.nextElementSibling.innerText = "";
        error = true;
      }
    }

    function validarApellido(message, e){
      const field = e.target;
      const fieldValue = e.target.value;

      if (fieldValue.trim().length === 0 || !regexApellidos.test(fieldValue)) {
        field.classList.add("invalid")
        field.nextElementSibling.classList.add("error")
        field.nextElementSibling.innerText = message;
        error = true;
      } else {
        field.classList.remove("invalid")
        field.nextElementSibling.classList.remove("error")
        field.nextElementSibling.innerText = "";
        error = false;
      }
    }


    function validarTelefono(message, e){
      const field = e.target;
      const fieldValue = e.target.value;

      if (fieldValue.trim().length === 0 || !regexTelefono.test(fieldValue)) {
        field.classList.add("invalid")
        field.nextElementSibling.classList.add("error")
        field.nextElementSibling.innerText = message;
        error = true;
      } else {
        field.classList.remove("invalid")
        field.nextElementSibling.classList.remove("error")
        field.nextElementSibling.innerText = "";
        error = false;
      }
    }

    function validarEmail(message, e){
      const field = e.target;
      const fieldValue = e.target.value;
    
        

      if (fieldValue.trim().length === 0 || !regexEmail.test(fieldValue)) {
        field.classList.add("invalid")
        field.nextElementSibling.classList.add("error")
        field.nextElementSibling.innerText = message;
        error = false;
      } else {
        field.classList.remove("invalid")
        field.nextElementSibling.classList.remove("error")
        field.nextElementSibling.innerText = "";
        error = true;
      }
    }

    function validarPassword(message, e){
      const field = e.target;
      const fieldValue = e.target.value;

        
      if (fieldValue.trim().length === 0 || !regexPassword.test(fieldValue) ) {
        field.classList.add("invalid")
        field.nextElementSibling.classList.add("error")
        field.nextElementSibling.innerText = message;
        error = true;
      }
       else {
        field.classList.remove("invalid")
        field.nextElementSibling.classList.remove("error")
        field.nextElementSibling.innerText = "";
        error = false;
      }
    }
 
      function ver(){
         const formulario = document.getElementById('signup-form');
         const inputs = formulario.querySelectorAll('input');

        let inputsVacios = false;

         inputs.forEach(function(input) {
        const valorInput = input.value.trim();
      
        if (valorInput === '') {
          inputsVacios = true;
          return;
        }
        });

        if(inputsVacios ||  !regexNombre.test(campoNombre.value) || !regexApellidos.test(campoApellidos.value) || !regexTelefono.test(campoTelefono.value) || !regexEmail.test(campoEmail.value) || !regexPassword.test(campoPassword.value)){
           alert("Revise los datos")
            event.preventDefault();
        }else{
          const email = document.getElementById('signup-email').value;
          const nombre = campoNombre.value;
          const apellidos = campoApellidos.value;
          const telefono = campoTelefono.value;
          const password = campoPassword.value;
          const data = {email,nombre,apellidos,telefono,password};
          console.log(data)
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/login', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 201) {
                  const response = JSON.parse(xhr.responseText);
                  // Credenciales inválidas
                  var contenedor = document.getElementById("mensajeError2");
                  contenedor.innerText = response.message
              }else{
                  
                  var modal = document.getElementById("modal2");
                  var overlay = document.getElementById("overlay");
                  modal.style.display = "block";
                  overlay.style.display = "block";
  
                  
                  setTimeout(function() {
                      modal.style.display = "none";
                      overlay.style.display = "none";
                      window.location.href = '/';
                  }, 3000);
              }
            }
          };

          xhr.send(JSON.stringify(data));
        }
        
      }






    campoNombre.addEventListener("blur", (e) =>  validarNombre("Introduce un nombre correcto", e))
    campoApellidos.addEventListener("blur", (e) => validarApellido("Introduce un apellido correcto", e))
    campoTelefono.addEventListener("blur", (e) => validarTelefono("Introduce un telefono correcto", e))
    campoEmail.addEventListener("blur", (e) => validarEmail("Introduce un email correcto", e))
    campoPassword.addEventListener("blur", (e) => validarPassword("De 8 a 15 digitos con al menos un símbolo,mayúscula y número", e))
    document.getElementById("enviarSignup").addEventListener("click",ver);
 
   
     
     