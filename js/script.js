const fechaData = new Date();

const $btnSend = $("#btnSend");
const $dlgDeposit = $("#dlgDeposit");
const $btnConfirm = $("#btnConfirm");
const $dlgUser = $("#dlgUser");
const $goSend = $("#goSend");
const $goDeposit = $("#goDeposit");

const $contactoModal = $("#contactoModal input");
const $cancelForm = $("#cancelForm");
const $closeForm = $("#closeForm");

const $inputAmount = $("#inputAmount");
const $historyList = $("#historyList");
const $dlgHistorial = $("#dlgHistorial");

let saldoChartInstance = null;

const $entra = $(".entra");
const $sale = $(".sale");

const $filtroTipo = $("#filtroTipo");
const $historyClean = $("#historyClean");

let nuevoSaldo = "0";
let COBRO_SERVICIO = 500;
let MAX_HISTORY = 5;



$goSend.on("click", function () {
    $dlgUser.addClass("d-none");
});

$goDeposit.on("click", function () {
    $dlgDeposit.addClass("d-none");
});

$(document).ready(function () {

    const $btnDeposit = $("#btnDeposit");
    const $amount = $("#amount");
    const $dlgDepositData = $("#dlgDepositData");

    if ($btnDeposit.length && $amount.length) {
        $btnDeposit.on("click", function (e) {
            e.preventDefault();

            const monto = Number($amount.val());

            if (monto <= 0) {
                $amount.val("");
                return;
            }

            const usuario = getUsuarioActivo();
            const saldoActual = usuario.saldo || 0;
            const nuevoSaldo = saldoActual + monto;
            usuario.saldo = nuevoSaldo;

            guardarUsuario(usuario);

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
            $dlgDeposit.removeClass("d-none");

            $(".surf")[0]
                .scrollIntoView({ behavior: "smooth", block: "start" });

            setTimeout(function () {
                window.location.href = "../pages/menu.html";
            }, 2000);
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
            window.location.href = $btn.attr("href");
        }, 1000);
    });
});

function mostrarLeyenda($btn) {
    const $leyenda = $("<div>")
        .text(`Redirigiendo a ${$btn.data("title")}...`)
        .addClass(
            "leyenda-sesion"
        )
        .css("z-index", "9999");
    $("body").append($leyenda);
}

$(document).ready(function () {

    const $btnLogout = $("#btnLogout");
    const $goLogout = $("#goLogout");
    const $cancelLogout = $("#cancelLogout");
    const $dlgLogout = $("#dlgOverlay");

    $btnLogout.on("click", function (e) {
        e.preventDefault();
        $dlgLogout.removeClass("d-none");
    });

    $cancelLogout.on("click", function () {
        $dlgLogout.addClass("d-none");
    });

    $goLogout.on("click", function () {
        sessionStorage.removeItem("usuarioActivo");
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

    $dlgSend.addClass("d-none");
    $inputAmount.val("");

    $sendOK.text(`$${monto} enviados a ${selectedContact.alias}.`);
    $dlgCompleted.removeClass("d-none");

    setTimeout(function () {
        $dlgCompleted.addClass("d-none");
        window.location.href = "../pages/menu.html";
    }, 2000);
});

function cargarContactos() {
    const usuario = getUsuarioActivo();
    if (!usuario) return;

    const contactos = usuario.contactos || [];
}

$cancelForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

$closeForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

function cargarHistorial(filtro = "Todos", pagina = 1) {
    if (!$historyList.length) return;

    const usuario = getUsuarioActivo();
    if (!usuario) return;

    let movimientos = usuario.historial || [];

    if (filtro !== "Todos") {
        movimientos = movimientos.filter(m => m.tipo === filtro);
    }

    movimientos = movimientos.slice().reverse();

    const inicio = (pagina - 1) * MAX_HISTORY;
    const visibles = movimientos.slice(inicio, inicio + MAX_HISTORY);

    $historyList.empty();

    if (visibles.length === 0) {
        $historyList.append(`
            <li class="list-group-item text-muted text-center">
                No hay movimientos
            </li>
        `);
        return;
    }

    $.each(visibles, function (_, mov) {
        $historyList.append(`
            <li class="list-group-item">
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

$btnConfirm.on("click", function (e) {
    e.preventDefault();

    const monto = Number($inputAmount.val());
    const $dlgSend = $("#dlgSend");
    const $cancelSend = $("#cancelSend");
    const $dlgData = $("#dlgData");
    const usuario = getUsuarioActivo();
    const saldoActual = usuario.saldo || 0;

    if (!selectedContact) {
        $dlgUser.removeClass("d-none");
        $("#dlgData").text("Seleccione un contacto");
        return;
    }

    if (isNaN(monto) || monto < 1000 + COBRO_SERVICIO) {
        $dlgUser.removeClass("d-none");
        $dlgData.text("Ingrese un monto válido");
        return;
    }

    if (saldoActual < monto + COBRO_SERVICIO) {
        $dlgUser.removeClass("d-none");
        $dlgData.text("Saldo insuficiente");
        return;
    }

    $dlgSend.removeClass("d-none");

    $cancelSend.on("click", function () {
        $dlgSend.addClass("d-none");
    });
});

$entra.add($sale).on("click", function () {
    cargarHistorial();
});

$(document).ready(function () {
    cargarContactos();
    cargarHistorial();
});

$(document).ready(function () {

    const $btnDelHistorial = $("#btnDelHistorial");
    const $cancelDelHistorial = $("#cancelDelHistorial");

    $("#historyClean").on("click", function () {

        $dlgHistorial.removeClass("d-none");
    });

    $cancelDelHistorial.on("click", function () {
        $dlgHistorial.addClass("d-none");
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
        $dlgHistorial.addClass("d-none");

        setTimeout(function () {
            window.location.href = "../pages/menu.html";
        }, 2000);
    });
});

$filtroTipo.on("change", function () {
    const tipo = $(this).val();
    cargarHistorial(tipo);
});

function getUsuarioActivo() {
    const id = sessionStorage.getItem("usuarioActivo");
    if (!id) return null;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.id === Number(id)) || null;
};

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