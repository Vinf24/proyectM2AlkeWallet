function obtenerDatosSaldo() {
    const movimientos = JSON.parse(localStorage.getItem("historyTable")) || [];
    const saldoBase = Number(localStorage.getItem("saldoBase")) || 0;

    const labels = [];
    const data = [];

    let saldo = saldoBase;


    // Si no hay movimientos, no dibujamos gráfico
    if (saldoBase > 0) {
        labels.push("Saldo Inicial");
        data.push(saldo);
    }

    // Ahora avanzamos normalmente
    movimientos.forEach(mov => {
        saldo += Number(mov.monto);
        labels.push(mov.fecha);
        data.push(saldo);
    });

    return { labels, data };
}

function dibujarGraficoSaldo() {
    const ctx = document.getElementById("saldoChart");
    if (!ctx) return;

    const { labels, data } = obtenerDatosSaldo();

    const finalLabels = labels.length ? labels : ["Saldo"];
    const finalData = data.length ? data : [Number(localStorage.getItem("saldo")) || 0];

    if (saldoChartInstance) {
        saldoChartInstance.data.labels = finalLabels;
        saldoChartInstance.data.datasets[0].data = finalData;
        saldoChartInstance.update();
    } else {
        saldoChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: finalLabels,
                datasets: [{
                    label: "Saldo",
                    data: finalData,
                    tension: 0.3,
                    fill: true,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
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