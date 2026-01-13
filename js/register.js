const $registerForm = $("#registerForm"); /* Formulario de registro */
const $registroModal = $("#registroModal"); /* Modal que contiene el formulario de registro */

function validarRegistro(datos, usuarios) { /* Función que recibe datos y array de usuarios, evalua y envia el futuro contenido de la alerta */
    const { nombre, apellido, email, clave, claveRepeat, alias } = datos;
    const claveOk = clave === claveRepeat; /* Verifica que la alerta y su confirmación son iguales */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; /* Verifica el formato del email */

    if (!nombre || !apellido) return "Ingrese nombre y apellido";

    if (!alias) return "Ingrese un alias";

    if (!email) return "Ingrese un correo electrónico";

    if (!clave) return "Ingrese una contraseña";

    if (!emailRegex.test(email)) return "Ingrese un correo electrónico válido";

    const existe = usuarios.some(u => u.email === email);
    if (existe) return "Correo ya existente";

    if (!claveOk) return "Confirme la contraseña";

    return null;
}

function generarIdUnico(usuarios) { /* Crea un id, asegurando que sea unico (1 + que el id más grande detectado) antes de asignarlo */
    if (!usuarios.length) return 1;
    return Math.max(...usuarios.map(u => u.id || 0)) + 1;
}

function generarNumeroCuentaUnico(usuarios) {
    let numero;
    let existe;

    do {
        numero = Math.floor(10000000 + Math.random() * 90000000); /* Genera un numero entre 10000000 y 90000000 */

        existe = usuarios.some(u => u.numeroCuentaAlke === numero); /* Verifica si algún u dentro de usuarios posee un numeroCuentaAlke igual a numero */
    } while (existe); /* Si se cumple la condición, vuelve a generar un número */

    return numero;
}

$(document).ready(function () {

    const $dlgRegister = $("#dlgRegister"); /* Alerta estandar del formulario de registro */
    const $dlgRegisterData = $("#dlgRegisterData"); /* Contenido de la alerta estandar */
    const $goRegister = $("#goRegister"); /* Botón "Entendido" que cierra la alerta estandar */

    function mostrarError(mensaje) { /* Declara función, recibe mensaje */
        showAlert($dlgRegister, 3000); /* Inserta mensaje en la alerta */
        $dlgRegisterData.text(mensaje); /* Despliega la alerta por 3 segundos */
    };

    if ($registerForm.length) { /* Si encuentra elemento */
        $registerForm.on("submit", function (e) { /* Detecta evento submit */
            e.preventDefault(); /* Previene el submit */

            const nombre = $("#nombre").val().trim();
            const apellido = $("#apellido").val().trim();
            const email = $("#regEmail").val().trim();
            const clave = $("#regClave").val().trim();
            const claveRepeat = $("#regClaveRepeat").val().trim();
            const alias = $("#alias").val().trim();

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || []; /* Carga usuarios como array */

            const error = validarRegistro({ /* Carga los datos en la función de validación */
                nombre,
                apellido,
                email,
                clave,
                claveRepeat,
                alias
            }, usuarios); /* Si no hay problema retorna "null" */

            if (error) { /* Si hay error es porque retornó un mensaje */
                mostrarError(error); /* Que se carga en la función que muestra el error */
                return;
            }

            const id = generarIdUnico(usuarios); /* Declara variable que recibe id unico */

            const numeroCuentaAlke = generarNumeroCuentaUnico(usuarios); /* Declara variable que recibe numero de cuenta unico */

            usuarios.push({ /* Carga los datos al array de usuarios */
                id,
                numeroCuentaAlke: numeroCuentaAlke,
                nombre,
                apellido,
                email,
                clave,
                alias
            });

            localStorage.setItem("usuarios", JSON.stringify(usuarios)); /* Actualiza el JSON en localStorage utilizando el array */

            this.reset(); /* Limpia el formulario, vaciando los inputs */

            const modal = bootstrap.Modal.getInstance($("#registroModal")[0]); /* Detecta el modal */
            modal.hide(); /* Lo oculta */
        });
    }

    $goRegister.on("click", function () { /* Detecta el click en el botón "Entendido" */
        hideAlert($dlgRegister); /* Cierra la alerta */
    });

});