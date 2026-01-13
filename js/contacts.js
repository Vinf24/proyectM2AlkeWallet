const $formAddContact = $("#formAddContact"); /* Formulario para añadir contacto */
const $dlgDelAddData = $("#dlgDelAddData"); /* Contenido de las alertas al añadir o borrar contacto */
const $dlgDelAdd = $("#dlgDelAdd"); /* Alerta de exito al eliminar o añadir contacto */
const $goDelAdd = $("#goDelAdd"); /* Botón "Entendido" de la alerta */

const $dlgSelectedContact = $("#dlgSelectedContact"); /* Contenido con botones que se despliega solo si hay un contacto seleccionado */

const $contactSearchInput = $("#contactSearchInput"); /* Input para buscar un contacto */
const $contactList = $("#contactList"); /* Lista de contactos desplegada al buscar contacto */
const $listCancel = $("#listCancel"); /* Botón para cerrar la lista de contactos */

let selectedContact = null; /* Inicia con ningún contacto seleccionado */
let activeContactIndex = -1; /* Indice del contacto seleccionado */
let alkeInexistenteMostrado = false; /* Ya que la alerta se despliega en base al input, este booleano se activa con la alerta y no permite que aparezca varias veces */

function buscarUsuarioAlkePorCuenta(cuenta) { /* Declara función, recibe la clave numeroCuentaAlke del usuario/contacto */
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.numeroCuentaAlke === Number(cuenta)) || null;
}

function resetBuscadorContactos() { /* Declara función, restablece clases con estilos css, limpia inputs, limpia y esconde elementos */
    activeContactIndex = -1;
    $contactList.find(".contact-item").removeClass("active kb-hover");
    $contactSearchInput.val("");
    $contactList.addClass("d-none").empty();
    $listCancel.addClass("d-none");
    $dlgSelectedContact.removeClass("d-flex").addClass("d-none");
    selectedContact = null;
}

function filtrarContactos(filtro = "") { /* Declara función, recibe filtro */
    const usuario = getUsuarioActivo(); /* Obtiene el usuario activo */
    activeContactIndex = -1; /* Retiene indice del contacto con el que se trabaja, se le podrá asignar estilo css, tomar como dato, etc */

    if (!usuario) return;

    const contactos = usuario.contactos || []; /* Obtiene el array de contactos */

    $contactList.empty(); /* Limpia la lista de contactos */

    const filtrados = contactos.filter(c => /* Ubica los contactos que contengan alguna parte delo que se busca, ya sea en: */
        c.alias.toLowerCase().includes(filtro.toLowerCase()) || /* Su alias */
        c.nombre.toLowerCase().includes(filtro.toLowerCase()) || /* su nombre */
        c.apellido.toLowerCase().includes(filtro.toLowerCase()) /* su apellido */
    );

    if (filtrados.length === 0) { /* Si no hay resultados */
        $contactList.append(`
            <li class="list-group-item text-muted">Sin resultados</li>
        `);
        return;
    }

    filtrados.forEach(contacto => { /* Para cada contacto obtenido se retiene su indice real de la lista completa sin filtro */
        const indexReal = contactos.findIndex(c =>
            c.alias === contacto.alias &&
            c.cuenta === contacto.cuenta
        );
        /* Estructura de la lista y datos a mostrar */
        $contactList.append(`
        <li class="list-group-item list-group-item-action contact-item"
            data-index="${indexReal}">
            <strong>${contacto.alias}</strong><small> (${contacto.banco})</small><br>
            <small>${contacto.nombre} ${contacto.apellido}</small>
        </li>
    `)
    });
}

$(document).ready(function () { /* Si no hay usuario declarado vuelve a index */
    verificarSesion();
});

function validarContacto(datos, contactos) { /* Si hay problemas, entrega mensaje */
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
    $("#cuenta, #banco").on("input", function () { /* Detecta los inputs donde va el nombre del banco y la cuenta */
        const banco = $("#banco").val().trim(); /* Obtiene los valores */
        const cuenta = $("#cuenta").val().trim();

        const $dlgAlkeDetected = $("#dlgAlkeDetected"); /* Alerta para cuando se intenta añadir un usuario Alke, detectado desde la lista de usuarios */
        const $dlgAlkeData = $("#dlgAlkeData"); /* Contenido de la alerta */
        const $goAlkeAdd = $("#goAlkeAdd"); /* Botón para precargar los datos del usuario alke detectado */
        const $cancelAlkeAdd = $("#cancelAlkeAdd"); /* Botón para cerrar la alerta */

        /* Establece si se puede escribir en los input de nombre y apellido, si se detecta usuario alke, estos se precargan y la idea es que se mantengan asi */
        $("#nombre, #apellido").prop("readonly", false).removeClass("bg-light border-success border-danger");

        if (banco.toLowerCase() !== "alke" || cuenta.length !== 8) { /* Si el banco no es alke, salta código */
            alkeInexistenteMostrado = false; /* Permite que la alerta pueda mostrarse */
            return;
        }
        /* Si es alke */
        const usuarioAlke = buscarUsuarioAlkePorCuenta(cuenta); /* Busca si hay un usuario en la lista con la cuenta que se esá intenando ingresar */

        if (usuarioAlke) { /* Si lo encuentra */
            showAlert($dlgAlkeDetected); /* Muestra la alerta */
            $dlgAlkeData.text(`${usuarioAlke.nombre.toUpperCase()} ${usuarioAlke.apellido.toUpperCase()}`); /* Carga contenido a la alerta, con los datos del contacto encontrado */

            $goAlkeAdd.off("click").on("click", function () { /* Detecta click y evita duplicar */
                /* Carga los datos del usuario Alke detectado y no permite cambiar esa información de nombre y apellido */
                $("#nombre").val(usuarioAlke.nombre).prop("readonly", true).addClass("bg-light border-success");
                $("#apellido").val(usuarioAlke.apellido).prop("readonly", true).addClass("bg-light border-success");
                hideAlert($dlgAlkeDetected); /* Cierra la alerta, quedando un formulario con datos precargados, para poder continuar al submit posteriormente */
            });
        } else { /* Si no lo encuentra */
            $("#nombre, #apellido, #cuenta")
                .val("") /* Limpia los inputs para que sean ingresados de nuevo, solo mantiene la intención de que alke sea el banco */
                .addClass("bg-light border-danger");

            if (!alkeInexistenteMostrado) { /* Si la alerta "Usuario alke inexistente" no está cuando el usuario Alke no fue encontrado */
                $dlgContactData.text("Usuario Alke inexistente"); /* Muestra el mensaje */
                showAlert($dlgContact, 3000); /* Despliega la alerta por 3 segundos */
                alkeInexistenteMostrado = true; /* No permite que la alerta pueda desplegarse de forma repetida */
            }
        }
        $cancelAlkeAdd.on("click", function () { /* Detecta click en alerta */
            hideAlert($dlgAlkeDetected); /* Cierra la alerta */
            $("#cuenta, #banco").val(""); /* Limpia los inputs */
            alkeInexistenteMostrado = false; /* Permite que la alerta pueda desplegarse otra vez, como los inputs están limpios no ocurre */
        });
    });

    const $dlgContact = $("#dlgContact"); /* Alerta al validar datos en formulario para añadir contacto */
    const $dlgContactData = $("#dlgContactData"); /* Contenido de la alerta */
    const $goContact = $("#goContact"); /* Botón "Entendido" de la alerta */

    function mostrarError(mensaje) { /* Carga el mensaje de error a la alerta y la muestra por 3 segundos */
        $dlgContactData.text(mensaje);
        showAlert($dlgContact, 3000);
    };

    if ($formAddContact.length) { /* Si hay formulario para añadir contactos */
        $formAddContact.on("submit", function (e) { /* Detecta el submit del formulario */
            e.preventDefault();

            const nombre = $("#nombre").val().trim(); /* Recibe datos de los inputs */
            const apellido = $("#apellido").val().trim();
            const cuenta = $("#cuenta").val().trim();
            const banco = $("#banco").val().trim();
            const alias = $("#alias").val().trim();

            const usuario = getUsuarioActivo(); /* Obtiene el usuario activo */

            if (!usuario) return;

            usuario.contactos = usuario.contactos || []; /* Protege array de contactos */

            const error = validarContacto({ /* Valida los datos, entrega mensaje de error o null */
                nombre,
                apellido,
                cuenta,
                banco,
                alias
            }, usuario.contactos);

            if (error) { /* Si hay mensaje de error */
                mostrarError(error); /* Muestra la alerta */
                return;
            }

            let nombreFinal = nombre; /* declara nombre y apellido del usuario */
            let apellidoFinal = apellido;

            if (banco.toLowerCase() === "alke") { /* Si el banco es alke */
                const usuarioAlke = buscarUsuarioAlkePorCuenta(cuenta); /* Lo busca entre usuarios por su numero de cuenta */
                nombreFinal = usuarioAlke.nombre; /* Asegura nombre y apellido del usuario alke */
                apellidoFinal = usuarioAlke.apellido;
            }

            usuario.contactos.push({ /* Asegura que los datos del usuario alke sean los que se añaden a los datos */
                nombre: nombreFinal,
                apellido: apellidoFinal,
                cuenta,
                banco,
                alias
            });

            guardarUsuario(usuario); /* Carga datos al array de usuarios y lo guarda en el JSON del localStorage */

            $("#nombre, #apellido, #cuenta, #banco, #alias").val(""); /* Limpia los inputs */

            const modal = bootstrap.Modal.getInstance($("#contactoModal")[0]); /* Obtiene el modal */

            modal.hide(); /* Cierra el modal */

            showAlert($dlgDelAdd, 3000); /* Muestra la alerta por 3 segundos */
            $dlgDelAddData.text(`"${alias.toUpperCase()}" añadid@ con éxito.`); /* Carga contenido de la alerta */
        });
    }

    $goContact.on("click", function () { /* Detecta el click del botón "Entendido" en las alertas y las cierra */
        hideAlert($dlgContact);
    });
});

$(document).ready(function () {
    const $dlgDelete = $("#dlgDelete"); /* Alerta de confirmación para eliminar contacto */
    const $cancelDelete = $("#cancelDelete"); /* Botón "Cancelar" de la alerta */
    const $delContact = $("#delContact"); /* Botón para eliminar contacto */
    const $goDelete = $("#goDelete"); /* Botón para confirmar eliminar contacto */

    $delContact.on("click", function (e) { /* Detecta click en el botón */
        e.preventDefault();

        showAlert($dlgDelete); /* Muestra la alerta */
    });

    $cancelDelete.on("click", function () { /* Detecta click en el botón */
        hideAlert($dlgDelete); /* Cierra la alerta */
        $listCancel.trigger("click"); /* Cierra la lista de contactos */
    });

    $goDelete.on("click", function (e) { /* Detecta click en el botón */
        e.preventDefault();

        const usuario = getUsuarioActivo(); /* Obtiene el usuario activo */
        const $dlgDelAddData = $("#dlgDelAddData"); /* Contenido de la alerta */

        if (!selectedContact) { /* Si no hay contacto seleccionado */
            $("#dlgData").text("Seleccione un contacto"); /* Carga mensaje en la alerta */
            showAlert($dlgUser, 3000); /* Muestra la alerta por 3 segundos */
            return;
        }

        usuario.contactos = (usuario.contactos || []) /* Obtiene el array de contactos, pero sin el contacto recién eliminado */
            .filter(c => c.cuenta !== selectedContact.cuenta);

        guardarUsuario(usuario); /* Actualiza el usuario, pero ahora con esa nueva lista de contactos */

        hideAlert($dlgDelete); /* Cierra la alerta de confirmación */
        showAlert($dlgDelAdd, 3000); /* Muestra la alerta de éxito por 3 segundos */
        $dlgDelAddData.text(`${selectedContact.alias} eliminado con éxito.`); /* Carga contenido de la alerta */

        setTimeout(function () { /* Espera 3 segundos antes de: */
            $contactSearchInput.val(""); /* Limpia el input que busca contacto */
            $contactList.empty(); /* Limpia la lista de contactos */
            selectedContact = null; /* Limpia el contacto seleccionado */
            return;
        }, 3000);
    });

    $goDelAdd.on("click", function () { /* Detecta click en el botón "Entendido" de las alertas por validación */
        hideAlert($dlgDelAdd);
    });
});

$contactSearchInput.on("input", function () { /* Detecta el input en el buscador de contactos */
    const valor = $(this).val().trim(); /* Obtiene el valor del input */

    if (valor.length === 0) { /* Al limpiar el input se limpia la busqueda */
        resetBuscadorContactos();
        return;
    }

    filtrarContactos(valor); /* Utiliza lo ingresado al input para filtrar la lista de contactos */
    $contactList.removeClass("d-none"); /* Muestra la lista de contactos */
    $listCancel.removeClass("d-none"); /* Muestra el botón para cancelar la busqueda */
});

$contactSearchInput.on("keydown", function (e) { /* Detecta uso de teclado en el buscador */
    const $items = $contactList.find(".contact-item");
    if (!$items.length) return;

    switch (e.key) { /* El resto del indice + 1 al dividir entre la cantidad de items en la lista */
        case "ArrowDown": /* siempre será el propio valor indice + 1, a menos que llegue al tope de la lista, donde se volverá 0, osea regresa al inicio */
            e.preventDefault();
            activeContactIndex =
                (activeContactIndex + 1) % $items.length;
            break;

        case "ArrowUp": /* Caso contrario, cuando indice - 1 sea 0, el resto será el tope de la lista, pasando al final */
            e.preventDefault();
            activeContactIndex =
                (activeContactIndex - 1 + $items.length) % $items.length;
            break;

        case "Enter": /* Equivale a hacer click sobre el contacto */
            e.preventDefault();
            if (activeContactIndex >= 0) {
                $items.eq(activeContactIndex).trigger("click");
            }
            return;

        default:
            return;

        case "Escape": /* Equivale a hacer click sobre el botón cancelar de la busqueda */
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

$listCancel.on("click", function () { /* Detecta click en botón para cancelar la busqueda de un contacto */
    resetBuscadorContactos();
});

$contactList.on("click", ".contact-item", function () { /* Detecta click en un contacto de la lista */
    const index = $(this).data("index"); /* Toma indice del contacto seleccionado */
    const usuario = getUsuarioActivo(); /* Obtiene el usuario activo */
    const contactos = usuario.contactos || []; /* Obtiene el array de contactos */

    selectedContact = contactos[index]; /* Carga el contacto seleccionado desde el array */

    $contactList.find(".contact-item").removeClass("active kb-hover"); /* Encuentra el elemento y le aplica clases para estilos css */
    $(this).addClass("active");

    $dlgSelectedContact.removeClass("d-none").addClass("d-flex"); /* Despliega contenedor con botones para elegir acción, asegura display flex para que los botones tengan las posiciones esperadas */
});

$contactList.on("mouseenter", ".contact-item", function () { /* Detecta el mouse sobre un elemento de l alista, para aplicar clases para estilos css */
    activeContactIndex = $(this).index();
    $contactList.find(".contact-item").removeClass("kb-hover");
});