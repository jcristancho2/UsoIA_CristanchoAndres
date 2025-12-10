// script.js
const API_URL = 'https://69331ac9e5a9e342d271ef8c.mockapi.io/customers';

let allCustomers = [];
let filteredCustomers = [];
let editingId = null; // id (string) que devuelve MockAPI cuando editas
const schema = [
    // Lista completa de campos que queremos manejar (basada en el objeto que compartiste)
    { key: 'id', type: 'string', editable: false },
    { key: 'customerId', type: 'number', editable: false }, // nuestro autoincrementable
    { key: 'name', type: 'string', editable: true },
    { key: 'email', type: 'string', editable: true },
    { key: 'productPurchased', type: 'string', editable: true },
    { key: 'category', type: 'string', editable: true },
    { key: 'purchaseDate', type: 'date', editable: true },
    { key: 'amountSpent', type: 'number', editable: true },
    { key: 'age', type: 'number', editable: true },
    { key: 'gender', type: 'string', editable: true },
    { key: 'city', type: 'string', editable: true },
    { key: 'state', type: 'string', editable: true },
    { key: 'country', type: 'string', editable: true },
    { key: 'zipCode', type: 'string', editable: true },
    { key: 'paymentMethod', type: 'string', editable: true },
    { key: 'lastLoginDate', type: 'date', editable: true },
    { key: 'membershipStatus', type: 'string', editable: true },
    { key: 'numberOfOrders', type: 'number', editable: true },
    { key: 'averageOrderValue', type: 'number', editable: true },
    { key: 'preferredShippingMethod', type: 'string', editable: true },
    { key: 'accountCreatedDate', type: 'date', editable: true },
    { key: 'customerLifetimeValue', type: 'number', editable: true },
    { key: 'lastPurchaseDaysAgo', type: 'number', editable: true },
    { key: 'cartAbandonmentCount', type: 'number', editable: true },
    { key: 'wishlistItems', type: 'number', editable: true },
    { key: 'newsletterSubscribed', type: 'boolean', editable: true },
    { key: 'customerSegment', type: 'string', editable: true },
    { key: 'deviceUsed', type: 'string', editable: true },
    { key: 'sessionDurationMinutes', type: 'number', editable: true },
    { key: 'pageViews', type: 'number', editable: true },
    { key: 'returnRate', type: 'number', editable: true },
    { key: 'customerSatisfactionScore', type: 'number', editable: true },
    { key: 'referralSource', type: 'string', editable: true }
];

// ------------------------
// HELPERS
// ------------------------
function byId(id) { return document.getElementById(id); }

function formatCurrency(value) {
    if (value === undefined || value === null || isNaN(value)) return '$0.00';
    return '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseDateForInput(val) {
    if (!val) return '';
    // intenta parsear '2024-04-25' o ISO
    const d = new Date(val);
    if (isNaN(d)) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ------------------------
// AUTOINCREMENT customerId
// ------------------------
async function getNextCustomerId() {
    // usa allCustomers ya cargado si está, sino trae datos
    try {
        if (!allCustomers || allCustomers.length === 0) {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Error leyendo API para calcular nextId');
            allCustomers = await res.json();
        }
    } catch (err) {
        console.warn('No se pudo precargar allCustomers para nextId, fallback', err);
    }

    const max = allCustomers.reduce((acc, c) => {
        const n = Number(c.customerId ?? c.id ?? 0);
        if (!isNaN(n)) return Math.max(acc, n);
        return acc;
    }, 0);

    return max + 1;
}

// ------------------------
// FETCH / CRUD
// ------------------------
async function fetchCustomers() {
    try {
        showLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar los datos');
        const data = await res.json();
        allCustomers = data;
        filteredCustomers = data;
        renderTable(filteredCustomers);
        showLoading(false);
    } catch (err) {
        showError('Error al conectar con la API: ' + (err.message || err));
        showLoading(false);
    }
}

async function createCustomer(customerData) {
    try {
        // customerData debe incluir customerId numérico
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        if (!res.ok) throw new Error('Error al crear el cliente');
        await fetchCustomers();
        return true;
    } catch (err) {
        showError('Error al crear el cliente: ' + (err.message || err));
        return false;
    }
}

async function updateCustomer(id, customerData) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        if (!res.ok) throw new Error('Error al actualizar el cliente');
        await fetchCustomers();
        return true;
    } catch (err) {
        showError('Error al actualizar el cliente: ' + (err.message || err));
        return false;
    }
}

async function deleteCustomerAPI(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar el cliente');
        await fetchCustomers();
        return true;
    } catch (err) {
        showError('Error al eliminar el cliente: ' + (err.message || err));
        return false;
    }
}

// ------------------------
// UI helpers
// ------------------------
function showLoading(show) {
    const li = byId('loadingIndicator');
    const table = byId('customersTable');
    if (li) li.style.display = show ? 'block' : 'none';
    if (table) table.style.display = show ? 'none' : 'table';
}

function showError(msg) {
    const el = byId('errorMessage');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
}

// ------------------------
// FILTROS
// ------------------------
function filterCustomers() {
    const searchTerm = byId('searchInput').value.toLowerCase();

    filteredCustomers = allCustomers.filter(c => {
        const matchesSearch =
            (c.name && c.name.toLowerCase().includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm)) ||
            (c.productPurchased && c.productPurchased.toLowerCase().includes(searchTerm));
        return matchesSearch;
    });

    renderTable(filteredCustomers);
}

// ------------------------
// RENDER TABLA
// ------------------------
function renderTable(data) {
    const tbody = byId('tableBody');
    const noData = byId('noData');
    const table = byId('customersTable');

    if (!tbody || !noData || !table) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = '';
        noData.style.display = 'block';
        table.style.display = 'none';
        return;
    }

    noData.style.display = 'none';
    table.style.display = 'table';

    tbody.innerHTML = data.map(c => {
        const idShown = c.customerId ?? c.id;
        const amount = c.amountSpent ?? 0;
        const membership = c.membershipStatus ?? 'N/A';
        const sat = (c.customerSatisfactionScore !== undefined && c.customerSatisfactionScore !== null) ? c.customerSatisfactionScore : 'N/A';

        return `
            <tr>
                <td>${idShown}</td>
                <td>${c.name ?? 'N/A'}</td>
                <td>${c.email ?? 'N/A'}</td>
                <td>${c.productPurchased ?? 'N/A'}</td>
                <td>${c.category ?? 'N/A'}</td>
                <td>${formatCurrency(amount)}</td>
                <td><span class="badge badge-${String(membership).toLowerCase()}">${membership}</span></td>
                <td>${sat}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-small" onclick="viewDetails('${c.id}')">Detalles</button>
                    <button class="btn btn-warning btn-small" onclick="editCustomer('${c.id}')">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCustomer('${c.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ------------------------
// STATS
// ------------------------


// ------------------------
// FORM DYNAMIC EXTRA FIELDS
// ------------------------
function ensureExtraFieldsContainer() {
    let extra = byId('extraFields');
    if (!extra) {
        extra = document.createElement('div');
        extra.id = 'extraFields';
        // APLICAR CLASE GRID AQUÍ
        extra.className = 'form-grid extra-fields'; 
        
        // Insert after the form-grid (existing in HTML)
        const formGrid = document.querySelector('#customerForm > .form-grid');
        const form = byId('customerForm');

        if (formGrid && formGrid.parentNode) {
             // Insertar DESPUÉS del form-grid principal y ANTES del contenedor de botones.
             // (Esto requiere un pequeño cambio en el HTML para aislar los botones)
            formGrid.parentNode.insertBefore(extra, formGrid.nextSibling);
        } else if (form) {
            form.appendChild(extra);
        }
    }
    return extra;
}

function buildExtraFields(customer = {}, readonly = false) {
    const container = ensureExtraFieldsContainer();
    container.innerHTML = ''; // limpiar

    // Lista de IDs de campos preexistentes en el HTML
    const existingFieldIds = [
        'name', 'email', 'productPurchased', 'category', 'amountSpent', 'age', 
        'gender', 'city', 'state', 'paymentMethod', 'membershipStatus', 
        'preferredShippingMethod', 'customerSatisfactionScore'
    ];


    // Creamos inputs para todos los campos del schema que NO están ya en el HTML
    schema.forEach(field => {
        const key = field.key;
        
        // 1. MANEJO DE CAMPOS ESTÁTICOS
        if (existingFieldIds.includes(key)) {
            const existing = byId(key);
            if (existing) {
                const val = customer[key];
                
                // Asignar valor
                if (val !== undefined && val !== null) {
                    if (field.type === 'date') existing.value = parseDateForInput(val);
                    else if (field.type === 'boolean') existing.checked = Boolean(val);
                    else existing.value = val;
                } else {
                    // Limpiar al iniciar, o si el valor de la API es nulo
                    if (readonly === false) existing.value = '';
                }
                
                // Aplicar readOnly y disabled
                existing.readOnly = readonly || !field.editable;
                if (existing.type === 'checkbox') existing.disabled = readonly;
                return;
            }
        }
        
        // 2. MANEJO DE CAMPOS DINÁMICOS
        
        // Omitir campos no editables si no estamos en modo solo lectura (viewDetails)
        if (readonly === false && field.editable === false) {
            return; 
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group extra';

        const label = document.createElement('label');
        label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + (field.editable ? '' : ' (no editable)');

        let input;
        switch (field.type) {
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.step = (key.includes('rate') || key.includes('average') || key.includes('value')) ? '0.01' : '1';
                break;
            case 'date':
                input = document.createElement('input');
                input.type = 'date';
                break;
            case 'boolean':
                input = document.createElement('input');
                input.type = 'checkbox';
                // Añadir clase especial para que el CSS maneje el layout de checkbox en Grid/Flex
                wrapper.classList.add('checkbox-group'); 
                break;
            default:
                input = document.createElement('input');
                input.type = 'text';
        }

        input.id = key;
        input.name = key;
        
        // Aplicar estado de solo lectura/deshabilitado
        input.readOnly = readonly || !field.editable;
        if (field.type === 'checkbox') input.disabled = readonly;

        // Asignar valores
        if (customer[key] !== undefined && customer[key] !== null) {
            if (field.type === 'date') input.value = parseDateForInput(customer[key]);
            else if (field.type === 'boolean') input.checked = Boolean(customer[key]);
            else input.value = customer[key];
        } else {
            // Aplicar valores por defecto al crear o si el valor es nulo
            if (field.type === 'number') input.value = '';
            else if (field.type === 'boolean') input.checked = false;
            else input.value = '';
        }

        // Estructura final
        if (field.type === 'boolean') {
            wrapper.appendChild(input);
            wrapper.appendChild(label); // Checkbox: Input antes del Label
        } else {
            wrapper.appendChild(label);
            wrapper.appendChild(input); // Text/Number/Date: Label antes del Input
        }
        
        container.appendChild(wrapper);
    });
}

// ------------------------
// RECOGER DATOS DEL FORMULARIO (TODOS LOS CAMPOS DEL SCHEMA)
// ------------------------
function collectFormData() {
    const obj = {};
    schema.forEach(field => {
        const el = byId(field.key);
        if (!el) {
            obj[field.key] = null;
            return;
        }
        if (field.type === 'number') {
            const v = el.value;
            obj[field.key] = v === '' || v === null ? null : Number(v);
        } else if (field.type === 'boolean') {
            obj[field.key] = el.checked === true;
        } else if (field.type === 'date') {
            obj[field.key] = el.value ? el.value : null;
        } else {
            obj[field.key] = el.value !== '' ? el.value : null;
        }
    });
    return obj;
}

// ------------------------
// ABRIR MODAL PARA NUEVO (openModal ya existe en HTML)
// ------------------------
function openModal() {
    editingId = null;
    byId('modalTitle').textContent = 'Nuevo Cliente';
    const form = byId('customerForm');
    form.reset();

    // Asegurarnos campos preexistentes limpios
    schema.forEach(field => {
        const el = byId(field.key);
        if (el) {
            if (field.type === 'boolean') el.checked = false;
            else if (field.type === 'string' && el.tagName === 'SELECT') el.value = 'Seleccionar';
            else el.value = '';
            
            // Reestablecer readonly/disabled para edición
            el.readOnly = !field.editable;
            if (el.type === 'checkbox') el.disabled = false;
        }
    });

    buildExtraFields({}, false);
    byId('saveBtn').style.display = 'inline-flex'; // Mostrar botón de guardar
    byId('customerModal').classList.add('active');
}

// ------------------------
// CERRAR MODAL
// ------------------------
function closeModal() {
    byId('customerModal').classList.remove('active');
    editingId = null;
}

// ------------------------
// GUARDAR (CREAR O ACTUALIZAR)
// ------------------------
async function saveCustomer(e) {
    e.preventDefault();
    const saveBtn = byId('saveBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-340Zm-40 180v-80h80v80h-80Zm0-180v-80h80v80h-80Z"/></svg> Guardando...';

    try {
        // Si es creación -> generar customerId autoincrementable
        let cid = null;
        if (!editingId) {
            cid = await getNextCustomerId();
        }

        // recolectar todos los campos
        const data = collectFormData();

        // asignar customerId si es creación
        if (!editingId) data.customerId = cid;

        // Si está vacío el accountCreatedDate y es creación, poner hoy
        if (!editingId && !data.accountCreatedDate) {
            data.accountCreatedDate = new Date().toISOString().slice(0, 10);
        }

        // POST o PUT
        let success = false;
        if (editingId) {
            // Mantener el campo id (MockAPI lo necesita); si user cambió customerId en edición, lo actualizará.
            // En el cuerpo enviamos el objeto completo (incluyendo customerId)
            success = await updateCustomer(editingId, data);
        } else {
            success = await createCustomer(data);
        }

        if (success) {
            closeModal();
        }
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q117 0 198.5 81.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H520q-33 0-56.5-23.5T440-240v-206l-64 62-56-56 160-160 160 160-56 56-64-62v206h220q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-83-58.5-141.5T480-720q-83 0-141.5 58.5T280-520h-20q-58 0-99 41t-41 99q0 58 41 99t99 41h100v80H260Zm220-280Z"/></svg> Guardar';
    }
}

// ------------------------
// EDITAR
// ------------------------
function editCustomer(id) {
    editingId = id;
    const customer = allCustomers.find(c => String(c.id) === String(id));
    if (!customer) return showError('Cliente no encontrado');

    byId('modalTitle').textContent = 'Editar Cliente';

    // Si hay inputs existentes (name,email,...) asignarlos y reestablecer readonly/disabled
    schema.forEach(field => {
        const el = byId(field.key);
        if (el) {
            const val = customer[field.key];
            if (field.type === 'date') el.value = parseDateForInput(val);
            else if (field.type === 'boolean') el.checked = Boolean(val);
            else el.value = val ?? '';

            el.readOnly = !field.editable;
            if (el.type === 'checkbox') el.disabled = false;
        }
    });

    buildExtraFields(customer, false);
    byId('saveBtn').style.display = 'inline-flex'; // Mostrar botón de guardar
    byId('customerModal').classList.add('active');
}

// ------------------------
// VER SOLO DETALLES (read-only)
// ------------------------
function viewDetails(id) {
    const customer = allCustomers.find(c => String(c.id) === String(id));
    if (!customer) return showError('Cliente no encontrado');

    byId('modalTitle').textContent = 'Detalles Cliente (solo lectura)';

    // Asignar campos existentes visibles
    schema.forEach(field => {
        const el = byId(field.key);
        if (el) {
            const val = customer[field.key];
            if (field.type === 'date') el.value = parseDateForInput(val);
            else if (field.type === 'boolean') el.checked = Boolean(val);
            else el.value = val ?? '';
            el.readOnly = true;
            if (el.type === 'checkbox') el.disabled = true;
        }
    });

    buildExtraFields(customer, true);
    byId('saveBtn').style.display = 'none'; // Ocultar botón de guardar en vista de detalles
    byId('customerModal').classList.add('active');
}

// ------------------------
// ELIMINAR
// ------------------------
async function deleteCustomer(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
    await deleteCustomerAPI(id);
}

// ------------------------
// INICIALIZACIÓN
// ------------------------
function init() {
    // eventos
    byId('searchInput').addEventListener('input', filterCustomers);
    byId('customerForm').addEventListener('submit', saveCustomer);

    // Si quieres mostrar estadisticas en el HTML, los ids deben existir; si no existen, no hay problema.
    fetchCustomers();
}

init();