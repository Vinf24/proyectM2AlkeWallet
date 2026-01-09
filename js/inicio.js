
$(document).ready(function () {
    const usuarioGuardado = sessionStorage.getItem("usuarioGuardado");
    if (usuarioGuardado) {
        window.location.href = "../pages/menu.html";
    } else {
        window.location.href = "../index.html";
    }
});

const $chkUsuario = $("#chkUsuario");

$(document).ready(function () {
    $($chkUsuario).on('change', function () {
        if ($(this).is(':checked')) {
            usuarioGuardado = sessionStorage.getItem("usuarioGuardado");
        } else {
            usuarioGuardado = null;
        }
    });
});