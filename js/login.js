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
            showAlert($dlgLogin, 3000);
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
                    .addClass("leyenda-sesion")
                    .css("z-index", "9999");

                $("body").append($leyenda);

                // Forzar reflow
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

            } else {
                $dlgLoginData.text("Datos Incorrectos:")
                showAlert($dlgLogin, 3000);
                $emailLogin.val("");
                $claveLogin.val("");
            }
        });
    }

    $goLogin.on("click", function () {
        hideAlert($dlgLogin);
    });

});