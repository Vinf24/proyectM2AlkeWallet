const menu = "../pages/menu.html";
const login = "../pages/login.html";

$(document).ready(function () {
    let usuarioActivo = sessionStorage.getItem("usuarioActivo");
    const usuarioGuardado = localStorage.getItem("usuarioGuardado");

    let inicio = "";

    if (usuarioGuardado) {
        sessionStorage.setItem("usuarioActivo", usuarioGuardado);
        inicio = menu;
    } else {
        sessionStorage.removeItem("usuarioActivo");
        inicio = login;
    }

    const $leyenda = $("<div>")
        .text("Bienvenido...")
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
                window.location.href = inicio;
            });
        }, 1000); // 1 segundo extra en el centro
    });
});