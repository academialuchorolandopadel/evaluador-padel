// ==================== APP.JS COMPLETO (con Seguimiento + Veredicto) ====================
document.addEventListener('DOMContentLoaded', () => {
  // Elementos principales (se mantienen igual)
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
      body.classList.remove('modo-alumno'); body.classList.add('modo-fiscal');
    } else {
      body.classList.remove('modo-fiscal'); body.classList.add('modo-alumno');
    }
  }
  modoFiscalCheckbox.addEventListener('change', actualizarModo);
  actualizarModo();

  // Navegación principal
  mainNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      // ... (sin cambios)
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

  // Sidebar golpes (sin cambios)
  golpesList.addEventListener('click', (e) => { /*...*/ });
  function renderizarGolpe(golpeId) { /*... igual que antes ...*/ }
  function diagnosticarPar(parKey) { /*...*/ }
  function calcularModa(arr) { /*...*/ }
  function evaluarGolpeCompleto() { /*...*/ }
  function guardarEvaluacion() { /*...*/ }
  function cargarHistorial() { /*...*/ }
  // Eventos de historial (sin cambios)

  // ========== ENTRENAMIENTO (sin cambios) ==========
  const alumnoSelect = document.getElementById('alumnoSelect');
  const categoriaObjetivo = document.getElementById('categoriaObjetivo');
  const generarPlanBtn = document.getElementById('generarPlanBtn');
  const descargarPlanBtn = document.getElementById('descargarPlanBtn');
  const planEntrenamiento = document.getElementById('planEntrenamiento');

  function cargarAlumnosEnSelect() { /*...*/ }
  generarPlanBtn.addEventListener('click', () => { /*...*/ });
  descargarPlanBtn.addEventListener('click', () => { /*...*/ });
  function construirPlan(evaluacion, objetivo) { /*...*/ }

  // ========== ALUMNOS (sin cambios) ==========
  const alumnosLista = document.getElementById('alumnosLista');
  function cargarAlumnos() { /*...*/ }

  // ========== SEGUIMIENTO EN CLASE (MEJORADO + VEREDICTO) ==========
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
                catFin: cat-1,
                ejercicio,
                totalSeries: ejercicio.series,
                totalRepsPorSerie: parseInt(ejercicio.repeticiones),
                // Guardamos también el criterio numérico para comparación automática
                criterioExigido: ejercicio.criterioExito,
                // Podemos extraer número mínimo del criterio (aprox)
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

    // Eventos para finalizar ejercicio
    document.querySelectorAll('.finalizar-ejercicio').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        finalizarEjercicio(idx);
      });
    });
  });

  function extraerMinimoCriterio(criterioTexto, totalPosibles) {
    // Intenta extraer el número mínimo del texto del criterio, por ejemplo "7 de 10"
    const match = criterioTexto.match(/(\d+)\s*de\s*(\d+)/);
    if (match) {
      return parseInt(match[1]); // el número requerido
    }
    // fallback: 70% del total
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
    // Guardar valores en planSesion
    const series = parseInt(inputs[0].value) || 0;
    const exitosas = parseInt(inputs[1].value) || 0;
    if (planSesion) {
      planSesion.ejercicios[idx].seriesRealizadas = series;
      planSesion.ejercicios[idx].repeticionesExitosas = exitosas;
    }
  }

  guardarSesionBtn.addEventListener('click', () => {
    if (!planSesion) return alert('No hay plan cargado.');

    // Recolectar valores actuales de los inputs
    const inputs = sesionContent.querySelectorAll('input');
    inputs.forEach(input => {
      const idx = parseInt(input.dataset.index);
      const campo = input.dataset.campo;
      if (!isNaN(idx) && planSesion.ejercicios[idx]) {
        planSesion.ejercicios[idx][campo] = parseInt(input.value) || 0;
      }
    });

    // Guardar sesión en localStorage
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

    // Mostrar resultado detallado de la sesión
    mostrarResultadoSesion(planSesion);
    alert('✅ Sesión guardada correctamente.');
  });

  function mostrarResultadoSesion(plan) {
    // Eliminar resultado anterior si existe
    const viejoResultado = document.getElementById('resultadoSesion');
    if (viejoResultado) viejoResultado.remove();

    const resultadoDiv = document.createElement('div');
    resultadoDiv.id = 'resultadoSesion';
    resultadoDiv.className = 'resultado-sesion';
    resultadoDiv.innerHTML = '<h3>📊 Resultado de la Sesión</h3>';

    // Obtener evaluación actual para comparar categoría de cada cuantificador
    const idxEva = alumnoSelectSeg.value;
    const historial = JSON.parse(localStorage.getItem('padelEvalHistorial')) || [];
    const evaluacion = historial[parseInt(idxEva)];
    const categoriasActuales = {};
    if (evaluacion) {
      for (const [parKey, sels] of Object.entries(evaluacion.selecciones)) {
        for (const [cuantId, cat] of Object.entries(sels)) {
          categoriasActuales[cuantId] = cat;
        }
      }
    }

    const objetivo = plan.objetivo;
    const resultadosPorCuant = {};

    // Inicializar con categoría actual
    for (const cuantId of Object.keys(categoriasActuales)) {
      resultadosPorCuant[cuantId] = {
        catActual: categoriasActuales[cuantId] || 7,
        catAlcanzada: categoriasActuales[cuantId] || 7,
        superado: false,
        ejercicios: []
      };
    }

    // Procesar ejercicios del plan
    plan.ejercicios.forEach(ej => {
      if (!resultadosPorCuant[ej.cuantId]) {
        resultadosPorCuant[ej.cuantId] = {
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
      // Actualizar categoría alcanzada si tuvo éxito en esta transición
      if (exito && ej.catFin < resultadosPorCuant[ej.cuantId].catAlcanzada) {
        resultadosPorCuant[ej.cuantId].catAlcanzada = ej.catFin;
      }
    });

    // Determinar veredicto por cuantificador
    let globalAscenso = 0, globalRepetir = 0, globalDescenso = 0;
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
      } else { // catAlcanzada === catActual o entre actual y objetivo
        veredicto = '↻ Repetir';
        globalRepetir++;
      }

      tablaHTML += `<tr>
        <td>${cuantId}</td>
        <td>${catActual}ª</td>
        <td>${objetivo}ª</td>
        <td>${catAlcanzada}ª</td>
        <td>${veredicto}</td>
      </tr>`;
    }
    tablaHTML += '</table>';

    // Veredicto global
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

  // Mostrar historial de sesiones (sin cambios)
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

    sesionesAlumno.slice(-5).reverse().forEach(ses => {
      const div = document.createElement('div');
      div.className = 'sesion-ejercicio';
      let innerHTML = `<strong>${ses.fecha}</strong> - Objetivo: ${ses.objetivo}ª<br>`;
      ses.ejercicios.forEach(ej => {
        innerHTML += `${ej.nombreCuant}: ${ej.seriesRealizadas} de ${ej.totalSeries} series, ${ej.repeticionesExitosas} éxitos de ${ej.totalSeries * ej.totalRepsPorSerie} posibles<br>`;
      });
      div.innerHTML = innerHTML;
      containerHistorial.appendChild(div);
    });
  }

  // ========== ESTILOS ADICIONALES (agregar en styles.css) ==========
  // Se incluyen en el siguiente bloque de estilos.

  // Inicializar
  renderizarGolpe('smash');
});
