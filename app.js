const currentPath = window.location.pathname;
const isIndexPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');
const isLoggedInUser = sessionStorage.getItem('isLoggedIn') === 'true';

if (!isLoggedInUser && !isIndexPage) {
    window.location.href = 'index.html'; 
} else if (isLoggedInUser && isIndexPage) {
    window.location.href = 'lista.html'; 
}

const urlParams = new URLSearchParams(window.location.search);
const agenteId = urlParams.get('id');

document.addEventListener("DOMContentLoaded", () => {
    const paginas = ['agente', 'wengines', 'discos', 'bangboo', 'sinergia'];
    paginas.forEach(pag => {
        const link = document.getElementById(`link-${pag}`);
        if (link) {
            link.href = agenteId ? `${pag}.html?id=${agenteId}` : `${pag}.html`;
            if (window.location.pathname.includes(`${pag}.html`)) {
                link.classList.add('active');
            }
        }
    });
    
    if (isLoggedInUser && !isIndexPage) {
        const subtitle = document.querySelector('.subtitle');
        if (subtitle && !document.getElementById('btn-logout')) {
            const btnLogout = document.createElement('button');
            btnLogout.id = 'btn-logout';
            btnLogout.textContent = 'Cerrar Sesión';
            btnLogout.style.marginLeft = '15px';
            btnLogout.style.padding = '5px 10px';
            btnLogout.style.fontSize = '0.7rem';
            btnLogout.addEventListener('click', () => {
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = 'index.html';
            });
            subtitle.appendChild(btnLogout);
        }
    }

    cargarXML();
});

/**
 * Carga el archivo database.xml mediante la API Fetch,
 * lo parsea a un documento XML y lo envía al enrutador.
 */
function cargarXML() {
    fetch('database.xml')
        .then(response => {
            if (!response.ok) throw new Error("Error cargando base de datos XML");
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            enrutarRender(xmlDoc);
        })
        .catch(err => console.error("Error de Sistema:", err));
}

/**
 * Enrutador principal de la aplicación.
 * Dependiendo de la ruta actual (URL), ejecuta la función de renderizado adecuada
 * y configura los event listeners para los filtros y el login.
 * @param {Document} xml - El documento XML parseado con la base de datos.
 */
function enrutarRender(xml) {
    const path = window.location.pathname;
    
    if (path.includes('agente.html')) renderAgente(xml, agenteId);
    else if (path.includes('wengines.html')) {
        renderWEngines(xml, agenteId); 

        const aplicarFiltrosWEngines = () => {
            const nombre = document.getElementById('filtro-wengine-nombre') ? document.getElementById('filtro-wengine-nombre').value.toLowerCase() : "";
            const rareza = document.getElementById('filtro-wengine-rareza') ? document.getElementById('filtro-wengine-rareza').value : "";
            
            renderWEngines(xml, agenteId, nombre, rareza);
        };

        const inputs = ['filtro-wengine-nombre', 'filtro-wengine-rareza'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(id === 'filtro-wengine-nombre' ? 'input' : 'change', aplicarFiltrosWEngines);
        });
    }
    else if (path.includes('bangboo.html')) renderBangboo(xml, agenteId); // Recomendable convertir también a tabla
    else if (path.includes('discos.html')) renderDiscos(xml, agenteId);
    else if (path.includes('sinergia.html')) renderEquipos(xml, agenteId);
    else if (path.includes('lista.html')) {
        renderLista(xml);

        const aplicarFiltros = () => {
            const texto = document.getElementById('filtro-texto') ? document.getElementById('filtro-texto').value.toLowerCase() : "";
            const rareza = document.getElementById('filtro-rareza') ? document.getElementById('filtro-rareza').value : "";
            const elemento = document.getElementById('filtro-elemento') ? document.getElementById('filtro-elemento').value : "";
            const estilo = document.getElementById('filtro-estilo') ? document.getElementById('filtro-estilo').value : "";
            
            renderLista(xml, texto, rareza, elemento, estilo);
        };

        const inputs = ['filtro-texto', 'filtro-rareza', 'filtro-elemento', 'filtro-estilo'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(id === 'filtro-texto' ? 'input' : 'change', aplicarFiltros);
        });

    }
    else if (isIndexPage) {
        // Validación
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', () => {
                const user = document.getElementById('user').value;
                const pass = document.getElementById('pass').value;
                
                // Validación
                const xmlUser = xml.querySelector('user').textContent;
                const xmlPass = xml.querySelector('pass').textContent;
                let valido = (user === xmlUser && pass === xmlPass);

                const msg = document.getElementById('login-msg');
                msg.style.color = valido ? "var(--accent-neon)" : "var(--accent-red)";
                
                if (valido) {
                    msg.textContent = "Acceso concedido. Redirigiendo a la base de datos...";
                    sessionStorage.setItem('isLoggedIn', 'true');
                    setTimeout(() => window.location.href = 'lista.html', 800);
                } else {
                    msg.textContent = "Alerta: Credenciales inválidas.";
                }
            });
        }
    }
}

/**
 * Renderiza el perfil básico del Agente leyendo la información del XML,
 * incluyendo sus estadísticas clave y su cita textual personalizada.
 * @param {Document} xml - El documento XML parseado.
 * @param {string} id - El ID identificador del agente obtenido de la URL.
 */
function renderAgente(xml, id) {
    const item = xml.querySelector(`agente[id="${id}"]`);
    const ctx = document.getElementById('agente-ctx');
    if (!item) return ctx.innerHTML = "<p>Agente no registrado.</p>";
    const nombre = item.querySelector('nombre').textContent;
    const img = item.querySelector('imagen_perfil').textContent;
    ctx.innerHTML = `
        <div class="dashboard-grid">
            <div class="card-zzz border-s" style="text-align:center;">
                <div style="width:100%; height:250px; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                    <div class="film-frame" style="transform: scale(2); margin: 0;">
                        <img src="./${img}" alt="Perfil de ${nombre}">
                        <div class="vhs-label"># ${nombre}</div>
                    </div>
                </div>
                <h2 style="font-size:2.2rem; color:var(--accent-red); margin:5px 0;">${nombre}</h2>
                <p style="text-transform:uppercase; color:var(--text-muted); font-size:0.85rem;">${item.querySelector('faccion').textContent}</p>
            </div>
            <div class="card-zzz border-s">
                <h3>Perfil de Verificación Ciudadana</h3>
                <hr style="border-color:var(--accent-red); margin-bottom:15px;">
                <p><strong>Rareza:</strong> <span class="badge-rarity">${item.querySelector('rango').textContent}</span></p>
                <p><strong>Atributo Elemental:</strong> <span style="color:var(--accent-neon);">${item.querySelector('atributo').textContent}</span></p>
                <p><strong>Estilo de Combate:</strong> ${item.querySelector('estilo').textContent}</p>
            </div>
        </div>`;
    
    const citaCtx = document.getElementById('dinamic-cita-ctx');
    if (citaCtx) {
        const textoCita = item.querySelector('cita') ? item.querySelector('cita').textContent : "Registro sin citas registradas.";
        citaCtx.innerHTML = `
            <h3 style="color: var(--text-muted); font-size: 0.9rem;">Introducción oficial</h3>
            <blockquote cite="" style="font-style: italic; color: var(--text-main); margin: 0;">
                "${textoCita}"
            </blockquote>`;
    }
}

/**
 * Renderiza los conjuntos de discos (Drive Discs) recomendados para el agente.
 * @param {Document} xml - El documento XML parseado.
 * @param {string} id - El ID del agente.
 */
function renderDiscos(xml, id) {
    const relacion = xml.querySelector(`drive_discs[id_agente="${id}"]`);
    const ctx = document.getElementById('discos-ctx');
    if (!relacion) return;

    const spNode = relacion.querySelector('set_principal');
    const ssNode = relacion.querySelector('set_secundario');
    const spDef = xml.querySelector(`disco_def[id="${spNode.getAttribute('id_disco')}"]`);
    const ssDef = xml.querySelector(`disco_def[id="${ssNode.getAttribute('id_disco')}"]`);

    ctx.innerHTML = `
        <div class="dashboard-grid">
            <div class="card-zzz border-s">
                <h3>Conjuntos Recomendados</h3>
                <hr style="border-color:var(--accent-neon); margin-bottom:15px;">
                
                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    <img src="${spDef.querySelector('imagen_disco').textContent}" alt="Disco ${spDef.querySelector('nombre').textContent}" style="width: 70px; height: 70px; object-fit: contain; background: #111; border-radius: 8px; border: 1px solid var(--text-muted); padding: 5px;">
                    <div>
                        <h4 style="color: var(--accent-neon); margin: 0 0 5px 0; font-size: 1rem;">${spDef.querySelector('nombre').textContent} (x${spNode.getAttribute('piezas')})</h4>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; line-height: 1.3;">${spDef.querySelector('efecto').textContent}</p>
                    </div>
                </div>

                <div style="display: flex; gap: 15px;">
                    <img src="${ssDef.querySelector('imagen_disco').textContent}" alt="Disco ${ssDef.querySelector('nombre').textContent}" style="width: 70px; height: 70px; object-fit: contain; background: #111; border-radius: 8px; border: 1px solid var(--text-muted); padding: 5px;">
                    <div>
                        <h4 style="color: var(--rank-a); margin: 0 0 5px 0; font-size: 1rem;">${ssDef.querySelector('nombre').textContent} (x${ssNode.getAttribute('piezas')})</h4>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; line-height: 1.3;">${ssDef.querySelector('efecto').textContent}</p>
                    </div>
                </div>
            </div>
            <div class="card-zzz" style="border-top-color: var(--accent-neon);">
                <h3>Estadísticas Prioritarias</h3>
                <hr style="border-color:var(--text-muted); margin-bottom:15px;">
                <p><strong style="color:var(--accent-red);">Principales (IV, V, VI):</strong> ${relacion.querySelector('main_stats').textContent}</p>
                <p><strong style="color:var(--accent-neon);">Sub-stats:</strong> ${relacion.querySelector('sub_stats').textContent}</p>
            </div>
        </div>`;
}

/**
 * Renderiza la información del Bangboo (mascota asistente) recomendado para el agente.
 * @param {Document} xml - El documento XML parseado.
 * @param {string} id - El ID del agente.
 */
function renderBangboo(xml, id) {
    const relacion = xml.querySelector(`bangboo_agente[id_agente="${id}"]`);
    const ctx = document.getElementById('bangboo-ctx');
    if (!relacion) return;

    const def = xml.querySelector(`bangboo_def[id="${relacion.getAttribute('id_bangboo')}"]`);
    if (!def) return;

    ctx.innerHTML = `
        <div class="card-zzz border-s">
            <div style="text-align:left; margin-bottom:15px;"><img src="${def.querySelector('imagen_boo').textContent}" alt="Imagen de ${def.querySelector('nombre').textContent}" style="height:300px; object-fit:contain;"></div>
            <h2 style="color:var(--rank-s);">${def.querySelector('nombre').textContent}</h2>
            <p><strong>Rareza de Asistente:</strong> Rango ${def.querySelector('rareza').textContent}</p>
            <hr style="border-color:var(--text-muted); margin:15px 0;">
            <p><strong>Protocolo de Habilidad Activa:</strong></p>
            <p style="color:var(--text-muted);">${def.querySelector('habilidad').textContent}</p>
        </div>`;
}

/**
 * Renderiza la formación de equipo (sinergia) sugerida para el agente.
 * Despliega a los miembros del equipo como enlaces clickeables y muestra el orden de habilidades.
 * @param {Document} xml - El documento XML parseado.
 * @param {string} id - El ID del agente.
 */
function renderEquipos(xml, id) {
    const item = xml.querySelector(`equipo[id_agente="${id}"]`);
    const ctx = document.getElementById('sinergia-ctx');
    if (!item) return;
    const compText = item.querySelector('comp').textContent;
    const motivo = item.querySelector('motivo').textContent;
    // Separar los nombres del equipo
    const nombresAgentes = compText.split('+').map(n => n.trim());
    let imagenesHtml = '<div style="display: flex; gap: 15px; margin: 15px 0; justify-content: center; flex-wrap: wrap;">';
    nombresAgentes.forEach(nombre => {
        const agentesNodes = Array.from(xml.querySelectorAll('agentes > agente'));
        const agente = agentesNodes.find(a => a.querySelector('nombre').textContent.trim() === nombre);
        if (agente) {
            const img = agente.querySelector('imagen_perfil').textContent;
            const idAgenteRel = agente.getAttribute('id');
            imagenesHtml += `<div style="text-align: center; width: 100px;">
                <a href="agente.html?id=${idAgenteRel}" style="text-decoration: none;">
                    <div class="film-frame">
                        <img src="${img}" alt="${nombre}">
                    </div>
                    <p style="font-size: 0.85rem; margin-top: 5px; color: var(--text-main); font-weight: bold;">${nombre}</p>
                </a>
            </div>`;
        } else {
            imagenesHtml += `<div style="text-align: center; width: 100px;">
                <div class="film-frame">
                    <div style="position:relative; z-index:2; width: 100%; height: 100%; background: #111; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.65rem; text-transform: uppercase; text-align: center;">Sin<br>Datos</div>
                </div>
                <p style="font-size: 0.85rem; margin-top: 5px; color: var(--text-muted);">${nombre}</p>
            </div>`;
        }
    });
    imagenesHtml += '</div>';

    const skillsItem = xml.querySelector(`skills[id_agente="${id}"]`);
    let skillsHtml = '';
    if (skillsItem) {
        skillsHtml = `
            <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                <h4 style="color: var(--accent-neon); margin-bottom: 10px; font-size: 1.2rem;">Sugerencia de Optimización de Habilidades</h4>
                <p style="color:var(--text-muted); margin-bottom:10px; font-size: 0.9rem;">Ruta óptima de inversión de recursos de entrenamiento:</p>
                <p style="font-size: 1.1rem; font-weight: bold; letter-spacing: 1px;">${skillsItem.querySelector('orden').textContent}</p>
            </div>`;
    }

    ctx.innerHTML = `
        <div class="card-zzz" style="border-top-color:var(--accent-neon); text-align: center;">
            <h3>Equipo Recomendado</h3>
            ${imagenesHtml}
            <p style="text-align: left; margin-top: 20px;"><strong>Análisis Táctico:</strong></p>
            <p style="color:var(--text-muted); line-height:1.5; text-align: left;">${motivo}</p>
            ${skillsHtml}
        </div>`;
}

/**
 * Renderiza la lista principal de agentes en formato tabla con soporte para multi-filtrado.
 * @param {Document} xml - El documento XML parseado.
 * @param {string} [filtroText=""] - Filtro de texto para nombre o facción.
 * @param {string} [filtroRareza=""] - Filtro por rango (S, A).
 * @param {string} [filtroElem=""] - Filtro por atributo elemental.
 * @param {string} [filtroEstilo=""] - Filtro por estilo de combate.
 */
function renderLista(xml, filtroText = "", filtroRareza = "", filtroElem = "", filtroEstilo = "") {
    const agentes = xml.querySelectorAll('agentes > agente');
    const ctx = document.getElementById('lista-ctx');
    if (!ctx) return;

    let html = '<table class="tabla-datos"><thead><tr><th>Perfil</th><th>Nombre</th><th>Facción</th><th>Rango</th><th>Atributo</th><th>Estilo</th><th>Acción</th></tr></thead><tbody>';
    let encontrados = 0;

    agentes.forEach(agente => {
        const nombre = agente.querySelector('nombre').textContent;
        const faccion = agente.querySelector('faccion').textContent;
        const rango = agente.querySelector('rango').textContent;
        const atributo = agente.querySelector('atributo').textContent;
        const estilo = agente.querySelector('estilo').textContent;
        const pasaTexto = !filtroText || nombre.toLowerCase().includes(filtroText) || faccion.toLowerCase().includes(filtroText);
        const pasaRareza = !filtroRareza || rango === filtroRareza;
        const pasaElem = !filtroElem || atributo === filtroElem;
        const pasaEstilo = !filtroEstilo || estilo === filtroEstilo;

        if (pasaTexto && pasaRareza && pasaElem && pasaEstilo) {
            encontrados++;
            const id = agente.getAttribute('id');
            const img = agente.querySelector('imagen_perfil').textContent;
            
            html += `<tr>
                <td>
                    <div class="film-frame" style="margin: 0; transform: scale(0.75); transform-origin: left center;">
                        <img src="${img}" alt="Perfil de ${nombre}">
                    </div>
                </td>
                <td style="color:var(--accent-red); font-weight:bold; text-transform:uppercase;">${nombre}</td>
                <td style="color:var(--text-muted);">${faccion}</td>
                <td><span class="badge-rarity">${rango}</span></td>
                <td style="color:var(--accent-neon);">${atributo}</td>
                <td>${estilo}</td>
                <td><a href="agente.html?id=${id}" class="btn-accion">Analizar Archivo</a></td>
            </tr>`;
        }
    });
    
    if(encontrados === 0) html += '<tr><td colspan="7" style="text-align:center; color:var(--accent-red);">Sin resultados para los filtros seleccionados.</td></tr>';
    html += '</tbody></table>';
    ctx.innerHTML = html;
}

/**
 * Renderiza los W-Engines (armas) en formato tabla y soporta filtros.
 * Si se provee un ID de agente, muestra sus armas exclusivas. De lo contrario, muestra todas.
 * @param {Document} xml - El documento XML parseado.
 * @param {string|null} id - El ID del agente (opcional).
 * @param {string} [filtroNombre=""] - Filtro por nombre del W-Engine.
 * @param {string} [filtroRareza=""] - Filtro por rareza (S, A).
 */
function renderWEngines(xml, id, filtroNombre = "", filtroRareza = "") {
    const ctx = document.getElementById('wengines-ctx');
    if (!ctx) return;

    let html = '<table class="tabla-datos"><thead><tr><th>Arma</th><th>Nombre</th><th>Rareza</th><th>Efecto</th></tr></thead><tbody>';
    let encontrados = 0;
    let motoresParaMostrar = [];
    
    if (id) {
        const equipados = xml.querySelectorAll(`wengine_agente[id_agente="${id}"]`);
        equipados.forEach(eq => {
            const def = xml.querySelector(`wengine_def[id="${eq.getAttribute('id_wengine')}"]`);
            if (def) motoresParaMostrar.push(def);
        });
    } else {
        motoresParaMostrar = Array.from(xml.querySelectorAll('wengine_def'));
    }

    if (motoresParaMostrar.length === 0) {
         html += '<tr><td colspan="4" style="text-align:center;">No hay registros disponibles.</td></tr>';
    } else {
        motoresParaMostrar.forEach(m => {
            const nombre = m.querySelector('nombre').textContent;
            const rar = m.querySelector('rareza').textContent;
            
            const pasaNombre = !filtroNombre || nombre.toLowerCase().includes(filtroNombre);
            const pasaRareza = !filtroRareza || rar === filtroRareza;
            if (pasaNombre && pasaRareza) {
                encontrados++;
                html += `
                    <tr>
                        <td><img src="${m.querySelector('imagen_arma').textContent}" alt="Arma ${nombre}" style="width:80px; object-fit:contain;"></td>
                        <td style="color:var(--accent-red); font-weight:bold;">${nombre}</td>
                        <td><span class="badge-rarity" style="background:${rar==='S'?'var(--rank-s)':'var(--rank-a)'}">RANGO ${rar}</span></td>
                        <td style="color:var(--text-muted); max-width: 400px;">${m.querySelector('efecto').textContent}</td>
                    </tr>`;
            }
        });
        if (encontrados === 0) {
            html += '<tr><td colspan="4" style="text-align:center; color:var(--accent-red);">Sin resultados para los filtros seleccionados.</td></tr>';
        }
    }
    html += '</tbody></table>';
    ctx.innerHTML = html;
}