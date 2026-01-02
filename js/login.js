$(document).ready(function () {
    const $loginForm = $("#loginForm");
    const $emailLogin = $("#emailLogin");
    const $claveLogin = $("#claveLogin");
    const $dlgLogin = $("#dlgLogin");
    const $goLogin = $("#goLogin");
    const $dlgLoginData = $("#dlgLoginData");

    if ($loginForm.length) {
        $loginForm.on("submit", function (e) {
            e.preventDefault();

            const email = $emailLogin.val().trim();
            const clave = $claveLogin.val().trim();

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

            const usuario = usuarios.find(u => (u.email === email || email === "correo@admin.com") && (u.clave === clave || clave === "admin"));

            if (usuario) {
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