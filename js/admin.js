const $delAdmin = $("#delAdmin");
const $dlgDelAdmin = $("#dlgDelAdmin");

$(document).ready(function () {

    const $btnDelAdmin = $("#btnDelAdmin");
    const $cancelDelAdmin = $("#cancelDelAdmin");

    let mouseEncima = false;

    $delAdmin.on("mouseenter", function () {
        mouseEncima = true;
    });

    $delAdmin.on("mouseleave", function () {
        mouseEncima = false;
    });

    $(document).on("keydown", function (e) {
        if (!mouseEncima) return;

        if (e.key === "Enter") {
            $dlgDelAdmin.removeClass("d-none");
        }
    })

    $cancelDelAdmin.on("click", function () {
        $dlgDelAdmin.addClass("d-none");
    });

    $btnDelAdmin.on("click", function (e) {
        e.preventDefault();

        localStorage.removeItem("usuarios");
        cargarUsuarios();
        $dlgDelAdmin.addClass("d-none");
    });
});