const API_URL = 'https://rickandmortyapi.com/api';

function mostrarError(mensaje) {
    document.getElementById('resultados').innerHTML = `
        <div class="error">
            <h3>⚠️ Error</h3>
            <p>${mensaje}</p>
        </div>
    `;
}

async function buscarPersonajes() {
    const searchTerm = document.getElementById('id1').value.trim();

    if (!searchTerm) {
        mostrarError('Por favor ingresa un nombre para buscar');
        return;
    }

    try {
        let allCharacters = [];
        let page = 1;
        let hasMorePages = true;

        while (hasMorePages) {
            const response = await fetch(
                `${API_URL}/character?name=${searchTerm}&page=${page}`
            );
            
            if (!response.ok) {
                if (page === 1) {
                    throw new Error('No se encontraron personajes con ese nombre');
                }
                hasMorePages = false;
                break;
            }

            const data = await response.json();
            allCharacters = allCharacters.concat(data.results);

            if (data.info.next) {
                page++;
            } else {
                hasMorePages = false;
            }
        }

        mostrarPersonajes(allCharacters, searchTerm);

    } catch (error) {
        mostrarError(error.message);
    }
}

function mostrarPersonajes(personajes, busqueda) {
    const resultadosDiv = document.getElementById('resultados');

    const personajesHTML = personajes.map(personaje => {
        const statusClass = personaje.status.toLowerCase();
        return `
            <div class="character-card">
                <img src="${personaje.image}" alt="${personaje.name}">
                <div class="character-info">
                    <div class="character-name">${personaje.name}</div>
                    <div class="character-detail">
                        <span class="status ${statusClass}"></span>
                        ${personaje.status}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    resultadosDiv.innerHTML = `
        <div class="characters-container">
            ${personajesHTML}
        </div>
    `;
}


document.getElementById('id1').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buscarPersonajes();
    }
});


document.querySelector('.contbutton1').addEventListener('click', buscarPersonajes);
