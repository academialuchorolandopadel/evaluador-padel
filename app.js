// ==================== APP.JS COMPLETO (con Alumnos y PDF) ====================
document.addEventListener('DOMContentLoaded', () => {
  const mainNav = document.getElementById('mainNav');
  const views = document.querySelectorAll('.view');
  const golpesList = document.getElementById('golpesList');
  const golpeContent = document.getElementById('golpeContent');
  const playerNameInput = document.getElementById('playerName');
  const historialLista = document.getElementById('historialLista');
  const limpiarHistorialBtn = document.getElementById('limpiarHistorialBtn');
  const modoFiscalCheckbox = document.getElementById('modoFiscalCheckbox');
  const body = document.body;

  let golpeActual = 'smash';
  let evaluacionesCache = {};
  let planGeneradoHTML = '';

  function actualizarModo() {
    if (modoFiscalCheckbox.checked) {
      body.classList.remove('modo-alumno');
      body.classList.add('modo-fiscal');
    } else {
      body.classList.remove('modo-fiscal');
      body.classList.add('modo-alumno');
    }
  }
  modoFiscalCheckbox.addEventListener('change', actualizarModo);
  actualizarModo();

  mainNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      const view = e.target.dataset.view;
      mainNav.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(view + 'View').classList.add('active');
      if (view === 'historial') cargarHistorial();
      if (view === 'entrenamiento') cargarAlumnosEnSelect();
      if (view === 'alumnos') cargarAlumnos();
    }
  });

  golpesList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      golpesList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');
      golpeActual = e.target.dataset.golpe;
      evaluacionesCache = {};
      renderizarGolpe(golpeActual);
    }
  });

  function renderizarGolpe(golpeId) {
    const golpe = DATA.golpes[golpeId];
    if (!golpe) return;

    let html = `<h2>${golpe.nombre}</h2>`;
    if (golpe.subtitulo) html += `<p class="variantes-golpe">${golpe.subtitulo}</p>`;

    const pares = golpe.pares;
    for (const [parKey, parData] of Object.entries(pares)) {
      html += `
        <div class="par-acordeon">
          <div class="par-header" data-par="${parKey}">
            <h3>${parData.nombre}</h3>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="par-body collapsed" id="body-${parKey}">
            <div class="evaluador-grid" id="grid-${parKey}"></div>
            <div class="actions">
              <button class="btn-primary diagnosticar-par" data-par="${parKey}">🔍 Diagnosticar Par</button>
            </div>
            <div class="resultado-par" id="result-${parKey}" style="display:none;"></div>
          </div>
        </div>
      `;
    }
    html += `
      <div class="actions" style="margin-top:24px;">
        <button id="btnGuardar" class="btn-primary">💾 Guardar Evaluación</button>
        <button id="btnEvaluacionGlobal" class="btn-primary">📊 Evaluación Global</button>
      </div>
      <div class="diagnostico-golpe" id="globalGolpe" style="display:none;">
        <h3>🏆 Evaluación Global del Golpe</h3>
        <p id="globalGolpeTexto"></p>
      </div>
    `;
    golpeContent.innerHTML = html;

    for (const [parKey, parData] of Object.entries(pares)) {
      const grid = document.getElementById(`grid-${parKey}`);
      parData.cuantificadores.forEach(cuant => {
        const card = document.createElement('div');
        card.className = 'cuantificador-card';
        card.innerHTML = `
          <div class="card-header">
            <h3>${cuant.nombre}</h3>
            <span class="info-icon" title="${cuant.descripcion}">ⓘ</span>
          </div>
          <p class="card-desc">${cuant.descripcion}</p>
          <div class="opciones-grid">
            ${[7,6,5,4,3,2].map(cat => `
              <label class="opcion-card">
                <input type="radio" name="${parKey}_${cuant.id}" value="${cat}" hidden>
                <span class="cat-badge cat-${cat}">${cat}ª</span>
                <span class="opcion-texto">${cuant.categorias[cat]}</span>
              </label>
            `).join('')}
          </div>
        `;
        grid.appendChild(card);
      });

      if (evaluacionesCache[parKey]) {
        for (const [cuantId, cat] of Object.entries(evaluacionesCache[parKey])) {
          const radio = document.querySelector(`input[name="${parKey}_${cuantId}"][value="${cat}"]`);
          if (radio) radio.checked = true;
        }
      }
    }

    document.querySelectorAll('.par-header').forEach(header => {
      header.addEventListener('click', () => {
        const parKey = header.dataset.par;
        const bodyEl = document.getElementById(`body-${parKey}`);
        header.classList.toggle('collapsed');
        bodyEl.classList.toggle('collapsed');
      });
    });

    document.querySelectorAll('.diagnosticar-par').forEach(btn => {
      btn.addEventListener('click', () => diagnosticarPar(btn.dataset.par));
    });

    document.getElementById('btnGuardar').addEventListener('click', guardarEvaluacion);
    document.getElementById('btnEvaluacionGlobal').addEventListener('click', evaluarGolpeCompleto);
  }

  function diagnosticarPar(parKey) {
    const golpe = DATA.golpes[golpeActual];
    const parData = golpe.pares[parKey];
    const selecciones = {};
    let completo = true;
    parData.cuantificadores.forEach(cuant => {
      const radio = document.querySelector(`input[name="${parKey}_${cuant.id}"]:checked`);
      if (radio) selecciones[cuant.id] = parseInt(radio.value);
      else completo = false;
    });
    if (!completo) return alert('⚠️ Seleccioná una opción para cada cuantificador.');
    evaluacionesCache[parKey] = selecciones;

    const valores = Object.values(selecciones);
    const moda = calcularModa(valores);
    const min = Math.min(...valores);
    const max = Math.max(...valores);

    let html = '<ul>';
    for (const [id, cat] of Object.entries(selecciones)) {
      const nombreCuant = parData.cuantificadores.find(c => c.id === id).nombre;
      html += `<li><strong>${nombreCuant}:</strong> <span class="cat-badge cat-${cat}">${cat}ª</span></li>`;
    }
    html += '</ul>';
    if (min === max) html += `<p>✅ Encaja claramente en <strong><span class="cat-badge cat-${moda}">${moda}ª Categoría</span></strong>.</p>`;
    else if (max - min === 1) html += `<p>🔄 Está entre <strong>${min}ª y ${max}ª categoría</strong>.</p>`;
    else html += `<p>⚠️ Dispersión amplia (${min}ª a ${max}ª). Revisá las observaciones.</p>`;

    document.getElementById(`result-${parKey}`).innerHTML = html;
    document.getElementById(`result-${parKey}`).style.display = 'block';
  }

  function calcularModa(arr) {
    const freq = {};
    arr.forEach(v => freq[v] = (freq[v] || 0) + 1);
    let max = 0, moda = arr[0];
    for (const [val, count] of Object.entries(freq)) {
      if (count > max) { max = count; moda = Number(val); }
    }
    return moda;
  }

  function evaluarGolpeCompleto() {
    const golpe = DATA.golpes[golpeActual];
    const keys = Object.keys(golpe.pares);
    const modas = [];
    for (const parKey of keys) {
      if (!evaluacionesCache[parKey]) return alert('⚠️ Diagnosticá todos los pares primero.');
      const valores = Object.values(evaluacionesCache[parKey]);
      modas.push(calcularModa(valores));
    }
    const min = Math.min(...modas), max = Math.max(...modas);
    let texto = '';
    if (min === max) texto = `Rendimiento consistente de <strong>${min}ª categoría</strong>.`;
    else if (max - min === 1) texto = `Rendimiento entre <strong>${min}ª y ${max}ª categoría</strong>.`;
    else texto = `Dispersión amplia (${min}ª a ${max}ª). Revisar pares individuales.`;
    document.getElementById('globalGolpeTexto').innerHTML = texto;
    document.getElementById('globalGolpe').style.display = 'block';
  }

  function guardarEvaluacion() {
    const nombre = playerNameInput.value.trim() || 'Sin nombre';
    const evaluacion = {
      id: Date.now(),
      fecha: new Date().toLocaleString(),
      jugador: nombre,
      golpe: golpeActual,
      selecciones: evaluacionesCache
    };
    let historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    historial.push(evaluacion);
    localStorage.setItem('padelEvalHistorial', JSON.stringify(historial));
    alert('✅ Evaluación guardada correctamente.');
  }

  function cargarHistorial() {
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    historialLista.innerHTML = '';
    if (historial.length === 0) {
      historialLista.innerHTML = '<p>No hay evaluaciones guardadas.</p>';
      return;
    }
    historial.forEach(eva => {
      const div = document.createElement('div');
      div.className = 'historial-item';
      div.innerHTML = `
        <div class="info"><strong>${eva.jugador}</strong> – ${eva.golpe} – ${eva.fecha}</div>
        <div class="btn-group">
          <button class="btn-secondary cargarEva" data-id="${eva.id}">📂 Cargar</button>
          <button class="btn-secondary eliminarEva" data-id="${eva.id}">🗑️</button>
        </div>
      `;
      historialLista.appendChild(div);
    });
  }

  historialLista.addEventListener('click', (e) => {
    if (e.target.classList.contains('cargarEva')) {
      const id = Number(e.target.dataset.id);
      const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
      const eva = historial.find(e => e.id === id);
      if (eva) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.tab[data-view="evaluacion"]').classList.add('active');
        views.forEach(v => v.classList.remove('active'));
        document.getElementById('evaluacionView').classList.add('active');
        golpeActual = eva.golpe;
        evaluacionesCache = eva.selecciones || {};
        playerNameInput.value = eva.jugador;
        document.querySelectorAll('#golpesList li').forEach(li => li.classList.remove('active'));
        document.querySelector(`#golpesList li[data-golpe="${eva.golpe}"]`).classList.add('active');
        renderizarGolpe(eva.golpe);
      }
    } else if (e.target.classList.contains('eliminarEva')) {
      const id = Number(e.target.dataset.id);
      let historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
      historial = historial.filter(e => e.id !== id);
      localStorage.setItem('padelEvalHistorial', JSON.stringify(historial));
      cargarHistorial();
    }
  });

  limpiarHistorialBtn.addEventListener('click', () => {
    if (confirm('¿Borrar todo el historial?')) {
      localStorage.removeItem('padelEvalHistorial');
      cargarHistorial();
    }
  });

  // ============ ENTRENAMIENTO ============
  const alumnoSelect = document.getElementById('alumnoSelect');
  const categoriaObjetivo = document.getElementById('categoriaObjetivo');
  const generarPlanBtn = document.getElementById('generarPlanBtn');
  const descargarPlanBtn = document.getElementById('descargarPlanBtn');
  const planEntrenamiento = document.getElementById('planEntrenamiento');

  function cargarAlumnosEnSelect() {
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    alumnoSelect.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    historial.forEach((eva, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${eva.jugador} - ${eva.golpe} (${eva.fecha})`;
      alumnoSelect.appendChild(opt);
    });
  }

  generarPlanBtn.addEventListener('click', () => {
    const idx = alumnoSelect.value;
    if (idx === '') return alert('⚠️ Seleccioná un alumno.');
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    const evaluacion = historial[parseInt(idx)];
    const objetivo = parseInt(categoriaObjetivo.value);
    planGeneradoHTML = construirPlan(evaluacion, objetivo);
    planEntrenamiento.innerHTML = planGeneradoHTML;
    descargarPlanBtn.style.display = 'inline-block';
  });

  descargarPlanBtn.addEventListener('click', () => {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head>
          <title>Plan de Entrenamiento</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            h2 { color: #002244; }
            .ejercicio-item { margin-bottom: 12px; border: 1px solid #ccc; padding: 8px; }
          </style>
        </head>
        <body>${planGeneradoHTML}</body>
      </html>
    `);
    ventana.document.close();
    ventana.print();  // El usuario puede guardar como PDF desde el diálogo
  });

  function construirPlan(evaluacion, objetivo) {
    let html = `<h2>Plan de Entrenamiento para ${evaluacion.jugador}</h2>`;
    html += `<p><strong>Golpe:</strong> ${evaluacion.golpe} | <strong>Objetivo:</strong> ${objetivo}ª Categoría</p>`;
    let encontro = false;

    const golpeData = DATA.golpes[evaluacion.golpe];
    if (!golpeData) return html + '<p>No hay datos del golpe.</p>';

    for (const [parKey, parData] of Object.entries(golpeData.pares)) {
      const seleccionesPar = evaluacion.selecciones[parKey] || {};
      let ejerciciosPar = '';
      for (const cuant of parData.cuantificadores) {
        const catActual = seleccionesPar[cuant.id];
        if (catActual && catActual > objetivo) {
          for (let cat = catActual; cat > objetivo; cat--) {
            const transicion = `${cat}_${cat-1}`;
            const ejercicio = window.EJERCICIOS?.[evaluacion.golpe]?.[parKey]?.[cuant.id]?.[transicion];
            if (ejercicio) {
              ejerciciosPar += `
                <div class="ejercicio-item">
                  <strong>${cuant.nombre} (${cat}ª → ${cat-1}ª):</strong> ${ejercicio.nombre}<br>
                  <span class="series">${ejercicio.series} series x ${ejercicio.repeticiones}</span><br>
                  <em>${ejercicio.descripcion}</em><br>
                  ✅ Criterio: ${ejercicio.criterioExito}
                </div>`;
              encontro = true;
            }
          }
        }
      }
      if (ejerciciosPar) html += `<div class="plan-par"><h4>${parData.nombre}</h4>${ejerciciosPar}</div>`;
    }
    if (!encontro) html += '<p>✅ Ya alcanza o supera el nivel en todos los aspectos evaluados.</p>';
    return html;
  }

  // ============ ALUMNOS (base de datos) ============
  const alumnosLista = document.getElementById('alumnosLista');

  function cargarAlumnos() {
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    if (historial.length === 0) {
      alumnosLista.innerHTML = '<p>No hay alumnos registrados.</p>';
      return;
    }

    // Agrupar por nombre de jugador (puede tener varias evaluaciones)
    const alumnos = {};
    historial.forEach(eva => {
      if (!alumnos[eva.jugador]) {
        alumnos[eva.jugador] = [];
      }
      alumnos[eva.jugador].push(eva);
    });

    let html = '';
    for (const [nombre, evaluaciones] of Object.entries(alumnos)) {
      html += `<div class="alumno-card">
        <h3>${nombre}</h3>
        <table>
          <thead><tr><th>Golpe</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>`;
      evaluaciones.forEach(eva => {
        html += `<tr>
          <td>${eva.golpe}</td>
          <td>${eva.fecha}</td>
          <td>
            <button class="btn-secondary btn-chico generar-plan-alumno" data-id="${eva.id}">📋 Plan</button>
            <button class="btn-secondary btn-chico eliminar-eva-alumno" data-id="${eva.id}">🗑️</button>
          </td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
    }
    alumnosLista.innerHTML = html;

    // Eventos para los botones dentro de la vista Alumnos
    alumnosLista.addEventListener('click', (e) => {
      if (e.target.classList.contains('generar-plan-alumno')) {
        const id = Number(e.target.dataset.id);
        const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
        const eva = historial.find(e => e.id === id);
        if (eva) {
          // Nos movemos a la pestaña Entrenamiento y seleccionamos automáticamente
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelector('.tab[data-view="entrenamiento"]').classList.add('active');
          views.forEach(v => v.classList.remove('active'));
          document.getElementById('entrenamientoView').classList.add('active');
          // Cargar el select y seleccionar el alumno correspondiente
          cargarAlumnosEnSelect();
          const options = alumnoSelect.options;
          for (let i = 0; i < options.length; i++) {
            if (options[i].textContent.includes(eva.jugador) && options[i].textContent.includes(eva.golpe)) {
              alumnoSelect.selectedIndex = i;
              break;
            }
          }
        }
      } else if (e.target.classList.contains('eliminar-eva-alumno')) {
        const id = Number(e.target.dataset.id);
        let historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
        historial = historial.filter(e => e.id !== id);
        localStorage.setItem('padelEvalHistorial', JSON.stringify(historial));
        cargarAlumnos(); // recargar la lista
      }
    });
  }

  // Inicializar
  renderizarGolpe('smash');
});
