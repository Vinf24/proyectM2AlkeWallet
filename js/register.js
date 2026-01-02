const $registerForm = $("#registerForm");
const $registroModal = $("#registroModal");

$(document).ready(function () {

    const $dlgRegister = $("#dlgRegister");
    const $dlgRegisterData = $("#dlgRegisterData");
    const $goRegister = $("#goRegister");

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

            const existe = usuarios.some(u => u.email === email);
            const claveOk = clave === claveRepeat;

            if (existe) {
                $dlgRegisterData.text("Correo ya existente");
                $dlgRegister.removeClass("d-none");
                return;
            }

            if (!claveOk) {
                $dlgRegisterData.text("Confirme la contraseña");
                $dlgRegister.removeClass("d-none");
                return;
            }

            if (!this.checkValidity()) {
                this.reportValidity();
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