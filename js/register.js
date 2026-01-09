const $registerForm = $("#registerForm");
const $registroModal = $("#registroModal");

function validarRegistro(datos, usuarios) {
    const { nombre, apellido, email, clave, claveRepeat, alias } = datos;
    const claveOk = clave === claveRepeat;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function generarIdUnico(usuarios) {
    if (!usuarios.length) return 1;
    return Math.max(...usuarios.map(u => u.id || 0)) + 1;
}

function generarNumeroCuentaUnico(usuarios) {
    let numero;
    let existe;

    do {
        numero = Math.floor(10000000 + Math.random() * 90000000);

        existe = usuarios.some(u => u.numeroCuentaAlke === numero);
    } while (existe);

    return numero;
}

$(document).ready(function () {

    const $dlgRegister = $("#dlgRegister");
    const $dlgRegisterData = $("#dlgRegisterData");
    const $goRegister = $("#goRegister");

    function mostrarError(mensaje) {
        $dlgRegisterData.text(mensaje);
        showAlert($dlgRegister, 3000);
    };

    if ($registerForm.length) {
        $registerForm.on("submit", function (e) {
            e.preventDefault();

            const nombre = $("#nombre").val().trim();
            const apellido = $("#apellido").val().trim();
            const email = $("#regEmail").val().trim();
            const clave = $("#regClave").val().trim();
            const claveRepeat = $("#regClaveRepeat").val().trim();
            const alias = $("#alias").val().trim();

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

            const error = validarRegistro({
                nombre,
                apellido,
                email,
                clave,
                claveRepeat,
                alias
            }, usuarios);

            if (error) {
                mostrarError(error);
                return;
            }

            const id = generarIdUnico(usuarios);

            const numeroCuentaAlke = generarNumeroCuentaUnico(usuarios);

            usuarios.push({
                id,
                numeroCuentaAlke: numeroCuentaAlke,
                nombre,
                apellido,
                email,
                clave,
                alias
            });

            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            this.reset();

            const modal = bootstrap.Modal.getInstance($("#registroModal")[0]);
            modal.hide();
        });
    }

    $goRegister.on("click", function () {
        hideAlert($dlgRegister);
    });

});