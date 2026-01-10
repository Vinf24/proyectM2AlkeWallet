const usuarioActivo = sessionStorage.getItem("usuarioActivo");
const menu = "../pages/menu.html";
const login = "../index.html";

if (usuarioActivo) {
    window.location.href = menu;
}

$(document).ready(function () {
    const usuarioGuardado = sessionStorage.getItem("usuarioGuardado");
    if (usuarioGuardado) {
        usuarioActivo = sessionStorage.setItem("usuarioActivo", usuarioGuardado);
        inicio = menu;
    } else {
        usuarioActivo = null;
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