$(document).ready(function () {
    verificarSesion();
});

function obtenerDatosSaldo() {
    const usuario = getUsuarioActivo();
    if (!usuario) return { labels: [], data: [] };

    const movimientos = usuario.historial || [];
    const saldoBase = Number(usuario.saldoBase) || 0;

    const labels = [];
    const data = [];

    let saldo = saldoBase;

    labels.push("Saldo Inicial");
    data.push(saldo);

    movimientos.forEach(mov => {
        saldo += Number(mov.monto);
        labels.push(mov.fecha);
        data.push(saldo);
    });

    return { labels, data };
}

function dibujarGraficoSaldo() {
    const canvas = document.getElementById("saldoChart");
    if (!canvas) return;

    const { labels, data } = obtenerDatosSaldo();

    if (labels.length === 0 || data.length === 0) {
        canvas.style.display = "none";
        return;
    }

    // ✔️ HAY DATOS → mostrar canvas
    canvas.style.display = "block";

    const ctx = canvas.getContext("2d");

    if (saldoChartInstance) {
        saldoChartInstance.data.labels = labels;
        saldoChartInstance.data.datasets[0].data = data;
        saldoChartInstance.update();
    } else {
        saldoChartInstance = new Chart(ctx, {
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

$(document).ready(function () {
    dibujarGraficoSaldo();
});

const usuario = getUsuarioActivo();
if (!usuario) {
    window.location.href = "../pages/login.html";
}

$(document).ready(function () {
    const usuario = getUsuarioActivo();
    if (!usuario) return;

    $("#bienvenida").text(`Bienvenido ${usuario.alias}`);
    $("#numeroCuentaAlke").text(`Cuenta Alke: ${usuario.numeroCuentaAlke}`);
});

$("#btnCopyCuenta").on("click", function () {
    const cuenta = getUsuarioActivo()?.numeroCuentaAlke;
    if (!cuenta) return;

    navigator.clipboard.writeText(cuenta.toString());

    $(this).text("Copiado ✔");
    setTimeout(() => {
        $(this).text("Copiar");
    }, 1500);
});