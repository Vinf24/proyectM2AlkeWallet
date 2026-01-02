function obtenerDatosSaldo() {
    const movimientos = JSON.parse(localStorage.getItem("historyTable")) || [];
    const saldoBase = Number(localStorage.getItem("saldoBase")) || 0;

    const labels = [];
    const data = [];

    let saldo = saldoBase;

    if (saldoBase > 0) {
        labels.push("Saldo Inicial");
        data.push(saldo);
    }

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