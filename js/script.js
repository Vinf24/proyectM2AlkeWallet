const fechaData = new Date();

const $btnSend = $("#btnSend");
const $btnConfirm = $("#btnConfirm");
const $dlgUser = $("#dlgUser");
const $dlgDelUser = $("#dlgDelUser");
const $dlgDeposit = $("#dlgDeposit");

const $contacto = $("#contacto input");
const $cancelForm = $("#cancelForm");
const $closeForm = $("#closeForm");

const $formAddContact = $("#formAddContact");

const $envio = $("#envio");
const $contactDel = $("#contactDel");
const $historial = $("#historial");

const $contactInput = $("#contact");
const $contactList = $("#contactList");

let contactoSeleccionado = null;

const $entra = $(".entra");
const $sale = $(".sale");

$filtroTipo = $("#filtroTipo");
const $limpiar = $("#limpiar");

let nuevoSaldo = "0";

$dlgUser.on("click", ".btn-close", function () {
    $dlgUser.addClass("d-none");
})

$dlgDeposit.on("click", ".btn-close", function () {
    $dlgDeposit.addClass("d-none");
})

$dlgDelUser.on("click", ".btn-close", function () {
    $dlgDelUser.addClass("d-none");
})

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

$(document).ready(function () {
    const $loginForm = $("#loginForm");
    const $userEmail = $("#email");
    const $userPassword = $("#clave");
    const $dlgLogin = $("#dlgLogin");
    const $goLogin = $("#goLogin");


    if ($loginForm.length) {
        $loginForm.on("submit", function (e) {
            e.preventDefault();

            if ($userEmail.val() === "correo@correcto.com" && $userPassword.val() === "1234") {
                const $leyenda = $("<div>")
                    .text("Iniciando Sesión...")
                    .addClass(
                        "position-fixed top-50 start-50 translate-middle bg-dark text-white p-4 rounded-3 fw-bold"
                    )
                    .css("z-index", "9999");
                $("body").append($leyenda);

                setTimeout(function () {
                    window.location.href = "../pages/menu.html";
                }, 1000);

            } else {
                $dlgLogin.removeClass("d-none");
            }
        });
    }

    $goLogin.on("click", function () {
        $dlgLogin.addClass("d-none");
    });

});


const $saldo = $("#saldo");

if ($saldo.length) {
    const saldoGuardado = localStorage.getItem("saldo");
    $saldo.val(saldoGuardado !== null ? saldoGuardado : 0);
}

$(document).ready(function () {

    const $btnDeposit = $("#btnDeposit");
    const $amount = $("#amount");
    const $depositOk = $("#depositOk");

    if ($btnDeposit && $amount) {
        $btnDeposit.on("click", function (e) {
            e.preventDefault();

            const monto = Number($amount.val());

            if (monto <= 0) {
                $amount.val("");
                return;
            }

            const saldoActual = Number(localStorage.getItem("saldo")) || 0;
            const nuevoSaldo = saldoActual + monto;
            localStorage.setItem("saldo", nuevoSaldo);

            let movimientos = JSON.parse(localStorage.getItem("historial")) || [];
            movimientos.push({
                cliente: "Propio",
                monto: monto,
                fecha: new Date().toLocaleDateString("es-CL"),
                tipo: "Depósito"
            });

            if (movimientos.length > 5) {
                movimientos.shift();
            }

            localStorage.setItem("historial", JSON.stringify(movimientos));

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

$btnSend.on("click", function (e) {
    e.preventDefault();

    const monto = Number($envio.val());
    const saldoActual = Number(localStorage.getItem("saldo")) || 0;
    const cobroServicio = 500;
    const $dlgCompleted = $("#dlgCompleted");
    const $dlgSend = $("#dlgSend");
    const $sendOK = $("#sendOK");
    const $dlgData = $("#dlgData");

    const nuevoSaldo = saldoActual - monto - cobroServicio;
    localStorage.setItem("saldo", nuevoSaldo);

    let movimientos = JSON.parse(localStorage.getItem("historial")) || [];
    movimientos.push({
        cliente: contactoSeleccionado.alias,
        monto: -monto,
        fecha: new Date().toLocaleDateString("es-CL"),
        tipo: "Transferencia"
    });

    localStorage.setItem("historial", JSON.stringify(movimientos));
    cargarHistorial();

    if (movimientos.length > 5) {
        movimientos.shift();
        localStorage.setItem("historial", JSON.stringify(movimientos));
    }

    $dlgSend.addClass("d-none");
    $envio.val("");

    $sendOK.text(`$${monto} enviados a ${contactoSeleccionado.alias}.`);
    $dlgCompleted.removeClass("d-none");

    setTimeout(function () {
        $dlgCompleted.addClass("d-none");
        window.location.href = "../pages/menu.html";
    }, 2000);
});


function cargarContactos() {

    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    $contactDel.empty().append(`<option value="" disabled selected>Seleccione un Contacto</option>`);

    $.each(contactos, function (index, contacto) {
        $contactDel.append(`<option value="${index}">${contacto.alias}</option>`)
    });
}

$cancelForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

$closeForm.on("click", function () {
    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");
});

function cargarHistorial(filtro = "Todos") {
    if (!$historial.length) return;

    let movimientos = JSON.parse(localStorage.getItem("historial")) || [];
    $historial.empty();

    if (filtro !== "Todos") {
        movimientos = movimientos.filter(m => m.tipo === filtro);
    }

    if (movimientos.length === 0) {
        $historial.append(`<tr><td>-</td><td>-</td><td>-</td></tr>`);
        return;
    }

    $.each(movimientos.slice().reverse(), function (index, mov) {
        $historial.append(`
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

    const monto = Number($envio.val());
    const saldoActual = Number(localStorage.getItem("saldo")) || 0;
    const cobroServicio = 500;
    const $dlgSend = $("#dlgSend");
    const $cancelSend = $("#cancelSend");
    const $dlgData = $("#dlgData");

    if (!contactoSeleccionado) {
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

$(document).ready(function () {
    const $dlgDelete = $("#dlgDelete");
    const $goDelete = $("#goDelete");
    const $cancelDelete = $("#cancelDelete");
    const $btnDelete = $("#btnDelete");

    $btnDelete.on("click", function (e) {
        e.preventDefault();

        if (!$contactDel.length) return;

        cargarContactos();
        $dlgDelete.removeClass("d-none");
    });

    $cancelDelete.on("click", function () {
        $dlgDelete.addClass("d-none");
    });

    $goDelete.on("click", function (e) {
        e.preventDefault();

        const contactos = JSON.parse(localStorage.getItem("contactos")) || [];
        const idx = $contactDel.prop("selectedIndex");

        const $dlgDelData = $("#dlgDelData");

        $contactDel.on("change", function () {
            $dlgDelUser.addClass("d-none");
        });

        if (idx === 0) {
            $dlgDelData.text("Seleccione un contacto para eliminar");
            $dlgDelUser.removeClass("d-none");
            return;
        }

        contactos.splice(idx - 1, 1);
        localStorage.setItem("contactos", JSON.stringify(contactos));

        $dlgDelete.addClass("d-none");
        cargarContactos();
    });

});

$formAddContact.on("submit", function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        this.reportValidity();
        return;
    }

    const nombre = $("#nombre").val().trim();
    const apellido = $("#apellido").val().trim();
    const cuenta = $("#cuenta").val().trim();
    const banco = $("#banco").val().trim();
    const alias = $("#alias").val().trim();

    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    contactos.push({
        nombre,
        apellido,
        cuenta,
        banco,
        alias
    });

    localStorage.setItem("contactos", JSON.stringify(contactos));

    cargarContactos();

    $("#nombre, #apellido, #cuenta, #banco, #alias").val("");

    const modal = bootstrap.Modal.getInstance($("#contacto")[0]);
    modal.hide();
});

$entra.add($sale).on("click", function () {
    cargarHistorial();
});

$(document).ready(function () {
    cargarContactos();
    cargarHistorial();
});

$("#limpiar").on("click", function () {
    localStorage.removeItem("historial");
    cargarHistorial();
});

function filtrarContactos(filtro = "") {
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    $contactList.empty();

    const filtrados = contactos.filter(c =>
        c.alias.toLowerCase().includes(filtro.toLowerCase()) ||
        c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        c.apellido.toLowerCase().includes(filtro.toLowerCase())
    );

    if (filtrados.length === 0) {
        $contactList.append(`
            <li class="list-group-item text-muted">Sin resultados</li>
        `);
        return;
    }

    filtrados.forEach(contacto => {
        const indexReal = contactos.findIndex(c =>
            c.alias === contacto.alias &&
            c.cuenta === contacto.cuenta
        );

        $contactList.append(`
        <li class="list-group-item list-group-item-action"
            data-index="${indexReal}">
            <strong>${contacto.alias}</strong><br>
            <small>${contacto.nombre} ${contacto.apellido}</small>
        </li>
    `)
    });
}

$contactInput.on("input", function () {
    const valor = $(this).val().trim();

    if (valor.length === 0) {
        $contactList.addClass("d-none");
        $btnConfirm.addClass("d-none");
        contactoSeleccionado = null;
        return;
    }

    filtrarContactos(valor);
    $contactList.removeClass("d-none");
});

$contactList.on("click", "li", function () {
    const index = $(this).data("index");
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    contactoSeleccionado = contactos[index];

    // Feedback visual
    $contactList.find("li").removeClass("active");
    $(this).addClass("active");

    // Mostrar botón Enviar
    $btnConfirm.removeClass("d-none");
});

$filtroTipo.on("change", function () {
    const tipo = $(this).val();
    cargarHistorial(tipo);
});