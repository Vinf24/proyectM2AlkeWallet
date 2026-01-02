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

$(document).ready(function () {

    const $dlgRegister = $("#dlgRegister");
    const $dlgRegisterData = $("#dlgRegisterData");
    const $goRegister = $("#goRegister");

    function mostrarError(mensaje) {
        $dlgRegisterData.text(mensaje);
        $dlgRegister.removeClass("d-none");
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

            usuarios.push({
                nombre,
                apellido,
                email,
                clave,
                alias
            });

            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            this.reset();

            cargarUsuarios();

            const modal = bootstrap.Modal.getInstance($("#registroModal")[0]);
            modal.hide();
        });
    }

    $goRegister.on("click", function () {
        $dlgRegister.addClass("d-none");
    });

});

