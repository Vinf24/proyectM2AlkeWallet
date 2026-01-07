const fechaData = new Date();

const $btnSend = $("#btnSend");
const $dlgDeposit = $("#dlgDeposit");
const $btnConfirm = $("#btnConfirm");
const $dlgUser = $("#dlgUser");

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

const MAX_HISTORY = 5;
const COBRO_SERVICIO = 500;


$dlgUser.on("click", ".btn-close", function () {
    $dlgUser.addClass("d-none");
});

$dlgDeposit.on("click", ".btn-close", function () {
    $dlgDeposit.addClass("d-none");
});

$(document).ready(function () {

    const $btnDeposit = $("#btnDeposit");
    const $amount = $("#amount");
    const $depositOk = $("#depositOk");

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

            if (usuario.historial.length > MAX_HISTORY) {
                usuario.historial.shift();
            }

            guardarUsuario(usuario);

            $amount.val("");
            $saldo.val(nuevoSaldo);

            $depositOk.text(`$${monto} depositados correctamente.`);
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
            "position-fixed top-50 start-50 translate-middle bg-dark text-white p-4 rounded-3 fw-bold text-center w-75"
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
    const cobroServicio = COBRO_SERVICIO;
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
        monto: -(monto + cobroServicio),
        fecha: new Date().toLocaleDateString("es-CL"),
        tipo: "Transferencia",
        detalle: `- $${monto} <span class="text-muted small ms-2">-$${cobroServicio} (tax)</span>`
    });

    if (usuario.historial.length > MAX_HISTORY) {
        usuario.historial.shift();
    }

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

        if (usuarioDestino.historial.length > MAX_HISTORY) {
            usuarioDestino.historial.shift();
        }

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

function cargarHistorial(filtro = "Todos") {
    if (!$historyList.length) return;

    const usuario = getUsuarioActivo();
    if (!usuario) return;

    let movimientos = usuario.historial || [];
    $historyList.empty();

    if (filtro !== "Todos") {
        movimientos = movimientos.filter(m => m.tipo === filtro);
    }

    if (movimientos.length === 0) {
        $historyList.append(`
            <li class="list-group-item text-muted text-center">
                No hay movimientos
            </li>
        `);
        return;
    }

    $.each(movimientos.slice().reverse(), function (_, mov) {
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
    const cobroServicio = 500;
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

    if (isNaN(monto) || monto < 1000) {
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
        localStorage.setItem("saldoBase", saldoActual);


        usuario.historial = [];
        guardarUsuario(usuario);
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