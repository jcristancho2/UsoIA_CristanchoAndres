// Cambia "todos" por el recurso real que tengas en MockAPI
const API_URL = "https://69331ac9e5a9e342d271ef8c.mockapi.io/todos";

const lista = document.getElementById("lista");
const txtNombre = document.getElementById("txtNombre");
const btnAgregar = document.getElementById("btnAgregar");

// ---------------------
// Cargar lista inicial
// ---------------------
async function cargarDatos() {
    lista.innerHTML = "Cargando...";

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        lista.innerHTML = "";
        data.forEach(x => crearItemDOM(x));
    } catch (e) {
        lista.innerHTML = "Error cargando datos...";
    }
}

// ---------------------
// Crear nuevo registro
// ---------------------
btnAgregar.addEventListener("click", async () => {
    const nombre = txtNombre.value.trim();
    if (nombre === "") return alert("Ingrese un nombre");

    const nuevo = { nombre };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });

    const data = await res.json();
    crearItemDOM(data);
    txtNombre.value = "";
});

// ---------------------
// Crear estructura visual
// ---------------------
function crearItemDOM(item) {
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.id = item.id;

    div.innerHTML = `
        <input type="text" value="${item.nombre}" disabled>
        <div class="acciones">
            <button class="btnHabilitar">Editar</button>
            <button class="btnGuardar" disabled>Guardar</button>
            <button class="btnEliminar">X</button>
        </div>
    `;

    const input = div.querySelector("input");
    const btnHabilitar = div.querySelector(".btnHabilitar");
    const btnGuardar = div.querySelector(".btnGuardar");

    // ---------------------
    // Habilitar edición
    // ---------------------
    btnHabilitar.onclick = () => {
        input.disabled = false;
        input.focus();
        btnGuardar.disabled = false;
        btnHabilitar.disabled = true; 
        div.classList.add("editando");
    };

    // ---------------------
    // Guardar cambios
    // ---------------------
    btnGuardar.onclick = async () => {
        const nuevoNombre = input.value.trim();

        await fetch(`${API_URL}/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
        });

        input.disabled = true;
        btnGuardar.disabled = true;
        btnHabilitar.disabled = false;
        div.classList.remove("editando");

        alert("Actualizado");
    };

    // ---------------------
    // Eliminar
    // ---------------------
    div.querySelector(".btnEliminar").onclick = async () => {
        await fetch(`${API_URL}/${item.id}`, { method: "DELETE" });
        div.remove();
    };

    lista.appendChild(div);
}

// Inicializar
cargarDatos();
