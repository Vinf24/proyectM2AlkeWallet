let paginaActual = 1;

$(document).ready(function () {
    verificarSesion();
    cargarHistorial();
});

$("#nextPage").on("click", function () {
    paginaActual++;
    cargarHistorial($filtroTipo.val(), paginaActual);
});

$("#prevPage").on("click", function () {
    if (paginaActual > 1) {
        paginaActual--;
        cargarHistorial($filtroTipo.val(), paginaActual);
    }
});

$filtroTipo.on("change", function () {
    paginaActual = 1;
    cargarHistorial($(this).val(), paginaActual);
});