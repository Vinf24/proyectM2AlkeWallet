const fechaData = new Date();

const $btnSend = $("#btnSend");
const $btnConfirm = $("#btnConfirm");
const $dlgUser = $("#dlgUser");

const $contactoModal = $("#contactoModal input");
const $cancelForm = $("#cancelForm");
const $closeForm = $("#closeForm");

const $inputAmount = $("#inputAmount");
const $historyTable = $("#historyTable");
const $dlgHistorial = $("#dlgHistorial");

let saldoChartInstance = null;

const $entra = $(".entra");
const $sale = $(".sale");

$filtroTipo = $("#filtroTipo");
const $historyClean = $("#historyClean");

let nuevoSaldo = "0";

$dlgUser.on("click", ".btn-close", function () {
    $dlgUser.addClass("d-none");
});

$dlgDeposit.on("click", ".btn-close", function () {
    $dlgDeposit.addClass("d-none");
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
            "position-fixed top-50 start-50 translate-middle bg-dark text-white p-4 rounded-3 fw-bold text-center"
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
        window.location.href = $btnLogout.attr("href");
    });
});

const $saldo = $("#saldo");

if ($saldo.length) {
    const saldoGuardado = localStorage.getItem("saldo");
    $saldo.val(saldoGuardado !== null ? saldoGuardado : 0);
}

$btnSend.on("click", function (e) {
    e.preventDefault();

    const monto = Number($inputAmount.val());
    const saldoActual = Number(localStorage.getItem("saldo")) || 0;
    const cobroServicio = 500;
    const $dlgCompleted = $("#dlgCompleted");
    const $dlgSend = $("#dlgSend");
    const $sendOK = $("#sendOK");
    const $dlgData = $("#dlgData");

    const nuevoSaldo = saldoActual - monto - cobroServicio;
    localStorage.setItem("saldo", nuevoSaldo);

    let movimientos = JSON.parse(localStorage.getItem("historyTable")) || [];

    movimientos.push({
        cliente: selectedContact.alias,
        monto: -(monto + cobroServicio),
        fecha: new Date().toLocaleDateString("es-CL"),
        tipo: "Transferencia"
    });

    localStorage.setItem("historyTable", JSON.stringify(movimientos));
    cargarHistorial();

    if (movimientos.length > 5) {
        movimientos.shift();
        localStorage.setItem("historyTable", JSON.stringify(movimientos));
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
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];
}

function cargarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
}

$cancelForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

$closeForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

function cargarHistorial(filtro = "Todos") {
    if (!$historyTable.length) return;

    let movimientos = JSON.parse(localStorage.getItem("historyTable")) || [];
    $historyTable.empty();

    if (filtro !== "Todos") {
        movimientos = movimientos.filter(m => m.tipo === filtro);
    }

    if (movimientos.length === 0) {
        $historyTable.append(`<tr><td>-</td><td>-</td><td>-</td></tr>`);
        return;
    }

    $.each(movimientos.slice().reverse(), function (index, mov) {
        $historyTable.append(`
            <tr>
                <td>${mov.cliente}</td>
                <td>${mov.monto}</td>
                <td>${mov.fecha}</td>
            </tr>
            `);
    });
}

$btnConfirm.on("click", function (e) {
    e.preventDefault();

    const monto = Number($inputAmount.val());
    const saldoActual = Number(localStorage.getItem("saldo")) || 0;
    const cobroServicio = 500;
    const $dlgSend = $("#dlgSend");
    const $cancelSend = $("#cancelSend");
    const $dlgData = $("#dlgData");

    if (!selectedContact) {
        $dlgUser.removeClass("d-none");
        $("#dlgData").text("Seleccione un contacto");
        return;
    }

    if (isNaN(monto) || monto <= 1000) {
        $dlgUser.removeClass("d-none");
        $dlgData.text("Ingrese un monto válido");
        return;
    }

    if (saldoActual < monto + cobroServicio) {
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
    cargarUsuarios();
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

        const saldoActual = Number(localStorage.getItem("saldo")) || 0;
        localStorage.setItem("saldoBase", saldoActual);


        localStorage.removeItem("historyTable");
        cargarHistorial();
        dibujarGraficoSaldo();
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