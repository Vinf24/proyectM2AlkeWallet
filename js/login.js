$(document).ready(function () {
    const $loginForm = $("#loginForm"); /* Formulario de inicio de sesión */
    const $emailLogin = $("#emailLogin"); /* Input para ingresar email */
    const $claveLogin = $("#claveLogin"); /* Input para ingresar contraseña */
    const $dlgLogin = $("#dlgLogin"); /* Alerta que solicita datos válidos */
    const $dlgLoginData = $("#dlgLoginData"); /* Contenido de la alerta */
    const $goLogin = $("#goLogin"); /* Botón "Entendido" de la alerta */
    const $chkRemember = $("#chkRemember"); /* Checkbox para indicar "Recordarme" */

    function validarRegistro(datos, usuarios) { /* Si hay problemas, entrega mensaje */
        const { email, clave } = datos;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) return "Ingrese un correo electrónico";

        if (!clave) return "Ingrese una contraseña";

        if (!emailRegex.test(email)) return "Ingrese un correo electrónico válido";

        return null;
    }

    if ($loginForm.length) {

        function mostrarError(mensaje) { /* Carga el mensaje de error a la alerta y la muestra por 3 segundos */
            $dlgLoginData.text(mensaje);
            showAlert($dlgLogin, 3000);
        };

        $loginForm.on("submit", function (e) { /* Detecta el submit del formulario */
            e.preventDefault();

            const email = $emailLogin.val().trim(); /* Carga los valores en los inputs */
            const clave = $claveLogin.val().trim();
            recordar = $chkRemember.is(':checked'); /* Verifica si la checkbox está marcada */

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []; /* Obtiene los usuarios */

            const error = validarRegistro({ /* Valida los datos */
                email,
                clave
            }, usuarios);

            if (error) { /* Si hay mensaje de error */
                mostrarError(error); /* Muestra la alerta */
                return;
            }

            const usuario = usuarios.find(u => u.email === email && u.clave === clave); /* Busca en la lista de usuarios, el usuario cuyo email y clave coincidan con lo entregado en los inputs */

            if (usuario) { /* Si lo encuentra */

                sessionStorage.setItem("usuarioActivo", usuario.id); /* Lo declara como usuario activo */


                if (recordar) { /* Si la checkbox está marcada */
                    localStorage.setItem("usuarioGuardado", usuario.id); /* Lo guarda en el localStorage */
                } else {
                    localStorage.removeItem("usuarioGuardado"); /* Si no se asegura de guardar ningún usuario */
                }

                const $leyenda = $("<div>") /* Crea un elemento div */
                    .text("Iniciando Sesión...")
                    .addClass("leyenda-sesion")
                    .css("z-index", "9999");

                $("body").append($leyenda); /* Añade el elemento recien creaco al body de la página */


                // Forzar reflow para asegurar que la animación se aplique
                void $leyenda[0].offsetWidth;

                // Aplicar animación de entrada
                $leyenda.addClass("leyenda-entering");

                // Después de la entrada, esperar 1 segundo en el centro y luego salir
                $leyenda.one("animationend", function () {
                    $leyenda.removeClass("leyenda-entering");

                    setTimeout(function () {
                        $leyenda.addClass("leyenda-exiting");

                        $leyenda.one("animationend", function () {
                            window.location.href = "../pages/menu.html";
                        });
                    }, 1000); // 1 segundo extra en el centro
                });

            } else { /* Si no encuentra un usuario en la lista */
                $dlgLoginData.text("Datos Incorrectos:") /* Escribe contenido en la alerta */
                showAlert($dlgLogin, 3000); /* La despliega por 3 segundos */
                $emailLogin.val(""); /* Limpia los inputs */
                $claveLogin.val("");
            }
        });
    }

    $goLogin.on("click", function () { /* Detecta el click del botón "Entendido" en las alertas y las cierra */
        hideAlert($dlgLogin);
    });

});