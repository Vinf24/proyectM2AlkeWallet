let paginaActual = 1;

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