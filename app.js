// 1. Obtener ID del Agente de la URL
const urlParams = new URLSearchParams(window.location.search);
const agenteId = urlParams.get('id');

document.addEventListener("DOMContentLoaded", () => {
    const paginas = ['agente', 'wengines', 'discos', 'bangboo', 'sinergia', 'habilidades'];
    paginas.forEach(pag => {
        const link = document.getElementById(`link-${pag}`);
        if (link) {
            link.href = agenteId ? `${pag}.html?id=${agenteId}` : `${pag}.html`;
            if (window.location.pathname.includes(`${pag}.html`)) {
                link.classList.add('active');
            }
        }
    });
    
    cargarXML();
});

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

function enrutarRender(xml) {
    const path = window.location.pathname;
    
    if (path.includes('agente.html')) renderAgente(xml, agenteId);
    else if (path.includes('wengines.html')) renderWEngines(xml, agenteId);
    else if (path.includes('discos.html')) renderDiscos(xml, agenteId);
    else if (path.includes('bangboo.html')) renderBangboo(xml, agenteId);
    else if (path.includes('sinergia.html')) renderSinergia(xml, agenteId);
    else if (path.includes('habilidades.html')) renderHabilidades(xml, agenteId);
    else if (path.includes('index.html') || path === '/' || path.endsWith('/')) renderLista(xml);
}

function renderAgente(xml, id) {
    const item = xml.querySelector(`agente[id="${id}"]`);
    const ctx = document.getElementById('agente-ctx');
    if (!item) return ctx.innerHTML = "<p>Agente no registrado.</p>";

    ctx.innerHTML = `
        <div class="dashboard-grid">
            <div class="card-zzz border-s" style="text-align:center;">
                <div style="width:100%; height:200px; background:#111; margin-bottom:15px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#444;"><img src="./${item.querySelector('imagen_perfil').textContent}" alt="Perfil de ${item.querySelector('nombre').textContent}" style="max-height:100%; max-width:100%; border-radius:8px; object-fit:contain;"></div>
                <h2 style="font-size:2.2rem; color:var(--accent-red); margin:5px 0;">${item.querySelector('nombre').textContent}</h2>
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
}

function renderWEngines(xml, id) {
    const motores = xml.querySelectorAll(`wengine[id_agente="${id}"]`);
    const ctx = document.getElementById('wengines-ctx');
    let html = '<div class="dashboard-grid">';
    
    motores.forEach(m => {
        const rar = m.querySelector('rareza').textContent;
        const claseRareza = rar === 'S' ? 'border-s' : 'border-a';
        html += `
            <div class="card-zzz ${claseRareza}">
                <h3>${m.querySelector('nombre').textContent}</h3>
                <div style="text-align:center; margin:15px 0;"><img src="${m.querySelector('imagen_arma').textContent}" alt="Arma ${m.querySelector('nombre').textContent}" style="height:120px; object-fit:contain;"></div>
                <span class="badge-rarity" style="background:${rar==='S'?'var(--rank-s)':'var(--rank-a)'}">RANGO ${rar}</span>
                <p style="color:var(--text-muted); margin-top:15px;">${m.querySelector('efecto').textContent}</p>
                <div style="position:absolute; bottom:15px; right:15px; font-weight:bold; color:var(--accent-red);">PRIORIDAD #${m.getAttribute('prioridad')}</div>
            </div>`;
    });
    ctx.innerHTML = html + '</div>';
}

function renderDiscos(xml, id) {
    const item = xml.querySelector(`drive_discs[id_agente="${id}"]`);
    const ctx = document.getElementById('discos-ctx');
    if (!item) return;

    ctx.innerHTML = `
        <div class="dashboard-grid">
            <div class="card-zzz border-s">
                <h3>Conjuntos Recomendados</h3>
                <hr style="border-color:var(--accent-neon); margin-bottom:15px;">
                <p><strong>Set x4:</strong> ${item.querySelector('set_principal').textContent}</p>
                <p><strong>Set x2:</strong> ${item.querySelector('set_secundario').textContent}</p>
            </div>
            <div class="card-zzz" style="border-top-color: var(--accent-neon);">
                <h3>Estadísticas Prioritarias</h3>
                <hr style="border-color:var(--text-muted); margin-bottom:15px;">
                <p><strong style="color:var(--accent-red);">Principales (IV, V, VI):</strong> ${item.querySelector('main_stats').textContent}</p>
                <p><strong style="color:var(--accent-neon);">Sub-stats:</strong> ${item.querySelector('sub_stats').textContent}</p>
            </div>
        </div>`;
}

function renderBangboo(xml, id) {
    const item = xml.querySelector(`bangboo[id_agente="${id}"]`);
    const ctx = document.getElementById('bangboo-ctx');
    if (!item) return;

    ctx.innerHTML = `
        <div class="card-zzz border-s">
            <div style="text-align:left; margin-bottom:15px;"><img src="${item.querySelector('imagen_boo').textContent}" alt="Imagen de ${item.querySelector('nombre').textContent}" style="height:300px; object-fit:contain;"></div>
            <h2 style="color:var(--rank-s);">${item.querySelector('nombre').textContent}</h2>
            <p><strong>Rareza de Asistente:</strong> Rango ${item.querySelector('raridad').textContent}</p>
            <hr style="border-color:var(--text-muted); margin:15px 0;">
            <p><strong>Protocolo de Habilidad Activa:</strong></p>
            <p style="color:var(--text-muted);">${item.querySelector('habilidad').textContent}</p>
        </div>`;
}

function renderSinergia(xml, id) {
    const item = xml.querySelector(`equipo[id_agente="${id}"]`);
    const ctx = document.getElementById('sinergia-ctx');
    if (!item) return;

    ctx.innerHTML = `
        <div class="card-zzz" style="border-top-color:var(--accent-red);">
            <h3>Sinergia de Escuadrón Recomendada</h3>
            <h2 style="color:var(--text-main); font-style:italic; margin:15px 0;">${item.querySelector('comp').textContent}</h2>
            <p><strong>Análisis Táctico:</strong></p>
            <p style="color:var(--text-muted); line-height:1.5;">${item.querySelector('motivo').textContent}</p>
        </div>`;
}

function renderHabilidades(xml, id) {
    const item = xml.querySelector(`skills[id_agente="${id}"]`);
    const ctx = document.getElementById('habilidades-ctx');
    if (!item) return;

    ctx.innerHTML = `
        <div class="card-zzz border-s">
            <h3>Ruta Óptima de Optimización de Talentos</h3>
            <p style="color:var(--text-muted); margin-bottom:20px;">Invierte tus recursos de entrenamiento siguiendo estrictamente esta cadena jerárquica:</p>
            <h2 style="color:var(--accent-neon); font-size:1.8rem; letter-spacing:1px;">${item.querySelector('orden').textContent}</h2>
        </div>`;
}

function renderLista(xml) {
    const agentes = xml.querySelectorAll('agentes > agente');
    const ctx = document.getElementById('lista-ctx');
    if (!ctx) return;

    let html = '<div class="dashboard-grid">';
    
    agentes.forEach(agente => {
        const id = agente.getAttribute('id');
        const nombre = agente.querySelector('nombre').textContent;
        const img = agente.querySelector('imagen_perfil').textContent;
        const faccion = agente.querySelector('faccion').textContent;
        
        html += `
            <a href="agente.html?id=${id}" style="text-decoration:none; color:inherit; display:block;">
                <div class="card-zzz border-s" style="text-align:center; transition: transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="width:100%; height:200px; background:#111; margin-bottom:15px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#444;"><img src="${img}" alt="Perfil de ${nombre}" style="max-height:100%; max-width:100%; border-radius:8px; object-fit:contain;"></div>
                    <h2 style="font-size:1.8rem; color:var(--accent-red); margin:5px 0;">${nombre}</h2>
                    <p style="text-transform:uppercase; color:var(--text-muted); font-size:0.85rem;">${faccion}</p>
                </div>
            </a>`;
    });
    
    ctx.innerHTML = html + '</div>';
}