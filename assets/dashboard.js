let dias = [
    "Dia1",
    "Dia2"
];

function renderizarDias() {
    const cont = document.getElementById("listaDias");
    cont.innerHTML = "";

    dias.forEach(dia => {
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = dia;
        link.onclick = () => {
            document.getElementById("iframeVisor").src = `${dia}/index.html`;
        };
        cont.appendChild(link);
    });
}

document.getElementById("btnAgregar").addEventListener("click", () => {
    const nuevo = prompt("Ingresa el nombre de la nueva carpeta (Ej: Dia#):");

    if (!nuevo) return;

    if (!nuevo.startsWith("Dia")) {
        alert("El nombre debe comenzar por 'Dia'. Ejemplo: Dia#");
        return;
    }

    if (dias.includes(nuevo)) {
        alert("Ese día ya está registrado.");
        return;
    }

    dias.push(nuevo);
    renderizarDias();
});

renderizarDias();
