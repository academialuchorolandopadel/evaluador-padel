// ==================== APP.JS COMPLETO CORREGIDO ====================
document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos del DOM ---
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

  // ========== MODO ALUMNO/FISCAL ==========
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

  // ========== NAVEGACIÓN PRINCIPAL ==========
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
      if (view === 'seguimiento') cargarAlumnosSeguimiento();
    }
  });

  // ========== SIDEBAR DE GOLPES ==========
  golpesList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      golpesList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');
      golpeActual = e.target.dataset.golpe;
      evaluacionesCache = {};
      renderizarGolpe(golpeActual);
    }
  });

  // ========== RENDERIZAR GOLPE (EVALUACIÓN) ==========
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

  // ========== HISTORIAL ==========
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
      // FIX #3: renombrar parámetro de find para evitar shadowing con 'e' del evento
      const eva = historial.find(item => item.id === id);
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
      // FIX #3: renombrar parámetro de filter para evitar shadowing con 'e' del evento
      historial = historial.filter(item => item.id !== id);
      localStorage.setItem('padelEvalHistorial', JSON.stringify(historial));
      cargarHistorial();
    }
  });

  limpiarHistorialBtn?.addEventListener('click', () => {
    if (confirm('¿Borrar todo el historial?')) {
      localStorage.removeItem('padelEvalHistorial');
      cargarHistorial();
    }
  });

  // ========== ENTRENAMIENTO ==========
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
      <html><head><title>Plan de Entrenamiento</title>
      <style> body { font-family: Arial; padding:20px; } .ejercicio-item { margin-bottom:12px; } </style>
      </head><body>${planGeneradoHTML}</body></html>
    `);
    ventana.document.close();
    ventana.print();
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

  // ========== ALUMNOS ==========
  const alumnosLista = document.getElementById('alumnosLista');

  function cargarAlumnos() {
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    if (historial.length === 0) {
      alumnosLista.innerHTML = '<p>No hay alumnos registrados.</p>';
      return;
    }

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
  }

  // FIX #1: Listener de alumnosLista FUERA de cargarAlumnos() para evitar acumulación
  alumnosLista.addEventListener('click', (e) => {
    if (e.target.classList.contains('generar-plan-alumno')) {
      const id = Number(e.target.dataset.id);
      const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
      // FIX #3: parámetro 'item' en lugar de 'e' para evitar shadowing
      const eva = historial.find(item => item.id === id);
      if (eva) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.tab[data-view="entrenamiento"]').classList.add('active');
        views.forEach(v => v.classList.remove('active'));
        document.getElementById('entrenamientoView').classList.add('active');
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
      // FIX #3: parámetro 'item' en lugar de 'e' para evitar shadowing
      historial = historial.filter(item => item.id !== id);
      localStorage.setItem('padelEvalHistorial', JSON.stringify(historial));
      cargarAlumnos();
    }
  });

  // ========== SEGUIMIENTO ==========
  const alumnoSelectSeg = document.getElementById('alumnoSelectSeg');
  const categoriaObjetivoSeg = document.getElementById('categoriaObjetivoSeg');
  const cargarPlanSegBtn = document.getElementById('cargarPlanSeg');
  const guardarSesionBtn = document.getElementById('guardarSesionBtn');
  const sesionContent = document.getElementById('sesionContent');

  let planSesion = null;
  let ejerciciosCompletados = [];

  function cargarAlumnosSeguimiento() {
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    alumnoSelectSeg.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    historial.forEach((eva, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${eva.jugador} - ${eva.golpe} (${eva.fecha})`;
      alumnoSelectSeg.appendChild(opt);
    });
  }

  cargarPlanSegBtn.addEventListener('click', () => {
    const idx = alumnoSelectSeg.value;
    if (idx === '') return alert('⚠️ Seleccioná un alumno.');
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    const evaluacion = historial[parseInt(idx)];
    const objetivo = parseInt(categoriaObjetivoSeg.value);

    const ejercicios = [];
    const golpeData = DATA.golpes[evaluacion.golpe];
    if (!golpeData) return alert('No hay datos del golpe.');

    for (const [parKey, parData] of Object.entries(golpeData.pares)) {
      const seleccionesPar = evaluacion.selecciones[parKey] || {};
      for (const cuant of parData.cuantificadores) {
        const catActual = seleccionesPar[cuant.id];
        if (catActual && catActual > objetivo) {
          for (let cat = catActual; cat > objetivo; cat--) {
            const transicion = `${cat}_${cat-1}`;
            const ejercicio = window.EJERCICIOS?.[evaluacion.golpe]?.[parKey]?.[cuant.id]?.[transicion];
            if (ejercicio) {
              ejercicios.push({
                parKey,
                cuantId: cuant.id,
                nombreCuant: cuant.nombre,
                transicion,
                catInicio: cat,
                catFin: cat - 1,
                ejercicio,
                totalSeries: ejercicio.series,
                totalRepsPorSerie: parseInt(ejercicio.repeticiones),
                criterioExigido: ejercicio.criterioExito,
                minimoExitos: extraerMinimoCriterio(ejercicio.criterioExito, ejercicio.series * parseInt(ejercicio.repeticiones))
              });
            }
          }
        }
      }
    }

    if (ejercicios.length === 0) {
      sesionContent.innerHTML = '<p>✅ Ya alcanza la categoría objetivo en todos los aspectos.</p>';
      planSesion = null;
      guardarSesionBtn.style.display = 'none';
      return;
    }

    planSesion = {
      jugador: evaluacion.jugador,
      golpe: evaluacion.golpe,
      objetivo,
      ejercicios
    };
    ejerciciosCompletados = new Array(ejercicios.length).fill(false);

    let html = `<h3>Plan para ${evaluacion.jugador} (objetivo: ${objetivo}ª)</h3>`;
    ejercicios.forEach((ej, index) => {
      html += `
        <div class="sesion-ejercicio" id="ejercicio-${index}">
          <h4>${ej.nombreCuant} – ${ej.transicion.replace('_', 'ª → ')}ª</h4>
          <p><em>${ej.ejercicio.nombre}</em></p>
          <p>${ej.totalSeries} series x ${ej.totalRepsPorSerie} rep. | Criterio: ${ej.criterioExigido}</p>
          <div class="sesion-campos">
            <label>Series completadas:</label>
            <input type="number" min="0" max="${ej.totalSeries}" value="0" data-index="${index}" data-campo="series" ${ejerciciosCompletados[index] ? 'disabled' : ''}>
            <label>Reps exitosas:</label>
            <input type="number" min="0" max="${ej.totalSeries * ej.totalRepsPorSerie}" value="0" data-index="${index}" data-campo="exitosas" ${ejerciciosCompletados[index] ? 'disabled' : ''}>
            <button class="btn-primary btn-chico finalizar-ejercicio" data-index="${index}" ${ejerciciosCompletados[index] ? 'disabled' : ''}>✔ Finalizar</button>
            ${ejerciciosCompletados[index] ? '<span class="completado-msg">✅ Completado</span>' : ''}
          </div>
        </div>
      `;
    });
    sesionContent.innerHTML = html;
    guardarSesionBtn.style.display = 'inline-block';

    document.querySelectorAll('.finalizar-ejercicio').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const idxEj = parseInt(ev.target.dataset.index);
        finalizarEjercicio(idxEj);
      });
    });

    // FIX #4: cargar historial previo al mostrar el plan (no solo al guardar)
    cargarHistorialSesiones();
  });

  function extraerMinimoCriterio(criterioTexto, totalPosibles) {
    const match = criterioTexto.match(/(\d+)\s*de\s*(\d+)/);
    if (match) return parseInt(match[1]);
    return Math.ceil(totalPosibles * 0.7);
  }

  function finalizarEjercicio(idx) {
    const ejercicioDiv = document.getElementById(`ejercicio-${idx}`);
    if (!ejercicioDiv) return;
    const inputs = ejercicioDiv.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);
    const btn = ejercicioDiv.querySelector('.finalizar-ejercicio');
    if (btn) btn.disabled = true;
    if (!ejercicioDiv.querySelector('.completado-msg')) {
      btn.insertAdjacentHTML('afterend', '<span class="completado-msg">✅ Completado</span>');
    }
    ejerciciosCompletados[idx] = true;
    const series = parseInt(inputs[0].value) || 0;
    const exitosas = parseInt(inputs[1].value) || 0;
    if (planSesion) {
      planSesion.ejercicios[idx].seriesRealizadas = series;
      planSesion.ejercicios[idx].repeticionesExitosas = exitosas;
    }
  }

  guardarSesionBtn.addEventListener('click', () => {
    if (!planSesion) return alert('No hay plan cargado.');
    const inputs = sesionContent.querySelectorAll('input');
    inputs.forEach(input => {
      const idx = parseInt(input.dataset.index);
      const campo = input.dataset.campo;
      if (!isNaN(idx) && planSesion.ejercicios[idx]) {
        planSesion.ejercicios[idx][campo] = parseInt(input.value) || 0;
      }
    });

    const sesionParaGuardar = {
      id: Date.now(),
      fecha: new Date().toLocaleString(),
      jugador: planSesion.jugador,
      golpe: planSesion.golpe,
      objetivo: planSesion.objetivo,
      ejercicios: planSesion.ejercicios.map(ej => ({
        nombreCuant: ej.nombreCuant,
        transicion: ej.transicion,
        seriesRealizadas: ej.seriesRealizadas || 0,
        repeticionesExitosas: ej.repeticionesExitosas || 0,
        totalSeries: ej.totalSeries,
        totalRepsPorSerie: ej.totalRepsPorSerie,
        criterioExigido: ej.criterioExigido,
        minimoExitos: ej.minimoExitos
      }))
    };

    let sesiones = JSON.parse(localStorage.getItem('padelSesiones')) || [];
    sesiones.push(sesionParaGuardar);
    localStorage.setItem('padelSesiones', JSON.stringify(sesiones));

    mostrarResultadoSesion(planSesion);
    alert('✅ Sesión guardada correctamente.');
    cargarHistorialSesiones();
  });

  function mostrarResultadoSesion(plan) {
    const viejoResultado = document.getElementById('resultadoSesion');
    if (viejoResultado) viejoResultado.remove();

    const resultadoDiv = document.createElement('div');
    resultadoDiv.id = 'resultadoSesion';
    resultadoDiv.className = 'resultado-sesion';
    resultadoDiv.innerHTML = '<h3>📊 Resultado de la Sesión</h3>';

    const idxEva = alumnoSelectSeg.value;
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    const evaluacion = historial[parseInt(idxEva)];
    const categoriasActuales = {};
    // Map para guardar también el nombre legible del cuantificador
    const nombresCuant = {};

    if (evaluacion) {
      const golpeData = DATA.golpes[evaluacion.golpe];
      for (const [parKey, sels] of Object.entries(evaluacion.selecciones)) {
        for (const [cuantId, cat] of Object.entries(sels)) {
          categoriasActuales[cuantId] = cat;
        }
      }
      // FIX #2: poblar nombres legibles desde DATA
      if (golpeData) {
        for (const parData of Object.values(golpeData.pares)) {
          for (const cuant of parData.cuantificadores) {
            nombresCuant[cuant.id] = cuant.nombre;
          }
        }
      }
    }

    const objetivo = plan.objetivo;
    const resultadosPorCuant = {};

    for (const cuantId of Object.keys(categoriasActuales)) {
      resultadosPorCuant[cuantId] = {
        // FIX #2: guardar nombre legible en el objeto
        nombre: nombresCuant[cuantId] || cuantId,
        catActual: categoriasActuales[cuantId] || 7,
        catAlcanzada: categoriasActuales[cuantId] || 7,
        superado: false,
        ejercicios: []
      };
    }

    plan.ejercicios.forEach(ej => {
      if (!resultadosPorCuant[ej.cuantId]) {
        resultadosPorCuant[ej.cuantId] = {
          // FIX #2: usar nombreCuant del ejercicio si no estaba en el map
          nombre: ej.nombreCuant,
          catActual: categoriasActuales[ej.cuantId] || 7,
          catAlcanzada: categoriasActuales[ej.cuantId] || 7,
          superado: false,
          ejercicios: []
        };
      }
      const exito = ej.repeticionesExitosas >= ej.minimoExitos;
      resultadosPorCuant[ej.cuantId].ejercicios.push({
        transicion: ej.transicion,
        catInicio: ej.catInicio,
        catFin: ej.catFin,
        exito,
        repeticionesExitosas: ej.repeticionesExitosas,
        minimoExitos: ej.minimoExitos
      });
      if (exito && ej.catFin < resultadosPorCuant[ej.cuantId].catAlcanzada) {
        resultadosPorCuant[ej.cuantId].catAlcanzada = ej.catFin;
      }
    });

    let globalAscenso = 0, globalRepetir = 0, globalDescenso = 0;
    // FIX #2: usar datos.nombre en lugar de cuantId en la tabla
    let tablaHTML = '<table class="tabla-veredicto"><tr><th>Cuantificador</th><th>Cat. Actual</th><th>Objetivo</th><th>Cat. Alcanzada</th><th>Veredicto</th></tr>';

    for (const [cuantId, datos] of Object.entries(resultadosPorCuant)) {
      const catActual = datos.catActual;
      const catAlcanzada = datos.catAlcanzada;
      let veredicto = '';

      if (catAlcanzada <= objetivo) {
        veredicto = '⬆ Ascender';
        globalAscenso++;
      } else if (catAlcanzada > catActual) {
        veredicto = '⬇ Descender';
        globalDescenso++;
      } else {
        veredicto = '↻ Repetir';
        globalRepetir++;
      }

      tablaHTML += `<tr>
        <td>${datos.nombre}</td>
        <td>${catActual}ª</td>
        <td>${objetivo}ª</td>
        <td>${catAlcanzada}ª</td>
        <td>${veredicto}</td>
      </tr>`;
    }
    tablaHTML += '</table>';

    let veredictoGlobal = '';
    if (globalDescenso > 0) {
      veredictoGlobal = '<span class="veredicto descenso">⬇ DESCENDER</span> (al menos un aspecto retrocedió)';
    } else if (globalRepetir > 0) {
      veredictoGlobal = '<span class="veredicto repetir">↻ REPETIR</span> (aún no alcanza el objetivo)';
    } else {
      veredictoGlobal = '<span class="veredicto ascenso">⬆ ASCENDER</span> (todos los aspectos logrados)';
    }

    resultadoDiv.innerHTML += tablaHTML + `<p class="veredicto-global">${veredictoGlobal}</p>`;
    sesionContent.appendChild(resultadoDiv);
  }

  function cargarHistorialSesiones() {
    const idx = alumnoSelectSeg.value;
    if (idx === '') return;
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    const eva = historial[parseInt(idx)];
    if (!eva) return;

    const sesiones = JSON.parse(localStorage.getItem('padelSesiones')) || [];
    const sesionesAlumno = sesiones.filter(s => s.jugador === eva.jugador && s.golpe === eva.golpe);

    let containerHistorial = document.getElementById('historialSesiones');
    if (!containerHistorial) {
      containerHistorial = document.createElement('div');
      containerHistorial.className = 'historial-sesiones';
      containerHistorial.id = 'historialSesiones';
      sesionContent.appendChild(containerHistorial);
    }
    containerHistorial.innerHTML = '';

    if (sesionesAlumno.length === 0) {
      containerHistorial.innerHTML = '<p>No hay sesiones anteriores para este alumno.</p>';
      return;
    }

    containerHistorial.innerHTML = '<h3>📅 Sesiones anteriores</h3>';
    sesionesAlumno.slice(-5).reverse().forEach(ses => {
      const div = document.createElement('div');
      div.className = 'sesion-ejercicio';
      let innerHTML = `<strong>${ses.fecha}</strong> – Objetivo: ${ses.objetivo}ª<br>`;
      ses.ejercicios.forEach(ej => {
        innerHTML += `${ej.nombreCuant}: ${ej.seriesRealizadas} de ${ej.totalSeries} series, ${ej.repeticionesExitosas} éxitos<br>`;
      });
      div.innerHTML = innerHTML;
      containerHistorial.appendChild(div);
    });
  }

  // ========== INICIALIZAR ==========
  renderizarGolpe('smash');
});
