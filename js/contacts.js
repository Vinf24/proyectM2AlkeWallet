const $formAddContact = $("#formAddContact");
const $dlgDelUser = $("#dlgDelUser");
const $completedDelUser = $("#completedDelUser");
const $completedDelData = $("#completedDelData");

const $dlgSelectedContact = $("#dlgSelectedContact");

const $contactSearchInput = $("#contactSearchInput");
const $contactList = $("#contactList");

let selectedContact = null;

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

    const modal = bootstrap.Modal.getInstance($("#contactoModal")[0]);
    const $dlgDelData = $("#dlgDelData");

    modal.hide();

    $completedDelUser.removeClass("d-none");
    $completedDelData.text(`${alias} añadido con éxito.`);

    setTimeout(function () {
        $completedDelUser.addClass("d-none");
        return;
    }, 2000);
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

        const contactos = JSON.parse(localStorage.getItem("contactos")) || [];
        const $dlgDelData = $("#dlgDelData");

        if (!selectedContact) {
            $dlgUser.removeClass("d-none");
            $("#dlgData").text("Seleccione un contacto");
            return;
        }

        const contactosRestantes = contactos.filter(c => c.cuenta !== selectedContact.cuenta);

        localStorage.setItem("contactos", JSON.stringify(contactosRestantes));

        $dlgDelUser.removeClass("d-none");
        $dlgDelData.text(`${selectedContact.alias} eliminado con éxito.`);
        $dlgDelete.addClass("d-none");

        setTimeout(function () {
            cargarContactos();
            $contactSearchInput.val("");
            $contactList.empty();
            selectedContact = null;
            $dlgDelUser.addClass("d-none");
            return;
        }, 2000);
    });

    $dlgDelUser.on("click", ".btn-close", function () {
        $dlgDelUser.addClass("d-none");
    });

    $completedDelUser.on("click", ".btn-close", function () {
        $completedDelUser.addClass("d-none");
    });
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
        <li class="list-group-item list-group-item-action contact-item"
            data-index="${indexReal}">
            <strong>${contacto.alias}</strong><br>
            <small>${contacto.nombre} ${contacto.apellido}</small>
        </li>
    `)
    });
}

$contactSearchInput.on("input", function () {
    const valor = $(this).val().trim();

    if (valor.length === 0) {
        $contactList.addClass("d-none");
        $dlgSelectedContact.removeClass("d-flex").addClass("d-none");
        selectedContact = null;
        return;
    }

    filtrarContactos(valor);
    $contactList.removeClass("d-none");
});

$contactList.on("click", ".contact-item", function () {
    const index = $(this).data("index");
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    selectedContact = contactos[index];

    // Feedback visual
    $contactList.find(".contact-item").removeClass("active");
    $(this).addClass("active");

    // Mostrar botón Enviar
    $dlgSelectedContact.removeClass("d-none").addClass("d-flex");
});