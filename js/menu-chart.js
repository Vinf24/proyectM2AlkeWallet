$(document).ready(function () { /* Si no hay usuario declarado vuelve a index */
    verificarSesion();
});

function obtenerDatosSaldo() { /* Declara función */
    const usuario = getUsuarioActivo(); /* Obtiene el usuario */
    if (!usuario) return { labels: [], data: [] }; /* Si no hay usuario entrega arrays vacios */

    const labels = []; /* Si hay usuario, tambien, pero continuando el código */
    const data = [];

    const movimientos = usuario.historial || []; /* Ontiene datos del usuario, historial y saldoBase (primer punto del gráfico) */
    const saldoBase = Number(usuario.saldoBase) || 0;

    let saldo = saldoBase; /* Declara saldo  */

    labels.push("Saldo Inicial"); /* El punto inicial, antes de llevar registros, en vez de fecha indica que es el saldo inicial */
    data.push(saldo);

    movimientos.forEach(mov => { /* Para cada movimiento carga fecha y saldo, armando el gráfico */
        saldo += Number(mov.monto); /* Para obtener el saldo de cada momento, aplica el monto de la transacción */
        labels.push(mov.fecha);
        data.push(saldo);
    });

    return { labels, data };
}

function dibujarGraficoSaldo() {
    const canvas = document.getElementById("saldoChart"); /* Obtiene el elemento a partir de su id */
    if (!canvas) return;

    const { labels, data } = obtenerDatosSaldo();

    if (labels.length === 0 || data.length === 0) {
        canvas.style.display = "none";
        return;
    }

    // Si hay datos muestra canvas
    canvas.style.display = "block";

    const ctx = canvas.getContext("2d"); /* Contexto de dibujo */

    if (saldoChartInstance) { /* Para evitar duplicados, lo "actualiza" si ya existe */
        saldoChartInstance.data.labels = labels;
        saldoChartInstance.data.datasets[0].data = data;
        saldoChartInstance.update();
    } else {
        saldoChartInstance = new Chart(ctx, { /* Si no, crea uno */
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Saldo",
                    data,
                    tension: 0.3,
                    fill: true,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => `$${value}`
                        }
                    }
                }
            }
        });
    }
}

$(document).ready(function () { /* Dibuja el gráfico una vez la página esta cargada */
    dibujarGraficoSaldo();
});

$(document).ready(function () {
    const usuario = getUsuarioActivo(); /* Entrega el usuario activo */
    if (!usuario) return;

    $("#bienvenida").text(`Bienvenido ${usuario.alias}`); /* Bienvenida personalizada */
    $("#numeroCuentaAlke").text(`N° Alke: ${usuario.numeroCuentaAlke}`); /* Muestra la cuenta Alke */
});

$("#btnCopyCuenta").on("click", function () { /* Detecta click en botón copiar */
    const cuenta = getUsuarioActivo()?.numeroCuentaAlke;
    if (!cuenta) return;

    navigator.clipboard.writeText(cuenta.toString()); /* Escribe el numero de cuenta en el portapapeles */

    $(this).text("Copiado ✔"); /* Cambia el contenido del botón temporalmente */
    setTimeout(() => {
        $(this).text("Copiar");
    }, 1500);
});