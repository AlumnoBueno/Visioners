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
    const regexTelefono = /(\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}/;
    const regexEmail = /[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}/;
    const regexPassword = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

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

        
      if (fieldValue.trim().length === 0) {
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

        if(inputsVacios){
           alert("Rellene todos los campos")
            event.preventDefault();
        }
       else if(error){
          console.log("fddf")
          event.preventDefault();
        }
      }


    function correo(){
      var email = campoEmail.value
      console.log(email)
      fetch(`/comprobar?email=${email}`, { method: 'GET' })
       .then(response => response.json())
       .then(data => {
        if(data.error){
          event.preventDefault()
        }
       })
    }



    campoNombre.addEventListener("blur", (e) =>  validarNombre("Introduce un nombre correcto", e))
    campoApellidos.addEventListener("blur", (e) => validarApellido("Introduce un apellido correcto", e))
    campoTelefono.addEventListener("blur", (e) => validarTelefono("Introduce un telefono correcto", e))
    campoEmail.addEventListener("blur", (e) => validarEmail("Introduce un email correcto", e))
    campoPassword.addEventListener("blur", (e) => validarPassword("De 8 a 15 digitos con al menos un simbolo,mayúscula y número", e))
    document.getElementById("enviarSignup").addEventListener("click",ver);
 
   