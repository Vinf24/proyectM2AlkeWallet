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
let activeContactIndex = -1;
let alkeInexistenteMostrado = false;

$(document).ready(function () {
    verificarSesion();
});

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
            alkeInexistenteMostrado = false;
            return;
        }

        const usuarioAlke = buscarUsuarioAlkePorCuenta(cuenta);

        if (usuarioAlke) {
            showAlert($dlgAlkeDetected);
            $dlgAlkeData.text(`${usuarioAlke.nombre.toUpperCase()} ${usuarioAlke.apellido.toUpperCase()}`);

            $goAlkeAdd.off("click").on("click", function () {
                $("#nombre").val(usuarioAlke.nombre).prop("readonly", true).addClass("bg-light border-success");
                $("#apellido").val(usuarioAlke.apellido).prop("readonly", true).addClass("bg-light border-success");
                hideAlert($dlgAlkeDetected);
            });
        } else {
            $("#nombre, #apellido, #cuenta")
                .val("")
                .addClass("bg-light border-danger");

            if (!alkeInexistenteMostrado) {
                $dlgContactData.text("Usuario Alke inexistente");
                showAlert($dlgContact, 3000);
                alkeInexistenteMostrado = true;
            }
        }
        $cancelAlkeAdd.on("click", function () {
            hideAlert($dlgAlkeDetected);
            $("#cuenta, #banco").val("");
            alkeInexistenteMostrado = false;
        });
    });

    const $dlgContact = $("#dlgContact");
    const $dlgContactData = $("#dlgContactData");
    const $goContact = $("#goContact");

    function mostrarError(mensaje) {
        $dlgContactData.text(mensaje);
        showAlert($dlgContact, 3000);
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

            showAlert($dlgDelAdd, 3000);
            $dlgDelAddData.text(`"${alias.toUpperCase()}" añadid@ con éxito.`);
        });
    }

    $goContact.on("click", function () {
        hideAlert($dlgContact);
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
        showAlert($dlgDelete);
    });

    $cancelDelete.on("click", function () {
        hideAlert($dlgDelete);
    });

    $goDelete.on("click", function (e) {
        e.preventDefault();

        const usuario = getUsuarioActivo();
        const $dlgDelAddData = $("#dlgDelAddData");

        if (!selectedContact) {
            $("#dlgData").text("Seleccione un contacto");
            showAlert($dlgUser, 3000);
            return;
        }

        usuario.contactos = (usuario.contactos || [])
            .filter(c => c.cuenta !== selectedContact.cuenta);

        guardarUsuario(usuario);

        showAlert($dlgDelAdd, 3000);
        $dlgDelAddData.text(`${selectedContact.alias} eliminado con éxito.`);
        hideAlert($dlgDelete);

        setTimeout(function () {
            cargarContactos();
            $contactSearchInput.val("");
            $contactList.empty();
            selectedContact = null;
            return;
        }, 3000);
    });

    $goDelAdd.on("click", function () {
        hideAlert($dlgDelAdd);
    });
});

function filtrarContactos(filtro = "") {
    const usuario = getUsuarioActivo();
    activeContactIndex = -1;

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

$contactSearchInput.on("keydown", function (e) {
    const $items = $contactList.find(".contact-item");
    if (!$items.length) return;

    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            activeContactIndex =
                (activeContactIndex + 1) % $items.length;
            break;

        case "ArrowUp":
            e.preventDefault();
            activeContactIndex =
                (activeContactIndex - 1 + $items.length) % $items.length;
            break;

        case "Enter":
            e.preventDefault();
            if (activeContactIndex >= 0) {
                $items.eq(activeContactIndex).trigger("click");
            }
            return;

        default:
            return;

        case "Escape":
            $listCancel.trigger("click");
            return;
    }

    // Actualizar visual
    $items.removeClass("kb-hover");
    const $activeItem = $items.eq(activeContactIndex);
    $activeItem.addClass("kb-hover");

    // Asegurar que el item sea visible (scroll)
    $activeItem[0].scrollIntoView({
        block: "nearest"
    });
});

$listCancel.on("click", function () {
    resetBuscadorContactos();
});

$contactList.on("click", ".contact-item", function () {
    const index = $(this).data("index");
    const usuario = getUsuarioActivo();
    const contactos = usuario.contactos || [];

    selectedContact = contactos[index];

    $contactList.find(".contact-item").removeClass("active kb-hover");
    $(this).addClass("active");

    $dlgSelectedContact.removeClass("d-none").addClass("d-flex");
});

function buscarUsuarioAlkePorCuenta(cuenta) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.numeroCuentaAlke === Number(cuenta)) || null;
}

function resetBuscadorContactos() {
    activeContactIndex = -1;
    $contactList.find(".contact-item").removeClass("active kb-hover");
    $contactSearchInput.val("");
    $contactList.addClass("d-none").empty();
    $labelContacts.removeClass("d-none");
    $listCancel.addClass("d-none");
    $dlgSelectedContact.removeClass("d-flex").addClass("d-none");
    selectedContact = null;
}