/**
 * @fileoverview Archivo principal de la página
 * Se encarga del inicio de sesión, de saber en qué página estamos 
 * y de cargar los datos del archivo database.xml
 */

const rutaActual = window.location.pathname;
const esPaginaInicio = rutaActual.endsWith('index.html') || rutaActual === '/' || rutaActual.endsWith('/');
const sesionIniciada = sessionStorage.getItem('sesionIniciada') === 'true';
if (!sesionIniciada && !esPaginaInicio) {
    window.location.href = 'index.html'; 
} else if (sesionIniciada && esPaginaInicio) {
    window.location.href = 'lista.html'; 
}
const parametrosUrl = new URLSearchParams(window.location.search);
const idAgente = parametrosUrl.get('id');

/**
 * Prepara el menú,
 */
document.addEventListener("DOMContentLoaded", () => {
    const paginas = ['agente', 'wengines', 'discos', 'bangboo', 'sinergia'];
    paginas.forEach(pag => {
        const enlace = document.getElementById(`link-${pag}`);
        if (enlace) {
            enlace.href = idAgente ? `${pag}.html?id=${idAgente}` : `${pag}.html`;
            if (window.location.pathname.includes(`${pag}.html`)) {
                enlace.classList.add('active');
            }
        }
    });
    
    if (sesionIniciada && !esPaginaInicio) {
        const subtitle = document.querySelector('.subtitle');
        if (subtitle && !document.getElementById('btn-logout')) {
            const btnCerrarSesion = document.createElement('button');
            btnCerrarSesion.id = 'btn-logout';
            btnCerrarSesion.textContent = 'Cerrar Sesión';
            btnCerrarSesion.style.marginLeft = '15px';
            btnCerrarSesion.style.padding = '5px 10px';
            btnCerrarSesion.style.fontSize = '0.7rem';
            btnCerrarSesion.addEventListener('click', () => {
                sessionStorage.removeItem('sesionIniciada');
                window.location.href = 'index.html';
            });
            subtitle.appendChild(btnCerrarSesion);
        }
    }

    cargarXML();
});

/**
 * Lee el archivo database.xml
 */
function cargarXML() {
    fetch('database.xml')
        .then(respuesta => {
            if (!respuesta.ok) throw new Error("Error cargando base de datos XML");
            return respuesta.text();
        })
        .then(datos => {
            const procesador = new DOMParser();
            const documentoXml = procesador.parseFromString(datos, "text/xml");
            enrutarRender(documentoXml);
        })
        .catch(error => console.error("Error de Sistema:", error));
}

/**
 * Decide qué mostrar dependiendo de la página en la que estemos
 * También carga los botones, filtros y formularios
 * @param {Document} xml - Los datos leídos del archivo database.xml
 */
function enrutarRender(xml) {
    const ruta = window.location.pathname;
    if (ruta.includes('agente.html')) renderAgente(xml, idAgente);
    else if (ruta.includes('wengines.html')) {
        renderWEngines(xml, idAgente); 
        const aplicarFiltrosWEngines = () => {
            const nombre = document.getElementById('filtro-wengine-nombre') ? document.getElementById('filtro-wengine-nombre').value.toLowerCase() : "";
            const rareza = document.getElementById('filtro-wengine-rareza') ? document.getElementById('filtro-wengine-rareza').value : "";
            renderWEngines(xml, idAgente, nombre, rareza);
        };
        const campos = ['filtro-wengine-nombre', 'filtro-wengine-rareza'];
        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.addEventListener(id === 'filtro-wengine-nombre' ? 'input' : 'change', aplicarFiltrosWEngines);
        });
    }
    else if (ruta.includes('bangboo.html')) renderBangboo(xml, idAgente); 
    else if (ruta.includes('discos.html')) renderDiscos(xml, idAgente);
    else if (ruta.includes('sinergia.html')) renderEquipos(xml, idAgente);
    else if (ruta.includes('lista.html')) {
        renderLista(xml);
        const aplicarFiltros = () => {
            const texto = document.getElementById('filtro-texto') ? document.getElementById('filtro-texto').value.toLowerCase() : "";
            const rareza = document.getElementById('filtro-rareza') ? document.getElementById('filtro-rareza').value : "";
            const elemento = document.getElementById('filtro-elemento') ? document.getElementById('filtro-elemento').value : "";
            const estilo = document.getElementById('filtro-estilo') ? document.getElementById('filtro-estilo').value : "";
            renderLista(xml, texto, rareza, elemento, estilo);
        };
        const campos = ['filtro-texto', 'filtro-rareza', 'filtro-elemento', 'filtro-estilo'];
        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.addEventListener(id === 'filtro-texto' ? 'input' : 'change', aplicarFiltros);
        });
    }
    else if (esPaginaInicio) {
        const btnIniciarSesion = document.getElementById('btn-login');
        if (btnIniciarSesion) {
            btnIniciarSesion.addEventListener('click', () => {
                const usuario = document.getElementById('user').value;
                const clave = document.getElementById('pass').value;
                const usuarioXml = xml.querySelector('user').textContent;
                const claveXml = xml.querySelector('pass').textContent;
                let valido = (usuario === usuarioXml && clave === claveXml);
                const mensaje = document.getElementById('login-msg');
                mensaje.style.color = valido ? "var(--accent-neon)" : "var(--accent-red)";
                if (valido) {
                    mensaje.textContent = "Acceso concedido. Redirigiendo a la base de datos de InterKnot...";
                    sessionStorage.setItem('sesionIniciada', 'true');
                    setTimeout(() => window.location.href = 'lista.html', 800);
                } else {
                    mensaje.textContent = "Alerta: Credenciales inválidas.";
                }
            });
        }
    }
}

/**
 * Muestra los datos básicos del Agente (como su rareza y su cita), leyendo el XML
 * @param {Document} xml - Los datos del archivo XML
 * @param {string} id - El ID del agente que se va a mostrar
 */
function renderAgente(xml, id) {
    const nodoAgente = xml.querySelector(`agente[id="${id}"]`);
    const contenedor = document.getElementById('agente-ctx');
    if (!nodoAgente) return contenedor.innerHTML = "<p>Agente no registrado.</p>";
    const nombre = nodoAgente.querySelector('nombre').textContent;
    const imagen = nodoAgente.querySelector('imagen_perfil').textContent;
    contenedor.innerHTML = `
        <div class="dashboard-grid">
            <div class="card-zzz border-s" style="text-align:center;">
                <div style="width:100%; height:250px; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                    <div class="film-frame" style="transform: scale(2); margin: 0;">
                        <img src="./${imagen}" alt="Perfil de ${nombre}">
                        <div class="vhs-label"># ${nombre}</div>
                    </div>
                </div>
                <h2 style="font-size:2.2rem; color:var(--accent-red); margin:5px 0;">${nombre}</h2>
                <p style="text-transform:uppercase; color:var(--text-muted); font-size:0.85rem;">${nodoAgente.querySelector('faccion').textContent}</p>
            </div>
            <div class="card-zzz border-s">
                <h3>Perfil de Verificación Ciudadana</h3>
                <hr style="border-color:var(--accent-red); margin-bottom:15px;">
                <p><strong>Rareza:</strong> <span class="badge-rarity">${nodoAgente.querySelector('rango').textContent}</span></p>
                <p><strong>Atributo Elemental:</strong> <span style="color:var(--accent-neon);">${nodoAgente.querySelector('atributo').textContent}</span></p>
                <p><strong>Estilo de Combate:</strong> ${nodoAgente.querySelector('estilo').textContent}</p>
            </div>
        </div>`;
    const contenedorCita = document.getElementById('dinamic-cita-ctx');
    if (contenedorCita) {
        const textoCita = nodoAgente.querySelector('cita') ? nodoAgente.querySelector('cita').textContent : "Registro sin citas registradas.";
        contenedorCita.innerHTML = `
            <h3 style="color: var(--text-muted); font-size: 0.9rem;">Introducción oficial</h3>
            <blockquote cite="" style="font-style: italic; color: var(--text-main); margin: 0;">
                "${textoCita}"
            </blockquote>`;
    }
}

/**
 * Muestra en pantalla los discos (Drive Discs) recomendados para el agente
 * @param {Document} xml - Los datos del archivo XML
 * @param {string} id - El ID del agente
 */
function renderDiscos(xml, id) {
    const nodoRelacion = xml.querySelector(`drive_discs[id_agente="${id}"]`);
    const contenedor = document.getElementById('discos-ctx');
    if (!nodoRelacion) return;
    const nodoPrincipal = nodoRelacion.querySelector('set_principal');
    const nodoSecundario = nodoRelacion.querySelector('set_secundario');
    const defPrincipal = xml.querySelector(`disco_def[id="${nodoPrincipal.getAttribute('id_disco')}"]`);
    const defSecundario = xml.querySelector(`disco_def[id="${nodoSecundario.getAttribute('id_disco')}"]`);
    contenedor.innerHTML = `
        <div class="dashboard-grid">
            <div class="card-zzz border-s">
                <h3>Conjuntos Recomendados</h3>
                <hr style="border-color:var(--accent-neon); margin-bottom:15px;">
                
                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    <img src="${defPrincipal.querySelector('imagen_disco').textContent}" alt="Disco ${defPrincipal.querySelector('nombre').textContent}" style="width: 70px; height: 70px; object-fit: contain; background: #111; border-radius: 8px; border: 1px solid var(--text-muted); padding: 5px;">
                    <div>
                        <h4 style="color: var(--accent-neon); margin: 0 0 5px 0; font-size: 1rem;">${defPrincipal.querySelector('nombre').textContent} (x${nodoPrincipal.getAttribute('piezas')})</h4>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; line-height: 1.3;">${defPrincipal.querySelector('efecto').textContent}</p>
                    </div>
                </div>

                <div style="display: flex; gap: 15px;">
                    <img src="${defSecundario.querySelector('imagen_disco').textContent}" alt="Disco ${defSecundario.querySelector('nombre').textContent}" style="width: 70px; height: 70px; object-fit: contain; background: #111; border-radius: 8px; border: 1px solid var(--text-muted); padding: 5px;">
                    <div>
                        <h4 style="color: var(--rank-a); margin: 0 0 5px 0; font-size: 1rem;">${defSecundario.querySelector('nombre').textContent} (x${nodoSecundario.getAttribute('piezas')})</h4>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; line-height: 1.3;">${defSecundario.querySelector('efecto').textContent}</p>
                    </div>
                </div>
            </div>
            <div class="card-zzz" style="border-top-color: var(--accent-neon);">
                <h3>Estadísticas Prioritarias</h3>
                <hr style="border-color:var(--text-muted); margin-bottom:15px;">
                <p><strong style="color:var(--accent-red);">Principales (IV, V, VI):</strong> ${nodoRelacion.querySelector('main_stats').textContent}</p>
                <p><strong style="color:var(--accent-neon);">Sub-stats:</strong> ${nodoRelacion.querySelector('sub_stats').textContent}</p>
            </div>
        </div>`;
}

/**
 * Muestra en pantalla el Bangboo (apoyo) recomendado para el agente
 * @param {Document} xml - Los datos del archivo XML
 * @param {string} id - El ID del agente
 */
function renderBangboo(xml, id) {
    const nodoRelacion = xml.querySelector(`bangboo_agente[id_agente="${id}"]`);
    const contenedor = document.getElementById('bangboo-ctx');
    if (!nodoRelacion) return;

    const definicion = xml.querySelector(`bangboo_def[id="${nodoRelacion.getAttribute('id_bangboo')}"]`);
    if (!definicion) return;

    contenedor.innerHTML = `
        <div class="card-zzz border-s">
            <div style="text-align:left; margin-bottom:15px;"><img src="${definicion.querySelector('imagen_boo').textContent}" alt="Imagen de ${definicion.querySelector('nombre').textContent}" style="height:300px; object-fit:contain;"></div>
            <h2 style="color:var(--rank-s);">${definicion.querySelector('nombre').textContent}</h2>
            <p><strong>Rareza de Asistente:</strong> Rango ${definicion.querySelector('rareza').textContent}</p>
            <hr style="border-color:var(--text-muted); margin:15px 0;">
            <p><strong>Protocolo de Habilidad Activa:</strong></p>
            <p style="color:var(--text-muted);">${definicion.querySelector('habilidad').textContent}</p>
        </div>`;
}

/**
 * Muestra sus fotos como enlaces y dice en qué orden mejorar sus habilidades
 * @param {Document} xml - Los datos del archivo XML
 * @param {string} id - El ID del agente
 */
function renderEquipos(xml, id) {
    const nodoEquipo = xml.querySelector(`equipo[id_agente="${id}"]`);
    const contenedor = document.getElementById('sinergia-ctx');
    if (!nodoEquipo) return;
    const textoEquipo = nodoEquipo.querySelector('comp').textContent;
    const motivo = nodoEquipo.querySelector('motivo').textContent;
    // Separar los nombres del equipo
    const nombresAgentes = textoEquipo.split('+').map(n => n.trim());
    let htmlImagenes = '<div style="display: flex; gap: 15px; margin: 15px 0; justify-content: center; flex-wrap: wrap;">';
    nombresAgentes.forEach(nombre => {
        const nodosAgentes = Array.from(xml.querySelectorAll('agentes > agente'));
        const agente = nodosAgentes.find(a => a.querySelector('nombre').textContent.trim() === nombre);
        if (agente) {
            const imagen = agente.querySelector('imagen_perfil').textContent;
            const idAgenteRel = agente.getAttribute('id');
            htmlImagenes += `<div style="text-align: center; width: 100px;">
                <a href="agente.html?id=${idAgenteRel}" style="text-decoration: none;">
                    <div class="film-frame">
                        <img src="${imagen}" alt="${nombre}">
                    </div>
                    <p style="font-size: 0.85rem; margin-top: 5px; color: var(--text-main); font-weight: bold;">${nombre}</p>
                </a>
            </div>`;
        } else {
            htmlImagenes += `<div style="text-align: center; width: 100px;">
                <div class="film-frame">
                    <div style="position:relative; z-index:2; width: 100%; height: 100%; background: #111; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.65rem; text-transform: uppercase; text-align: center;">Sin<br>Datos</div>
                </div>
                <p style="font-size: 0.85rem; margin-top: 5px; color: var(--text-muted);">${nombre}</p>
            </div>`;
        }
    });
    htmlImagenes += '</div>';
    const nodoHabilidades = xml.querySelector(`skills[id_agente="${id}"]`);
    let htmlHabilidades = '';
    if (nodoHabilidades) {
        htmlHabilidades = `
            <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                <h4 style="color: var(--accent-neon); margin-bottom: 10px; font-size: 1.2rem;">Sugerencia de Optimización de Habilidades</h4>
                <p style="color:var(--text-muted); margin-bottom:10px; font-size: 0.9rem;">Ruta óptima de inversión de recursos de entrenamiento:</p>
                <p style="font-size: 1.1rem; font-weight: bold; letter-spacing: 1px;">${nodoHabilidades.querySelector('orden').textContent}</p>
            </div>`;
    }
    contenedor.innerHTML = `
        <div class="card-zzz" style="border-top-color:var(--accent-neon); text-align: center;">
            <h3>Equipo Recomendado</h3>
            ${htmlImagenes}
            <p style="text-align: left; margin-top: 20px;"><strong>Análisis Táctico:</strong></p>
            <p style="color:var(--text-muted); line-height:1.5; text-align: left;">${motivo}</p>
            ${htmlHabilidades}
        </div>`;
}

/**
 * Muestra la tabla de todos los agentes. Permite usar varios filtros para buscar a los personajes
 * @param {Document} xml - Los datos del archivo XML
 * @param {string} [filtroTexto=""] - El texto escrito para buscar por nombre o facción
 * @param {string} [filtroRareza=""] - Filtro para elegir rareza
 * @param {string} [filtroElemento=""] - Filtro de elemento
 * @param {string} [filtroEstilo=""] - Filtro del estilo de combate del personaje
 */
function renderLista(xml, filtroTexto = "", filtroRareza = "", filtroElemento = "", filtroEstilo = "") {
    const agentes = xml.querySelectorAll('agentes > agente');
    const contenedor = document.getElementById('lista-ctx');
    if (!contenedor) return;
    let html = '<table class="tabla-datos"><thead><tr><th>Perfil</th><th>Nombre</th><th>Facción</th><th>Rango</th><th>Atributo</th><th>Estilo</th><th>Acción</th></tr></thead><tbody>';
    let encontrados = 0;
    agentes.forEach(agente => {
        const nombre = agente.querySelector('nombre').textContent;
        const faccion = agente.querySelector('faccion').textContent;
        const rango = agente.querySelector('rango').textContent;
        const atributo = agente.querySelector('atributo').textContent;
        const estilo = agente.querySelector('estilo').textContent;
        const pasaTexto = !filtroTexto || nombre.toLowerCase().includes(filtroTexto) || faccion.toLowerCase().includes(filtroTexto);
        const pasaRareza = !filtroRareza || rango === filtroRareza;
        const pasaElemento = !filtroElemento || atributo === filtroElemento;
        const pasaEstilo = !filtroEstilo || estilo === filtroEstilo;
        if (pasaTexto && pasaRareza && pasaElemento && pasaEstilo) {
            encontrados++;
            const id = agente.getAttribute('id');
            const imagen = agente.querySelector('imagen_perfil').textContent;
            html += `<tr>
                <td>
                    <div class="film-frame" style="margin: 0; transform: scale(0.75); transform-origin: left center;">
                        <img src="${imagen}" alt="Perfil de ${nombre}">
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
    contenedor.innerHTML = html;
}

/**
 * Muestra las armas (W-Engines) en una tabla y deja usar filtros
 * @param {Document} xml - Los datos del archivo XML
 * @param {string|null} id - El ID del agente
 * @param {string} [filtroNombre=""] - Texto para buscar por nombre del arma
 * @param {string} [filtroRareza=""] - Filtro para elegir la rareza
 */
function renderWEngines(xml, id, filtroNombre = "", filtroRareza = "") {
    const contenedor = document.getElementById('wengines-ctx');
    if (!contenedor) return;
    let html = '<table class="tabla-datos"><thead><tr><th>Arma</th><th>Nombre</th><th>Rareza</th><th>Efecto</th></tr></thead><tbody>';
    let encontrados = 0;
    let motoresParaMostrar = [];
    if (id) {
        const equipados = xml.querySelectorAll(`wengine_agente[id_agente="${id}"]`);
        equipados.forEach(equipado => {
            const definicion = xml.querySelector(`wengine_def[id="${equipado.getAttribute('id_wengine')}"]`);
            if (definicion) motoresParaMostrar.push(definicion);
        });
    } else {
        motoresParaMostrar = Array.from(xml.querySelectorAll('wengine_def'));
    }
    if (motoresParaMostrar.length === 0) {
         html += '<tr><td colspan="4" style="text-align:center;">No hay registros disponibles.</td></tr>';
    } else {
        motoresParaMostrar.forEach(motor => {
            const nombre = motor.querySelector('nombre').textContent;
            const rareza = motor.querySelector('rareza').textContent;
            const pasaNombre = !filtroNombre || nombre.toLowerCase().includes(filtroNombre);
            const pasaRareza = !filtroRareza || rareza === filtroRareza;
            if (pasaNombre && pasaRareza) {
                encontrados++;
                html += `
                    <tr>
                        <td><img src="${motor.querySelector('imagen_arma').textContent}" alt="Arma ${nombre}" style="width:80px; object-fit:contain;"></td>
                        <td style="color:var(--accent-red); font-weight:bold;">${nombre}</td>
                        <td><span class="badge-rarity" style="background:${rareza==='S'?'var(--rank-s)':'var(--rank-a)'}">RANGO ${rareza}</span></td>
                        <td style="color:var(--text-muted); max-width: 400px;">${motor.querySelector('efecto').textContent}</td>
                    </tr>`;
            }
        });
        if (encontrados === 0) {
            html += '<tr><td colspan="4" style="text-align:center; color:var(--accent-red);">Sin resultados para los filtros seleccionados.</td></tr>';
        }
    }
    html += '</tbody></table>';
    contenedor.innerHTML = html;
}