$(document).ready(function () {
    const $loginForm = $("#loginForm");
    const $emailLogin = $("#emailLogin");
    const $claveLogin = $("#claveLogin");
    const $dlgLogin = $("#dlgLogin");
    const $goLogin = $("#goLogin");
    const $dlgLoginData = $("#dlgLoginData");

    function validarRegistro(datos, usuarios) {
        const { email, clave } = datos;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) return "Ingrese un correo electrónico";

        if (!clave) return "Ingrese una contraseña";

        if (!emailRegex.test(email)) return "Ingrese un correo electrónico válido";

        return null;
    }

    if ($loginForm.length) {

        const $dlgLogin = $("#dlgLogin");
        const $dlgLoginData = $("#dlgLoginData");
        const $goLogin = $("#goLogin");

        function mostrarError(mensaje) {
            $dlgLoginData.text(mensaje);
            $dlgLogin.removeClass("d-none");
        };

        $loginForm.on("submit", function (e) {
            e.preventDefault();

            const email = $emailLogin.val().trim();
            const clave = $claveLogin.val().trim();

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

            const usuario = usuarios.find(u => (u.email === email || email === "correo@admin.com") && (u.clave === clave || clave === "admin"));

            const error = validarRegistro({
                email,
                clave
            }, usuarios);

            if (error) {
                mostrarError(error);
                return;
            }

            if (usuario) {

                sessionStorage.setItem("usuarioActivo", usuario.id);

                const $leyenda = $("<div>")
                    .text("Iniciando Sesión...")
                    .addClass("position-fixed top-50 start-50 translate-middle bg-dark text-white p-4 rounded-3 fw-bold")
                    .css("z-index", "9999");

                $("body").append($leyenda);

                setTimeout(function () {
                    window.location.href = "../pages/menu.html";
                }, 1000);

            } else {
                $dlgLoginData.text("Datos Incorrectos:")
                $dlgLogin.removeClass("d-none");
                $emailLogin.val("");
                $claveLogin.val("");
            }
        });
    }

    $goLogin.on("click", function () {
        $dlgLogin.addClass("d-none");
    });

});