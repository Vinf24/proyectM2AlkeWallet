const $dlgDeposit = $("#dlgDeposit");

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

            const saldoActual = Number(localStorage.getItem("saldo")) || 0;
            const nuevoSaldo = saldoActual + monto;
            localStorage.setItem("saldo", nuevoSaldo);

            let movimientos = JSON.parse(localStorage.getItem("historyTable")) || [];
            movimientos.push({
                cliente: "Propio",
                monto: monto,
                fecha: new Date().toLocaleDateString("es-CL"),
                tipo: "Depósito"
            });

            if (movimientos.length > 5) {
                movimientos.shift();
            }

            localStorage.setItem("historyTable", JSON.stringify(movimientos));

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