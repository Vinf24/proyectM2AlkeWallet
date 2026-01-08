const $formAddContact = $("#formAddContact");
const $dlgDelAddData = $("#dlgDelAddData");
const $dlgDelAdd = $("#dlgDelAdd");
const $goDelAdd = $("#goDelAdd");

const $dlgSelectedContact = $("#dlgSelectedContact");

const $contactSearchInput = $("#contactSearchInput");
const $contactList = $("#contactList");
const $labelContacts = $("#labelContacts");
const $listCancel = $("#listCancel");

let selectedContact = null;

function validarContacto(datos, contactos) {
    const { nombre, apellido, cuenta, banco, alias } = datos;
    const cuentaRegex = /^\d{8}$/;

    if (!alias) return "Ingrese un alias";

    if (!banco) return "Ingrese el nombre del banco";

    if (!cuenta) return "Ingrese el número de cuenta";

    if (!cuentaRegex.test(cuenta)) return "Ingrese un número de cuenta válido";

    const existe = contactos.some(u => u.cuenta === cuenta);
    if (existe) return "Cuenta repetida en otro contacto";

    if (banco.toLowerCase() === "alke") {
        const usuarioAlke = buscarUsuarioAlkePorCuenta(cuenta);

        if (!usuarioAlke) {
            return "Usuario Alke inexistente"
        }
    } else {
        if (!nombre || !apellido) return "Ingrese nombre y apellido";
    }

    return null;
}

$(document).ready(function () {
    $("#cuenta, #banco").on("input", function () {
        const banco = $("#banco").val().trim();
        const cuenta = $("#cuenta").val().trim();

        const $dlgAlkeDetected = $("#dlgAlkeDetected");
        const $dlgAlkeData = $("#dlgAlkeData");
        const $goAlkeAdd = $("#goAlkeAdd");
        const $cancelAlkeAdd = $("#cancelAlkeAdd");

        $("#nombre, #apellido").prop("readonly", false).removeClass("bg-light border-success border-danger");

        if (banco.toLowerCase() !== "alke" || cuenta.length !== 8) {
            return;
        }

        const usuarioAlke = buscarUsuarioAlkePorCuenta(cuenta);

        if (usuarioAlke) {
            $dlgAlkeDetected.removeClass("d-none");
            $dlgAlkeData.text(`${usuarioAlke.nombre.toUpperCase()} ${usuarioAlke.apellido.toUpperCase()}`);

            $goAlkeAdd.on("click", function () {
                $("#nombre").val(usuarioAlke.nombre).prop("readonly", true).addClass("bg-light border-success");
                $("#apellido").val(usuarioAlke.apellido).prop("readonly", true).addClass("bg-light border-success");
                $dlgAlkeDetected.addClass("d-none");
            });
        } else {
            $("#nombre").val("").prop("readonly", true).addClass("bg-light border-danger");
            $("#apellido").val("").prop("readonly", true).addClass("bg-light border-danger");
        }
        $cancelAlkeAdd.on("click", function () {
            $dlgAlkeDetected.addClass("d-none");
            $("#cuenta, #banco").val("");
        });
    });

    const $dlgContact = $("#dlgContact");
    const $dlgContactData = $("#dlgContactData");
    const $goContact = $("#goContact");

    function mostrarError(mensaje) {
        $dlgContactData.text(mensaje);
        $dlgContact.removeClass("d-none");
    };

    if ($formAddContact.length) {
        $formAddContact.on("submit", function (e) {
            e.preventDefault();

            const nombre = $("#nombre").val().trim();
            const apellido = $("#apellido").val().trim();
            const cuenta = $("#cuenta").val().trim();
            const banco = $("#banco").val().trim();
            const alias = $("#alias").val().trim();

            const usuario = getUsuarioActivo();

            if (!usuario) return;

            usuario.contactos = usuario.contactos || [];

            const error = validarContacto({
                nombre,
                apellido,
                cuenta,
                banco,
                alias
            }, usuario.contactos);

            if (error) {
                mostrarError(error);
                return;
            }

            let nombreFinal = nombre;
            let apellidoFinal = apellido;

            if (banco.toLowerCase() === "alke") {
                const usuarioAlke = buscarUsuarioAlkePorCuenta(cuenta);
                nombreFinal = usuarioAlke.nombre;
                apellidoFinal = usuarioAlke.apellido;
            }

            usuario.contactos.push({
                nombre: nombreFinal,
                apellido: apellidoFinal,
                cuenta,
                banco,
                alias
            });

            guardarUsuario(usuario);

            cargarContactos();

            $("#nombre, #apellido, #cuenta, #banco, #alias").val("");

            const modal = bootstrap.Modal.getInstance($("#contactoModal")[0]);

            modal.hide();

            $dlgDelAdd.removeClass("d-none");
            $dlgDelAddData.text(`"${alias.toUpperCase()}" añadid@ con éxito.`);

            setTimeout(function () {
                $dlgDelAdd.addClass("d-none");
                return;
            }, 2000);
        });
    }

    $goContact.on("click", function () {
        $dlgContact.addClass("d-none");
    });
});

$(document).ready(function () {
    const $dlgDelete = $("#dlgDelete");
    const $goDelete = $("#goDelete");
    const $cancelDelete = $("#cancelDelete");
    const $delContact = $("#delContact");

    $delContact.on("click", function (e) {
        e.preventDefault();

        cargarContactos();
        $dlgDelete.removeClass("d-none");
    });

    $cancelDelete.on("click", function () {
        $dlgDelete.addClass("d-none");
    });

    $goDelete.on("click", function (e) {
        e.preventDefault();

        const usuario = getUsuarioActivo();
        const $dlgDelAddData = $("#dlgDelAddData");

        if (!selectedContact) {
            $dlgUser.removeClass("d-none");
            $("#dlgData").text("Seleccione un contacto");
            return;
        }

        usuario.contactos = (usuario.contactos || [])
            .filter(c => c.cuenta !== selectedContact.cuenta);

        guardarUsuario(usuario);

        $dlgDelAdd.removeClass("d-none");
        $dlgDelAddData.text(`${selectedContact.alias} eliminado con éxito.`);
        $dlgDelete.addClass("d-none");

        setTimeout(function () {
            cargarContactos();
            $contactSearchInput.val("");
            $contactList.empty();
            selectedContact = null;
            $dlgDelAdd.addClass("d-none");
            return;
        }, 2000);
    });

    $goDelAdd.on("click", function () {
        $dlgDelAdd.addClass("d-none");
    });
});

function filtrarContactos(filtro = "") {
    const usuario = getUsuarioActivo();
    if (!usuario) return;

    const contactos = usuario.contactos || [];

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
        <li class="list-group-item list-group-item-action contact-item"
            data-index="${indexReal}">
            <strong>${contacto.alias}</strong><small> (${contacto.banco})</small><br>
            <small>${contacto.nombre} ${contacto.apellido}</small>
        </li>
    `)
    });
}

$contactSearchInput.on("input", function () {
    const valor = $(this).val().trim();

    if (valor.length === 0) {
        resetBuscadorContactos();
        return;
    }

    filtrarContactos(valor);
    $contactList.removeClass("d-none");
    $labelContacts.addClass("d-none");
    $listCancel.removeClass("d-none");
});

$listCancel.on("click", function () {
    resetBuscadorContactos();
});

$contactList.on("click", ".contact-item", function () {
    const index = $(this).data("index");
    const usuario = getUsuarioActivo();
    const contactos = usuario.contactos || [];
    selectedContact = contactos[index];

    // Feedback visual
    $contactList.find(".contact-item").removeClass("active");
    $(this).addClass("active");

    // Mostrar botón Enviar
    $dlgSelectedContact.removeClass("d-none").addClass("d-flex");
});

function buscarUsuarioAlkePorCuenta(cuenta) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.numeroCuentaAlke === Number(cuenta)) || null;
}

function resetBuscadorContactos() {
    $contactSearchInput.val("");
    $contactList.addClass("d-none").empty();
    $labelContacts.removeClass("d-none");
    $listCancel.addClass("d-none");
    $dlgSelectedContact.removeClass("d-flex").addClass("d-none");
    selectedContact = null;
}