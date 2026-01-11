const fechaData = new Date(); /* obtiene la fecha */

const $btnSend = $("#btnSend"); /* En la laerta para confirmar un envio, es el botón para aceptar "Si, Enviar" */
const $dlgDeposit = $("#dlgDeposit"); /* Es la alerta que muestra los datos de un depósito efectuado "(monto) depositado correctamente" */
const $btnConfirm = $("#btnConfirm"); /* Una vez el contacto ya está seleccionado y se indicó el monto a enviar, este es el botón para Enviar, que despliega la alerta de confirmación */
const $dlgUser = $("#dlgUser"); /* Alerta estandarizada, para indicar que hay que seleccionar contacto, tanto para enviar como eliminar, indicar un saldo válido o que el saldo es insuficiente */
const $goSend = $("#goSend"); /* Es el botón "Entendido" dentro de las alertas dlgUser */
const $goDeposit = $("#goDeposit"); /* Es el botón "Entendido" dentro de dlgDeposit */
const $goCompleted = $("#goCompleted"); /* Botón "Entendido" dentro de la alerta que indica (monto) enviado a (contacto) correctamente */

const $contactoModal = $("#contactoModal input"); /* Modal que contiene el formulario para agregar Contacto */
const $cancelForm = $("#cancelForm"); /* Botón "Cancelar" del formulario para añadir contacto */
const $closeForm = $("#closeForm"); /* "X" para cerrar el formulario para ñadir contacto */

const $inputAmount = $("#inputAmount"); /* Input para ingresar el monto a enviar */
const $historyList = $("#historyList"); /* Lista que contien historial de transacciones */
const $dlgHistorial = $("#dlgHistorial"); /* Alerta para confirmar la eliminación del historial */

let saldoChartInstance = null; /* El gráfico, variación del saldo en el tiempo */

const $entra = $(".entra"); /* Diferenciador del submit de los depósitos */
const $sale = $(".sale"); /* Diferenciador del submit de los envios */

const $filtroTipo = $("#filtroTipo"); /* Select donde se indica el tipo de transacción que quiere verse en el historial */
const $historyClean = $("#historyClean"); /* Botón para limpiar el historial */

let nuevoSaldo = "0"; /* Declaración inicial del saldo, antes de cualquier transacción o carga de datos */
let COBRO_SERVICIO = 500; /* Declaración del costo servicio */
let MAX_HISTORY = 5; /* Declaración de la canidad de transacciones que se quiere ver por página en el historial */


/* Cerrar alerta confirmación de envio */
$goSend.on("click", function () {
    hideAlert($dlgUser);
});
/* Cerrar alerta depósito completado */
$goDeposit.on("click", function () {
    hideAlert($dlgDeposit);
    window.location.href = "../pages/menu.html"; /* Redirige al menú al completar un depósito */
});
/* Cerrar alerta envio completado */
$goCompleted.on("click", function () {
    hideAlert($dlgDeposit);
    window.location.href = "../pages/menu.html"; /* Redirige al menú al completar un envio */
});

function mostrarLeyenda($btn) { /* Función recibe un botón */
    const $leyenda = $("<div>") /* Crea un elemento div */
        .text(`Redirigiendo a ${$btn.data("title")}...`) /* extrae el data-title del botón */
        .addClass("leyenda-sesion") /* Agrega elementos del .css */
    $("body").append($leyenda); /* Añade el elemento recien creaco al body de la página */

    // Forzar reflow, calcula para reiniciar animación
    void $leyenda[0].offsetWidth;

    // Aplicar animación de entrada
    $leyenda.addClass("leyenda-entering");

    // Remover clase al terminar y esperar 4 segundos extra en el centro
    const animationEnd = function () { /* Declara función animatioEnd */
        $leyenda.removeClass("leyenda-entering");
        $leyenda.off("animationend", animationEnd);

        // Esperar 4 segundos adicionales en el centro antes de salir
        setTimeout(function () {
            $leyenda.addClass("leyenda-exiting");
        }, 4000);
    };

    $leyenda.on("animationend", animationEnd); /* Al percibir evento nativo animatioend, ejecuta función animationEnd declarada antes */
}

function getUsuarioActivo() { /* Declara función */
    const id = sessionStorage.getItem("usuarioActivo");
    if (!id) return null;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.id === Number(id)) || null;
};

function verificarSesion() {
    const idUsuario = sessionStorage.getItem("usuarioActivo"); /* obtiene usuario activo, que es el id del usuario que ingresó, definido desde login.js */

    if (!idUsuario) { /* Si no detecta la sesión activa */
        window.location.href = "../index.html"; /* redirige al inicio, se llamará esta función al ingresar a cada página, menos index o login */
        return false;
    }

    return true;
}

function cargarHistorial(filtro = "Todos", pagina = 1) { /* Declara función, recibe filtro y página */
    if (!$historyList.length) return; /* Verifica elemento contactList, en transactions.html es una lista */

    const usuario = getUsuarioActivo();
    if (!usuario) return;

    let movimientos = usuario.historial || [];

    if (filtro !== "Todos") {
        movimientos = movimientos.filter(m => m.tipo === filtro);
    }

    movimientos = movimientos.slice().reverse();

    const total = movimientos.length;
    const inicio = (pagina - 1) * MAX_HISTORY;
    const visibles = movimientos.slice(inicio, inicio + MAX_HISTORY);

    $historyList.empty();

    if (visibles.length === 0) {
        $historyList.append(`
            <li class="list-group-item text-muted text-center">
                No hay movimientos
            </li>
        `);
    } else {
        $.each(visibles, function (_, mov) {
            $historyList.append(`
            <li class="list-group-item py-1">
                <div class="d-flex justify-content-between">
                    <strong>${mov.cliente}</strong>
                    <span class="${mov.monto >= 0 ? 'text-success' : 'text-danger'}">
                        ${mov.monto >= 0 ? '+' : '-'}$${Math.abs(mov.monto)}
                    </span>
                </div>
                <div class="small text-muted">
                    ${mov.detalle}
                </div>
                <div class="small text-muted text-end">
                    ${mov.fecha}
                </div>
            </li>
        `);
        });
    }

    $("#prevPage").prop("disabled", pagina === 1);
    $("#nextPage").prop("disabled", inicio + MAX_HISTORY >= total);

}

function guardarUsuario(usuarioActualizado) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const index = usuarios.findIndex(u => u.id === usuarioActualizado.id);
    if (index === -1) return;

    usuarios[index] = usuarioActualizado;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function buscarUsuarioPorCuenta(numeroCuentaAlke) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.numeroCuentaAlke === Number(numeroCuentaAlke)) || null;
}

$(document).ready(function () {

    const $btnDeposit = $("#btnDeposit"); /* Botón "Realizar depósito en el formulario para depositar" */
    const $amount = $("#amount"); /* Input para ingresar el monto a depositar */
    const $dlgDepositData = $("#dlgDepositData"); /* Contenido (texto) de la alerta de depósito completado "(monto) depositado correctamente" */

    if ($btnDeposit.length && $amount.length) { /* Confirma que hay botón y un input con el monto */
        $btnDeposit.on("click", function (e) { /* detecta click en el botón */
            e.preventDefault(); /* evita el comportamiento por default, el submit */

            const monto = Number($amount.val()); /* Convierte el input del monto (string) en un dato numérico */

            if (monto <= 0) { /* Asegura que el monto a depositar sea positivo, de no ser asi vacia el input */
                $amount.val("");
                return;
            }

            const usuario = getUsuarioActivo();
            const saldoActual = usuario.saldo || 0;
            const nuevoSaldo = saldoActual + monto;
            usuario.saldo = nuevoSaldo;

            usuario.historial = usuario.historial || [];

            usuario.historial.push({
                cliente: "Propio",
                monto: monto,
                fecha: new Date().toLocaleDateString("es-CL"),
                tipo: "Depósito",
                detalle: `+$${monto}`
            });

            guardarUsuario(usuario);

            $amount.val("");
            $saldo.val(nuevoSaldo);

            $dlgDepositData.text(`$${monto} depositados correctamente.`);
            showAlert($dlgDeposit, 3000);

            setTimeout(function () {
                window.location.href = "../pages/menu.html";
            }, 3000);
        });
    }
});

$(document).ready(function () {
    const $btnSurf = $(".surf");

    $btnSurf.on("click", function (e) {
        e.preventDefault();

        const $btn = $(this);

        mostrarLeyenda($btn);

        setTimeout(function () {
            // Obtener la leyenda que se acaba de crear
            const $leyenda = $(".leyenda-sesion").last();

            // Aplicar animación de salida
            $leyenda.removeClass("leyenda-entering").addClass("leyenda-exiting");

            // Redirigir después de que termine la animación de salida
            $leyenda.one("animationend", function () {
                window.location.href = $btn.attr("href");
            });
        }, 1000); // 500ms de entrada
    });
});

$(document).ready(function () {

    const $btnLogout = $("#btnLogout");
    const $goLogout = $("#goLogout");
    const $cancelLogout = $("#cancelLogout");
    const $dlgLogout = $("#dlgOverlay");

    $btnLogout.on("click", function (e) {
        e.preventDefault();
        showAlert($dlgLogout);
    });

    $cancelLogout.on("click", function () {
        hideAlert($dlgLogout);
    });

    $goLogout.on("click", function () {
        sessionStorage.removeItem("usuarioActivo");
        localStorage.removeItem("usuarioGuardado");
        window.location.href = $btnLogout.attr("href");
    });
});

const $saldo = $("#saldo");

if ($saldo.length) {
    const usuario = getUsuarioActivo();
    $saldo.val(usuario?.saldo || 0);
}

$btnSend.on("click", function (e) {
    e.preventDefault();

    const monto = Number($inputAmount.val());
    const $dlgCompleted = $("#dlgCompleted");
    const $dlgSend = $("#dlgSend");
    const $sendOK = $("#sendOK");
    const $dlgData = $("#dlgData");
    const usuario = getUsuarioActivo();
    const saldoActual = usuario.saldo || 0;

    const nuevoSaldo = saldoActual - monto - COBRO_SERVICIO;

    usuario.saldo = nuevoSaldo;
    usuario.historial = usuario.historial || [];

    let usuarioDestino = null;

    if (selectedContact.banco.toLowerCase() === "alke" && selectedContact.cuenta) {
        usuarioDestino = buscarUsuarioPorCuenta(selectedContact.cuenta);
    }

    usuario.historial.push({
        cliente: selectedContact.alias,
        monto: -(monto + COBRO_SERVICIO),
        fecha: new Date().toLocaleDateString("es-CL"),
        tipo: "Transferencia",
        detalle: `- $${monto} <span class="text-muted small ms-2">-$${COBRO_SERVICIO} (tax)</span>`
    });

    guardarUsuario(usuario);

    if (usuarioDestino) {
        usuarioDestino.saldo = (usuarioDestino.saldo || 0) + monto;
        usuarioDestino.historial = usuarioDestino.historial || [];

        usuarioDestino.historial.push({
            cliente: usuario.alias,
            monto: monto,
            fecha: new Date().toLocaleDateString("es-CL"),
            tipo: "Depósito",
            detalle: `+ $${monto}`
        });

        guardarUsuario(usuarioDestino);
    }

    hideAlert($dlgSend);
    $inputAmount.val("");

    $sendOK.text(`$${monto} enviados a ${selectedContact.alias}.`);
    showAlert($dlgCompleted, 3000);

    setTimeout(function () {
        window.location.href = "../pages/menu.html";
    }, 3000);
});

$cancelForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

$closeForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

$btnConfirm.on("click", function (e) {
    e.preventDefault();

    const monto = Number($inputAmount.val());
    const $dlgSend = $("#dlgSend");
    const $cancelSend = $("#cancelSend");
    const $dlgData = $("#dlgData");
    const usuario = getUsuarioActivo();
    const saldoActual = usuario.saldo || 0;

    if (!selectedContact) {
        $("#dlgData").text("Seleccione un contacto");
        showAlert($dlgUser, 3000);
        return;
    }

    if (isNaN(monto) || monto < 1000 + COBRO_SERVICIO) {
        $dlgData.text("Ingrese un monto válido");
        showAlert($dlgUser, 3000);
        return;
    }

    if (saldoActual < monto + COBRO_SERVICIO) {
        $dlgData.text("Saldo insuficiente");
        showAlert($dlgUser, 3000);
        return;
    }

    showAlert($dlgSend);

    $cancelSend.on("click", function () {
        hideAlert($dlgSend);
    });
});

$(document).ready(function () {

    const $btnDelHistorial = $("#btnDelHistorial");
    const $cancelDelHistorial = $("#cancelDelHistorial");

    $("#historyClean").on("click", function () {
        showAlert($dlgHistorial);
    });

    $cancelDelHistorial.on("click", function () {
        hideAlert($dlgHistorial);
    });

    $btnDelHistorial.on("click", function (e) {
        e.preventDefault();

        const usuario = getUsuarioActivo();
        const saldoActual = usuario.saldo || 0;
        // store current balance as saldoBase in the user object so the chart
        // starts from the real balance after cleaning history
        usuario.saldoBase = saldoActual;
        localStorage.setItem("saldoBase", saldoActual);

        usuario.historial = [];
        guardarUsuario(usuario);

        // redraw chart (if present) and refresh visible historial
        if (typeof dibujarGraficoSaldo === 'function') dibujarGraficoSaldo();
        cargarHistorial();
        hideAlert($dlgHistorial);

        setTimeout(function () {
            window.location.href = "../pages/menu.html";
        }, 3000);
    });
});