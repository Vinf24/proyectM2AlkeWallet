let paginaActual = 1; /* Inicia con la página 1 */

$(document).ready(function () { /* Al cargar la página, verifica un usuario activo y carga su historial */
    verificarSesion();
    cargarHistorial(); /* En la función define "todos" como filtro inicial */
});

$("#nextPage").on("click", function () { /* Detecta click en botón "Siguiente" */
    paginaActual++; /* Le añade 1 al indice de la página */
    cargarHistorial($filtroTipo.val(), paginaActual); /* Aplica el filtro y carga datos (se definen en la función, según filtro y página) */
});

$("#prevPage").on("click", function () {
    if (paginaActual > 1) { /* Verifica que no está en la primera página */
        paginaActual--; /* Le resta 1 al indice de la página */
        cargarHistorial($filtroTipo.val(), paginaActual);
    }
});

$filtroTipo.on("change", function () { /* Detecta cambio en el filtro */
    paginaActual = 1; /* Inicia en la página 1 */
    cargarHistorial($(this).val(), paginaActual); /* Aplica la función para cargar los datos */
});