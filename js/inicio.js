const menu = "../pages/menu.html"; /* Declara variables que contienen rutas */
const login = "../pages/login.html";

$(document).ready(function () {
    const usuarioGuardado = localStorage.getItem("usuarioGuardado");

    let inicio = ""; /* Ruta para iniciar */

    if (usuarioGuardado) { /* Si detecta un usuario guardado, carga la ruta menú como inicio */
        sessionStorage.setItem("usuarioActivo", usuarioGuardado);
        inicio = menu;
    } else { /* Si no, carga la página para iniciar sesión como inicio */
        sessionStorage.removeItem("usuarioActivo");
        inicio = login;
    }

    const $leyenda = $("<div>") /* Crea un elemento div */
        .text("Bienvenido...") /* Le carga contenido */
        .addClass("leyenda-sesion") /* Estilo css */

    $("body").append($leyenda); /* Añade el div recien creado al body */

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