// ==================== APP.JS – VERSIÓN COMPLETA (GRÁFICOS + FORTALEZAS + JUGADOR POR ROL) ====================
document.addEventListener('DOMContentLoaded', () => {

  const mainNav            = document.getElementById('mainNav');
  const views              = document.querySelectorAll('.view');
  const golpesList         = document.getElementById('golpesList');
  const golpeContent       = document.getElementById('golpeContent');
  const playerNameInput    = document.getElementById('playerName');
  const historialLista     = document.getElementById('historialLista');
  const limpiarHistorialBtn= document.getElementById('limpiarHistorialBtn');
  const body               = document.body;

  let golpeActual      = 'smash';
  let evaluacionesCache= {};
  let planGeneradoHTML = '';

  // ========== MODO ALUMNO/PROFESOR/FISCAL ==========
  function aplicarModoSegunRol(rol) {
    const modoBadge = document.getElementById('modoBadge');
    if (rol === 'profesor' || rol === 'fiscal') {
      body.classList.remove('modo-alumno');
      body.classList.add('modo-fiscal');
      if (modoBadge) modoBadge.textContent = rol === 'fiscal' ? 'Modo Fiscal' : 'Modo Profesor';
    } else {
      body.classList.remove('modo-fiscal');
      body.classList.add('modo-alumno');
      if (modoBadge) modoBadge.textContent = 'Modo Alumno';
    }
  }

  // ========== CONFIGURAR INTERFAZ SEGÚN ROL (incluye campo jugador) ==========
  function configurarInterfazSegunRol() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const rol = userData.rol || 'alumno';
    const esProfesorOFiscal = (rol === 'profesor' || rol === 'fiscal');
    
    // Mostrar/ocultar pestañas
    const tabsProfesor = document.querySelectorAll('.solo-profesor');
    const tabsAlumno = document.querySelectorAll('.solo-alumno');
    tabsProfesor.forEach(tab => tab.style.display = esProfesorOFiscal ? '' : 'none');
    tabsAlumno.forEach(tab => tab.style.display = esProfesorOFiscal ? 'none' : '');
    
    const adminTab = document.querySelector('.tab[data-view="admin"]');
    const nuevaPlanificacionTab = document.querySelector('.tab[data-view="nuevaPlanificacion"]');
    if (adminTab) adminTab.style.display = esProfesorOFiscal ? '' : 'none';
    if (nuevaPlanificacionTab) nuevaPlanificacionTab.style.display = esProfesorOFiscal ? '' : 'none';
    
    // ========== CAMPO JUGADOR SEGÚN ROL ==========
    const jugadorDiv = document.getElementById('jugadorInfoDiv');
    const inputNombre = document.getElementById('playerName');
    const selectAlumnos = document.getElementById('alumnoSelectEval');
    
    if (esProfesorOFiscal) {
      // Modo profesor/fiscal: mostrar select con alumnos, ocultar input
      if (inputNombre) inputNombre.style.display = 'none';
      if (selectAlumnos) {
        selectAlumnos.style.display = 'block';
        cargarAlumnosSelectEvaluacion(); // llenar el select
      }
      if (jugadorDiv) jugadorDiv.querySelector('label').innerHTML = 'Evaluar a:';
    } else {
      // Modo alumno: mostrar input con su nombre (solo lectura), ocultar select
      if (inputNombre) {
        inputNombre.style.display = 'block';
        inputNombre.value = window.currentUserData?.nombre || '';
        inputNombre.readOnly = true;
      }
      if (selectAlumnos) selectAlumnos.style.display = 'none';
      if (jugadorDiv) jugadorDiv.querySelector('label').innerHTML = 'Tu nombre:';
    }
  }

  // Función auxiliar para cargar alumnos vinculados en el select de evaluación (para profesores)
  async function cargarAlumnosSelectEvaluacion() {
    const select = document.getElementById('alumnoSelectEval');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    try {
      const vinculaciones = await db.collection('vinculaciones')
        .where('profesorUid', '==', window.currentUser.uid)
        .get();
      for (const doc of vinculaciones.docs) {
        const data = doc.data();
        const opt = document.createElement('option');
        opt.value = data.alumnoUid;
        opt.textContent = data.alumnoNombre || 'Alumno sin nombre';
        select.appendChild(opt);
      }
      if (vinculaciones.size === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'No hay alumnos vinculados';
        opt.disabled = true;
        select.appendChild(opt);
      }
    } catch (err) {
      console.error('Error cargando alumnos para evaluar:', err);
    }
  }

  window.aplicarModoSegunRol = aplicarModoSegunRol;
  window.configurarInterfazSegunRol = configurarInterfazSegunRol;

  // ========== NAVEGACIÓN ==========
  mainNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      const view = e.target.dataset.view;
      mainNav.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(view + 'View').classList.add('active');
      if (view === 'historial')           cargarHistorial().catch(console.error);
      if (view === 'entrenamiento')       cargarAlumnosEnSelect().catch(console.error);
      if (view === 'alumnos')             cargarAlumnos().catch(console.error);
      if (view === 'seguimiento')         cargarAlumnosSeguimiento().catch(console.error);
      if (view === 'planificaciones')     cargarPlanificacionesAlumno().catch(console.error);
      if (view === 'nuevaPlanificacion')  cargarAlumnosParaPlanificacion().catch(console.error);
      if (view === 'admin')               cargarAdminUsuarios().catch(console.error);
      if (view === 'progreso')            cargarProgreso().catch(console.error);
      if (view === 'fortalezas')          analizarFortalezasDebilidades().catch(console.error);
    }
  });

  // ========== SIDEBAR GOLPES ==========
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
      html += `<div class="par-acordeon"><div class="par-header" data-par="${parKey}"><h3>${parData.nombre}</h3><span class="toggle-icon">▼</span></div><div class="par-body collapsed" id="body-${parKey}"><div class="evaluador-grid" id="grid-${parKey}"></div><div class="actions"><button class="btn-primary diagnosticar-par" data-par="${parKey}">🔍 Diagnosticar Par</button></div><div class="resultado-par" id="result-${parKey}" style="display:none;"></div></div></div>`;
    }
    html += `<div class="actions" style="margin-top:24px;"><button id="btnGuardar" class="btn-primary">💾 Guardar Evaluación</button><button id="btnEvaluacionGlobal" class="btn-primary">📊 Evaluación Global</button></div><div class="diagnostico-golpe" id="globalGolpe" style="display:none;"><h3>🏆 Evaluación Global del Golpe</h3><p id="globalGolpeTexto"></p></div>`;
    golpeContent.innerHTML = html;

    for (const [parKey, parData] of Object.entries(pares)) {
      const grid = document.getElementById(`grid-${parKey}`);
      parData.cuantificadores.forEach(cuant => {
        const card = document.createElement('div');
        card.className = 'cuantificador-card';
        card.innerHTML = `<div class="card-header"><h3>${cuant.nombre}</h3><span class="info-icon" title="${cuant.descripcion}">ⓘ</span></div><p class="card-desc">${cuant.descripcion}</p><div class="opciones-grid">${[7,6,5,4,3,2].map(cat => `<label class="opcion-card"><input type="radio" name="${parKey}_${cuant.id}" value="${cat}" hidden><span class="cat-badge cat-${cat}">${cat}ª</span><span class="opcion-texto">${cuant.categorias[cat]}</span></label>`).join('')}</div>`;
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
      modas.push(calcularModa(Object.values(evaluacionesCache[parKey])));
    }
    const min = Math.min(...modas), max = Math.max(...modas);
    let texto = '';
    if (min === max) texto = `Rendimiento consistente de <strong>${min}ª categoría</strong>.`;
    else if (max - min === 1) texto = `Rendimiento entre <strong>${min}ª y ${max}ª categoría</strong>.`;
    else texto = `Dispersión amplia (${min}ª a ${max}ª). Revisar pares individuales.`;
    document.getElementById('globalGolpeTexto').innerHTML = texto;
    document.getElementById('globalGolpe').style.display = 'block';
  }

  // ==================== FIRESTORE ====================
  async function cargarEvaluacionesDesdeFirestore(forzar = false) {
    if (window.evaluacionesCargadas !== null && !forzar) return window.evaluacionesCargadas;
    if (!window.currentUser) return [];
    try {
      let ref;
      if (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal') {
        ref = db.collection('evaluaciones').orderBy('fecha', 'desc').limit(200);
      } else {
        ref = db.collection('evaluaciones').where('uid', '==', window.currentUser.uid).orderBy('fecha', 'desc').limit(100);
      }
      const snapshot = await ref.get();
      window.evaluacionesCargadas = snapshot.docs.map(doc => ({...doc.data(), firestoreId: doc.id, id: doc.id, fecha: doc.data().fechaLocal || new Date().toLocaleString()}));
      return window.evaluacionesCargadas;
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
      window.evaluacionesCargadas = [];
      return [];
    }
  }

  async function guardarEvaluacion() {
    if (!window.currentUser) return alert('⚠️ Debés iniciar sesión para guardar.');
    if (Object.keys(evaluacionesCache).length === 0) return alert('⚠️ Diagnosticá al menos un par antes de guardar.');
    
    let nombre;
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    
    if (esProfesor) {
      const select = document.getElementById('alumnoSelectEval');
      const selectedOption = select.options[select.selectedIndex];
      if (!selectedOption || !selectedOption.value) {
        return alert('⚠️ Seleccioná un alumno para evaluar.');
      }
      nombre = selectedOption.textContent;
    } else {
      nombre = window.currentUserData?.nombre || 'Sin nombre';
    }
    
    const evaluacion = {
      uid: window.currentUser.uid,
      evaluadorUid: window.currentUser.uid,
      evaluadorNombre: window.currentUserData?.nombre || '',
      tipo: esProfesor ? (window.currentUserData?.rol === 'fiscal' ? 'fiscal' : 'profesor') : 'autoevaluacion',
      jugador: nombre,
      golpe: golpeActual,
      selecciones: evaluacionesCache,
      fecha: window.firebase.firestore.FieldValue.serverTimestamp(),
      fechaLocal: new Date().toLocaleString()
    };
    try {
      await db.collection('evaluaciones').add(evaluacion);
      window.evaluacionesCargadas = null;
      alert('✅ Evaluación guardada correctamente.');
    } catch (err) { alert('❌ Error al guardar: ' + err.message); }
  }

  // ========== HISTORIAL ==========
  async function cargarHistorial() {
    if (!window.currentUser) { historialLista.innerHTML = '<p>Iniciá sesión para ver tu historial.</p>'; return; }
    historialLista.innerHTML = '<p>Cargando evaluaciones...</p>';
    const historial = await cargarEvaluacionesDesdeFirestore(true);
    historialLista.innerHTML = '';
    if (historial.length === 0) { historialLista.innerHTML = '<p>No hay evaluaciones guardadas.</p>'; return; }
    historial.forEach(eva => {
      const div = document.createElement('div');
      div.className = 'historial-item';
      const badge = eva.tipo === 'profesor' ? '<span class="badge-tipo profesor">🔍 Profesor</span>' :
                    eva.tipo === 'fiscal'   ? '<span class="badge-tipo fiscal">📋 Fiscal</span>' :
                    '<span class="badge-tipo alumno">👤 Alumno</span>';
      div.innerHTML = `<div class="info">${badge} <strong>${eva.jugador}</strong> – ${eva.golpe} – ${eva.fecha}${eva.evaluadorNombre ? `<br><small>Por: ${eva.evaluadorNombre}</small>` : ''}</div><div class="btn-group"><button class="btn-secondary cargarEva" data-id="${eva.firestoreId}">📂 Cargar</button><button class="btn-secondary eliminarEva" data-id="${eva.firestoreId}">🗑️</button></div>`;
      historialLista.appendChild(div);
    });
  }

  historialLista.addEventListener('click', async (e) => {
    if (e.target.classList.contains('cargarEva')) {
      const id = e.target.dataset.id;
      const historial = window.evaluacionesCargadas || [];
      const eva = historial.find(item => item.firestoreId === id);
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
      const id = e.target.dataset.id;
      if (!confirm('¿Eliminar esta evaluación?')) return;
      try { await db.collection('evaluaciones').doc(id).delete(); window.evaluacionesCargadas = null; cargarHistorial(); }
      catch (err) { alert('Error al eliminar: ' + err.message); }
    }
  });

  limpiarHistorialBtn?.addEventListener('click', async () => {
    if (!window.currentUser) return;
    if (!confirm('¿Borrar TODAS tus evaluaciones propias?')) return;
    try {
      const snapshot = await db.collection('evaluaciones').where('uid', '==', window.currentUser.uid).get();
      if (snapshot.empty) { alert('No hay evaluaciones para borrar.'); return; }
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      window.evaluacionesCargadas = null;
      cargarHistorial();
    } catch (err) { alert('Error al limpiar: ' + err.message); }
  });

  // ========== ENTRENAMIENTO ==========
  const alumnoSelect = document.getElementById('alumnoSelect');
  const categoriaObjetivo = document.getElementById('categoriaObjetivo');
  const generarPlanBtn = document.getElementById('generarPlanBtn');
  const descargarPlanBtn = document.getElementById('descargarPlanBtn');
  const planEntrenamiento = document.getElementById('planEntrenamiento');

  async function cargarAlumnosEnSelect() {
    if (!window.currentUser) return;
    const historial = await cargarEvaluacionesDesdeFirestore();
    alumnoSelect.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    historial.forEach((eva, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${eva.jugador} – ${eva.golpe} (${eva.fecha})`;
      alumnoSelect.appendChild(opt);
    });
  }

  generarPlanBtn.addEventListener('click', () => {
    const idx = alumnoSelect.value;
    if (idx === '') return alert('⚠️ Seleccioná un alumno.');
    const historial = window.evaluacionesCargadas || [];
    const evaluacion = historial[parseInt(idx)];
    if (!evaluacion) return alert('Error: evaluación no encontrada.');
    const objetivo = parseInt(categoriaObjetivo.value);
    planGeneradoHTML = construirPlan(evaluacion, objetivo);
    planEntrenamiento.innerHTML = planGeneradoHTML;
    descargarPlanBtn.style.display = 'inline-block';
  });

  descargarPlanBtn.addEventListener('click', () => {
    const ventana = window.open('', '_blank');
    ventana.document.write(`<html><head><title>Plan</title><style>body{font-family:Arial;padding:20px;}</style></head><body>${planGeneradoHTML}</body></html>`);
    ventana.document.close();
    ventana.print();
  });

  function construirPlan(evaluacion, objetivo) {
    let html = `<h2>Plan para ${evaluacion.jugador}</h2><p><strong>Golpe:</strong> ${evaluacion.golpe} | <strong>Objetivo:</strong> ${objetivo}ª</p>`;
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
              ejerciciosPar += `<div class="ejercicio-item"><strong>${cuant.nombre} (${cat}ª → ${cat-1}ª):</strong> ${ejercicio.nombre}<br><span class="series">${ejercicio.series} series x ${ejercicio.repeticiones}</span><br><em>${ejercicio.descripcion}</em><br>✅ Criterio: ${ejercicio.criterioExito}</div>`;
              encontro = true;
            }
          }
        }
      }
      if (ejerciciosPar) html += `<div class="plan-par"><h4>${parData.nombre}</h4>${ejerciciosPar}</div>`;
    }
    if (!encontro) html += '<p>✅ Ya alcanza o supera el nivel en todos los aspectos.</p>';
    return html;
  }

// ========== ALUMNOS (para profesores: lista de alumnos vinculados) ==========
const alumnosLista = document.getElementById('alumnosLista');

async function cargarAlumnos() {
  if (!window.currentUser) {
    alumnosLista.innerHTML = '<p>Iniciá sesión para ver alumnos.</p>';
    return;
  }

  const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');

  if (!esProfesor) {
    // Los alumnos normales no ven esta pestaña (debería estar oculta, pero por si acaso)
    alumnosLista.innerHTML = '<p>No tenés permisos para ver esta sección.</p>';
    return;
  }

  alumnosLista.innerHTML = '<p>Cargando lista de alumnos vinculados...</p>';

  try {
    // Obtener todas las vinculaciones donde este profesor es el que enseña
    const vinculacionesSnap = await db.collection('vinculaciones')
      .where('profesorUid', '==', window.currentUser.uid)
      .get();

    if (vinculacionesSnap.empty) {
      alumnosLista.innerHTML = '<p>No tenés alumnos vinculados todavía. Usá la pestaña "Admin" para agregar alumnos.</p>';
      return;
    }

    // Para cada vinculación, obtener los datos del alumno desde la colección 'usuarios'
    let html = '';
    for (const doc of vinculacionesSnap.docs) {
      const vinculacion = doc.data();
      const alumnoUid = vinculacion.alumnoUid;
      const nombreVinculacion = vinculacion.alumnoNombre || 'Sin nombre';

      // Obtener datos completos del alumno (opcional, para mostrar email)
      let alumnoData = { email: 'No disponible', rol: 'alumno' };
      try {
        const alumnoDoc = await db.collection('usuarios').doc(alumnoUid).get();
        if (alumnoDoc.exists) {
          alumnoData = alumnoDoc.data();
        }
      } catch (err) {
        console.warn('No se pudo obtener datos del alumno', alumnoUid, err);
      }

      html += `
        <div class="alumno-card" data-uid="${alumnoUid}">
          <h3>${nombreVinculacion}</h3>
          <p>Email: ${alumnoData.email || 'No disponible'}</p>
          <p>Rol: ${alumnoData.rol === 'profesor' ? 'Profesor' : 'Alumno'}</p>
          <div class="alumno-acciones">
            <button class="btn-secondary btn-chico ver-evaluaciones-alumno" data-uid="${alumnoUid}" data-nombre="${nombreVinculacion}">📋 Ver evaluaciones</button>
            <button class="btn-secondary btn-chico ver-planificaciones-alumno" data-uid="${alumnoUid}" data-nombre="${nombreVinculacion}">📅 Planificaciones</button>
          </div>
          <div id="evaluaciones-${alumnoUid}" style="display:none; margin-top:12px;"></div>
          <div id="planificaciones-${alumnoUid}" style="display:none; margin-top:12px;"></div>
        </div>
      `;
    }

    alumnosLista.innerHTML = html;

    // Agregar eventos a los botones de cada alumno
    document.querySelectorAll('.ver-evaluaciones-alumno').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = btn.dataset.uid;
        const nombre = btn.dataset.nombre;
        const container = document.getElementById(`evaluaciones-${uid}`);
        if (container.style.display === 'none') {
          container.style.display = 'block';
          container.innerHTML = '<p>Cargando evaluaciones...</p>';
          try {
            const evaluacionesSnap = await db.collection('evaluaciones')
              .where('uid', '==', uid)
              .orderBy('fecha', 'desc')
              .limit(20)
              .get();
            if (evaluacionesSnap.empty) {
              container.innerHTML = '<p>Este alumno aún no tiene evaluaciones.</p>';
            } else {
              let evaHtml = '<h4>Evaluaciones recientes</h4><ul>';
              evaluacionesSnap.forEach(doc => {
                const eva = doc.data();
                evaHtml += `<li><strong>${eva.golpe}</strong> - ${eva.fechaLocal || 'Sin fecha'} - Categoría promedio: ${calcularPromedioEvaluacion(eva.selecciones)}ª</li>`;
              });
              evaHtml += '</ul>';
              container.innerHTML = evaHtml;
            }
          } catch (err) {
            container.innerHTML = `<p>Error: ${err.message}</p>`;
          }
          btn.textContent = '🔼 Ocultar evaluaciones';
        } else {
          container.style.display = 'none';
          btn.textContent = '📋 Ver evaluaciones';
        }
      });
    });

    document.querySelectorAll('.ver-planificaciones-alumno').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = btn.dataset.uid;
        const nombre = btn.dataset.nombre;
        const container = document.getElementById(`planificaciones-${uid}`);
        if (container.style.display === 'none') {
          container.style.display = 'block';
          container.innerHTML = '<p>Cargando planificaciones...</p>';
          try {
            const planesSnap = await db.collection('planificaciones')
              .where('alumnoUid', '==', uid)
              .orderBy('fecha', 'desc')
              .limit(10)
              .get();
            if (planesSnap.empty) {
              container.innerHTML = '<p>No hay planificaciones para este alumno.</p>';
            } else {
              let planHtml = '<h4>Planificaciones asignadas</h4><ul>';
              planesSnap.forEach(doc => {
                const plan = doc.data();
                planHtml += `<li><strong>${plan.golpe}</strong> - Objetivo ${plan.objetivo}ª - Estado: ${plan.estado || 'pendiente'}</li>`;
              });
              planHtml += '</ul>';
              container.innerHTML = planHtml;
            }
          } catch (err) {
            container.innerHTML = `<p>Error: ${err.message}</p>`;
          }
          btn.textContent = '🔼 Ocultar planificaciones';
        } else {
          container.style.display = 'none';
          btn.textContent = '📅 Planificaciones';
        }
      });
    });

  } catch (err) {
    console.error('Error cargando alumnos vinculados:', err);
    alumnosLista.innerHTML = `<p>Error al cargar la lista: ${err.message}</p>`;
  }
}

// Función auxiliar para calcular el promedio de una evaluación (útil en la vista)
function calcularPromedioEvaluacion(selecciones) {
  let total = 0;
  let count = 0;
  for (const par of Object.values(selecciones)) {
    for (const cat of Object.values(par)) {
      total += cat;
      count++;
    }
  }
  return count > 0 ? (total / count).toFixed(1) : 'N/A';
}
  // ========== SEGUIMIENTO ==========
  const alumnoSelectSeg = document.getElementById('alumnoSelectSeg');
  const categoriaObjetivoSeg = document.getElementById('categoriaObjetivoSeg');
  const cargarPlanSegBtn = document.getElementById('cargarPlanSeg');
  const guardarSesionBtn = document.getElementById('guardarSesionBtn');
  const sesionContent = document.getElementById('sesionContent');
  let planSesion = null;
  let ejerciciosCompletados = [];

  async function cargarAlumnosSeguimiento() {
    if (!window.currentUser) return;
    const historial = await cargarEvaluacionesDesdeFirestore();
    alumnoSelectSeg.innerHTML = '<option value="">-- Seleccionar --</option>';
    historial.forEach((eva, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${eva.jugador} – ${eva.golpe} (${eva.fecha})`;
      alumnoSelectSeg.appendChild(opt);
    });
  }

  cargarPlanSegBtn.addEventListener('click', () => {
    const idx = alumnoSelectSeg.value;
    if (idx === '') return alert('⚠️ Seleccioná un alumno.');
    const historial = window.evaluacionesCargadas || [];
    const evaluacion = historial[parseInt(idx)];
    if (!evaluacion) return alert('Error: evaluación no encontrada.');
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
                parKey, cuantId: cuant.id, nombreCuant: cuant.nombre,
                transicion, catInicio: cat, catFin: cat - 1, ejercicio,
                totalSeries: ejercicio.series, totalRepsPorSerie: parseInt(ejercicio.repeticiones),
                criterioExigido: ejercicio.criterioExito,
                minimoExitos: extraerMinimoCriterio(ejercicio.criterioExito, ejercicio.series * parseInt(ejercicio.repeticiones))
              });
            }
          }
        }
      }
    }
    if (ejercicios.length === 0) {
      sesionContent.innerHTML = '<p>✅ Ya alcanza la categoría objetivo.</p>';
      planSesion = null;
      guardarSesionBtn.style.display = 'none';
      return;
    }
    planSesion = { jugador: evaluacion.jugador, golpe: evaluacion.golpe, objetivo, ejercicios };
    ejerciciosCompletados = new Array(ejercicios.length).fill(false);
    let html = `<h3>Plan para ${evaluacion.jugador} (objetivo: ${objetivo}ª)</h3>`;
    ejercicios.forEach((ej, index) => {
      html += `<div class="sesion-ejercicio" id="ejercicio-${index}">
        <h4>${ej.nombreCuant} – ${ej.transicion.replace('_', 'ª → ')}ª</h4>
        <p><em>${ej.ejercicio.nombre}</em></p>
        <p>${ej.totalSeries} series x ${ej.totalRepsPorSerie} rep. | Criterio: ${ej.criterioExigido}</p>
        <div class="sesion-campos">
          <label>Series:</label>
          <input type="number" min="0" max="${ej.totalSeries}" value="0" data-index="${index}" data-campo="series">
          <label>Éxitos:</label>
          <input type="number" min="0" max="${ej.totalSeries * ej.totalRepsPorSerie}" value="0" data-index="${index}" data-campo="exitosas">
          <button class="btn-primary btn-chico finalizar-ejercicio" data-index="${index}">✔ Finalizar</button>
          <button class="btn-secondary btn-chico corregir-ejercicio" data-index="${index}" style="display:none;">✏️ Corregir</button>
          <span class="completado-msg" style="display:none;">✅ Completado</span>
        </div>
      </div>`;
    });
    sesionContent.innerHTML = html;
    guardarSesionBtn.style.display = 'inline-block';
    document.querySelectorAll('.finalizar-ejercicio').forEach(btn => {
      btn.addEventListener('click', (ev) => finalizarEjercicio(parseInt(ev.target.dataset.index)));
    });
    cargarHistorialSesiones().catch(console.error);
  });

  sesionContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('corregir-ejercicio')) {
      const idx = parseInt(e.target.dataset.index);
      corregirEjercicio(idx);
    }
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
    const btnFinalizar = ejercicioDiv.querySelector('.finalizar-ejercicio');
    const btnCorregir = ejercicioDiv.querySelector('.corregir-ejercicio');
    const msg = ejercicioDiv.querySelector('.completado-msg');
    if (btnFinalizar) btnFinalizar.style.display = 'none';
    if (btnCorregir) btnCorregir.style.display = 'inline-block';
    if (msg) msg.style.display = 'inline';
    ejerciciosCompletados[idx] = true;
    if (planSesion) {
      planSesion.ejercicios[idx].seriesRealizadas = parseInt(inputs[0].value) || 0;
      planSesion.ejercicios[idx].repeticionesExitosas = parseInt(inputs[1].value) || 0;
    }
  }

  function corregirEjercicio(idx) {
    const ejercicioDiv = document.getElementById(`ejercicio-${idx}`);
    if (!ejercicioDiv) return;
    const inputs = ejercicioDiv.querySelectorAll('input');
    inputs.forEach(input => input.disabled = false);
    const btnFinalizar = ejercicioDiv.querySelector('.finalizar-ejercicio');
    const btnCorregir = ejercicioDiv.querySelector('.corregir-ejercicio');
    const msg = ejercicioDiv.querySelector('.completado-msg');
    if (btnFinalizar) btnFinalizar.style.display = 'inline-block';
    if (btnCorregir) btnCorregir.style.display = 'none';
    if (msg) msg.style.display = 'none';
    ejerciciosCompletados[idx] = false;
  }

  guardarSesionBtn.addEventListener('click', async () => {
    if (!planSesion) return alert('No hay plan cargado.');
    if (!window.currentUser) return alert('Debés iniciar sesión.');
    sesionContent.querySelectorAll('input').forEach(input => {
      const idx = parseInt(input.dataset.index);
      const campo = input.dataset.campo;
      if (!isNaN(idx) && planSesion.ejercicios[idx]) {
        if (campo === 'series') planSesion.ejercicios[idx].seriesRealizadas = parseInt(input.value) || 0;
        if (campo === 'exitosas') planSesion.ejercicios[idx].repeticionesExitosas = parseInt(input.value) || 0;
      }
    });
    const sesionParaGuardar = {
      uid: window.currentUser.uid,
      fecha: window.firebase.firestore.FieldValue.serverTimestamp(),
      fechaLocal: new Date().toLocaleString(),
      jugador: planSesion.jugador, golpe: planSesion.golpe, objetivo: planSesion.objetivo,
      ejercicios: planSesion.ejercicios.map(ej => ({
        nombreCuant: ej.nombreCuant, transicion: ej.transicion,
        seriesRealizadas: ej.seriesRealizadas || 0,
        repeticionesExitosas: ej.repeticionesExitosas || 0,
        totalSeries: ej.totalSeries, totalRepsPorSerie: ej.totalRepsPorSerie,
        criterioExigido: ej.criterioExigido, minimoExitos: ej.minimoExitos
      }))
    };
    try {
      await db.collection('sesiones').add(sesionParaGuardar);
      mostrarResultadoSesion(planSesion);
      alert('✅ Sesión guardada correctamente.');
      cargarHistorialSesiones().catch(console.error);
    } catch (err) { alert('Error al guardar: ' + err.message); }
  });

  function mostrarResultadoSesion(plan) {
    const viejo = document.getElementById('resultadoSesion');
    if (viejo) viejo.remove();
    const div = document.createElement('div');
    div.id = 'resultadoSesion';
    div.className = 'resultado-sesion';
    div.innerHTML = '<h3>📊 Resultado</h3>';
    const historial = window.evaluacionesCargadas || [];
    const evaluacion = historial[parseInt(alumnoSelectSeg.value)];
    const cats = {};
    const nombres = {};
    if (evaluacion) {
      for (const [, sels] of Object.entries(evaluacion.selecciones))
        for (const [id, cat] of Object.entries(sels)) cats[id] = cat;
      const golpeData = DATA.golpes[evaluacion.golpe];
      if (golpeData) for (const parData of Object.values(golpeData.pares))
        for (const cuant of parData.cuantificadores) nombres[cuant.id] = cuant.nombre;
    }
    const obj = plan.objetivo;
    const res = {};
    for (const id of Object.keys(cats)) res[id] = { nombre: nombres[id]||id, catActual: cats[id]||7, catAlc: cats[id]||7, ejs:[] };
    plan.ejercicios.forEach(ej => {
      if (!res[ej.cuantId]) res[ej.cuantId] = { nombre: ej.nombreCuant, catActual: cats[ej.cuantId]||7, catAlc: cats[ej.cuantId]||7, ejs:[] };
      const ok = ej.repeticionesExitosas >= ej.minimoExitos;
      res[ej.cuantId].ejs.push({...ej, ok});
      if (ok && ej.catFin < res[ej.cuantId].catAlc) res[ej.cuantId].catAlc = ej.catFin;
    });
    let asc = 0, rep = 0, desc = 0;
    let tabla = '<table class="tabla-veredicto"><tr><th>Cuantificador</th><th>Actual</th><th>Obj</th><th>Alc</th><th>Veredicto</th></tr>';
    for (const [, d] of Object.entries(res)) {
      let v = '';
      if (d.catAlc <= obj)      { v = '⬆ Ascender';  asc++; }
      else if (d.catAlc > d.catActual) { v = '⬇ Descender'; desc++; }
      else                      { v = '↻ Repetir';   rep++; }
      tabla += `<tr><td>${d.nombre}</td>
 
.*${d.catActual}ª</td>
 
.*${obj}ª</td>
 
.*${d.catAlc}ª</td>
 
.*${v}</td></tr>`;
    }
    tabla += '</table>';
    let vg = '';
    if (desc > 0) vg = '<span class="veredicto descenso">⬇ DESCENDER</span>';
    else if (rep > 0) vg = '<span class="veredicto repetir">↻ REPETIR</span>';
    else vg = '<span class="veredicto ascenso">⬆ ASCENDER</span>';
    div.innerHTML += tabla + `<p class="veredicto-global">${vg}</p>`;
    sesionContent.appendChild(div);
  }

  async function cargarHistorialSesiones() {
    const idx = alumnoSelectSeg.value;
    if (idx === '') return;
    const historial = window.evaluacionesCargadas || [];
    const eva = historial[parseInt(idx)];
    if (!eva) return;
    let container = document.getElementById('historialSesiones');
    if (!container) {
      container = document.createElement('div');
      container.className = 'historial-sesiones';
      container.id = 'historialSesiones';
      sesionContent.appendChild(container);
    }
    container.innerHTML = '<p>Cargando sesiones...</p>';
    try {
      const snapshot = await db.collection('sesiones')
        .where('uid', '==', window.currentUser.uid)
        .orderBy('fecha', 'desc').limit(30).get();
      const sesiones = snapshot.docs
        .map(doc => ({...doc.data(), fecha: doc.data().fechaLocal || 'Sin fecha'}))
        .filter(s => s.jugador === eva.jugador && s.golpe === eva.golpe).slice(0,5);
      container.innerHTML = '';
      if (sesiones.length === 0) { container.innerHTML = '<p>No hay sesiones anteriores.</p>'; return; }
      container.innerHTML = '<h3>📅 Últimas sesiones</h3>';
      sesiones.forEach(ses => {
        const d = document.createElement('div');
        d.className = 'sesion-ejercicio';
        let inner = `<strong>${ses.fecha}</strong> – Objetivo: ${ses.objetivo}ª<br>`;
        ses.ejercicios.forEach(ej => inner += `${ej.nombreCuant}: ${ej.seriesRealizadas}/${ej.totalSeries} series, ${ej.repeticionesExitosas} éxitos<br>`);
        d.innerHTML = inner;
        container.appendChild(d);
      });
    } catch (err) {
      console.error('Error cargando sesiones:', err);
      container.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  }

  // ========== PLANIFICACIONES ALUMNO/PROFESOR ==========
  async function cargarPlanificacionesAlumno() {
    const container = document.getElementById('planificacionesAlumno');
    if (!container) return;
    if (!window.currentUser) { container.innerHTML = '<p>Debés iniciar sesión.</p>'; return; }
    container.innerHTML = '<p>Cargando planificaciones...</p>';
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const rol = userData.rol || 'alumno';
      let snapshot;
      if (rol === 'profesor' || rol === 'fiscal') {
        snapshot = await db.collection('planificaciones')
          .where('profesorUid', '==', window.currentUser.uid)
          .orderBy('fecha', 'desc').limit(50).get();
      } else {
        snapshot = await db.collection('planificaciones')
          .where('alumnoUid', '==', window.currentUser.uid)
          .orderBy('fecha', 'desc').limit(50).get();
      }
      if (snapshot.empty) {
        container.innerHTML = (rol === 'profesor' || rol === 'fiscal') ? '<p>No has creado ninguna planificación todavía.</p>' : '<p>No tenés planificaciones asignadas todavía.</p>';
        return;
      }
      let html = '';
      snapshot.docs.forEach(doc => {
        const plan = doc.data();
        const planId = doc.id;
        const estadoClase = plan.estado === 'completada' ? 'completada' : plan.estado === 'repetir' ? 'repetir' : 'pendiente';
        const estadoTexto = plan.estado === 'completada' ? '✅ Completada' : plan.estado === 'repetir' ? '🔄 Repetir' : '⏳ Pendiente';
        const anotaciones = plan.anotaciones || [];
        
        html += `<div class="planificacion-card" id="plan-card-${planId}">
          <h3>${obtenerNombreGolpe(plan.golpe)} - Objetivo: ${plan.objetivo}ª</h3>
          <p>Alumno: <strong>${plan.alumnoNombre || 'Sin nombre'}</strong></p>
          <p>Asignado: ${plan.fechaLocal || ''}</p>
          <span class="estado ${estadoClase}" id="estado-plan-${planId}">${estadoTexto}</span>
          <span id="progreso-plan-${planId}" style="margin-left:10px;font-weight:600;">${plan.progreso ? `(${plan.progreso}%)` : ''}</span>
          <div style="margin-top:12px;">
            <button class="btn-secondary btn-chico ver-plan-btn" data-planid="${planId}">📋 Ver ejercicios</button>
            ${(rol === 'profesor' || rol === 'fiscal') && plan.estado !== 'completada' ? `<button class="btn-primary btn-chico calificar-plan-btn" data-planid="${planId}">⭐ Calificar</button>` : ''}
            <button class="btn-secondary btn-chico anotacion-btn" data-planid="${planId}">💬 Anotaciones (${anotaciones.length})</button>
          </div>
          <div id="plan-content-${planId}" style="margin-top:12px; display:none;">${plan.contenidoHTML || '<p>Sin contenido.</p>'}</div>
          
          <div id="anotaciones-${planId}" style="display:none; margin-top:16px; padding:16px; background:#f9f9f9; border-radius:8px;">
            <h4>💬 Anotaciones</h4>
            <div id="anotaciones-lista-${planId}" style="margin-bottom:12px;">
              ${anotaciones.length === 0 ? '<p style="color:#888;">No hay anotaciones todavía.</p>' : 
                anotaciones.map((a, i) => `
                  <div style="background:white; padding:8px; border-radius:6px; margin-bottom:6px; border-left:3px solid var(--dorado, #ffd700);">
                    <strong>${a.autor || 'Alumno'}:</strong> ${a.texto}
                    <div style="font-size:0.75rem; color:#999;">${a.fecha || ''}</div>
                    ${(rol === 'profesor' || rol === 'fiscal') ? `<button class="btn-chico eliminar-anotacion-btn" data-planid="${planId}" data-index="${i}" style="margin-top:4px; background:#e74c3c; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer;">🗑️ Eliminar</button>` : ''}
                  </div>
                `).join('')
              }
            </div>
            <textarea id="nueva-anotacion-${planId}" class="auth-input" placeholder="Escribí tu consulta, sugerencia o dificultad..." style="width:100%; min-height:60px; margin-bottom:8px;"></textarea>
            <button class="btn-primary btn-chico guardar-anotacion-btn" data-planid="${planId}">💾 Guardar anotación</button>
          </div>
          
          ${(rol === 'profesor' || rol === 'fiscal') ? `<div id="calificacion-${planId}" style="display:none; margin-top:16px; padding:16px; background:#f9f9f9; border-radius:8px;"><h4>⭐ Calificar Ejercicios</h4><div id="ejercicios-calificar-${planId}"></div><button class="btn-primary guardar-calificacion-btn" data-planid="${planId}" style="margin-top:12px;">💾 Guardar Calificación</button></div>` : ''}
        </div>`;
      });
      container.innerHTML = html;
      
      document.querySelectorAll('.ver-plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const planId = btn.dataset.planid;
          const content = document.getElementById(`plan-content-${planId}`);
          if (content.style.display === 'none') { content.style.display = 'block'; btn.textContent = '🔼 Ocultar'; }
          else { content.style.display = 'none'; btn.textContent = '📋 Ver ejercicios'; }
        });
      });
      
      document.querySelectorAll('.anotacion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const planId = btn.dataset.planid;
          const div = document.getElementById(`anotaciones-${planId}`);
          if (div.style.display === 'none') { div.style.display = 'block'; btn.textContent = '🔼 Ocultar anotaciones'; }
          else { div.style.display = 'none'; btn.textContent = `💬 Anotaciones (${anotaciones.length})`; }
        });
      });
      
      document.querySelectorAll('.guardar-anotacion-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const planId = btn.dataset.planid;
          const textarea = document.getElementById(`nueva-anotacion-${planId}`);
          const texto = textarea.value.trim();
          if (!texto) return alert('Escribí una anotación.');
          
          const planRef = db.collection('planificaciones').doc(planId);
          const planDoc = await planRef.get();
          const planData = planDoc.data();
          const anotaciones = planData.anotaciones || [];
          
          anotaciones.push({
            texto: texto,
            autor: window.currentUserData?.nombre || 'Usuario',
            fecha: new Date().toLocaleString(),
            uid: window.currentUser.uid
          });
          
          try {
            await planRef.update({ anotaciones: anotaciones });
            alert('✅ Anotación guardada.');
            textarea.value = '';
            cargarPlanificacionesAlumno();
          } catch (err) { alert('❌ Error: ' + err.message); }
        });
      });
      
      document.querySelectorAll('.eliminar-anotacion-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const planId = btn.dataset.planid;
          const index = parseInt(btn.dataset.index);
          if (!confirm('¿Eliminar esta anotación?')) return;
          
          const planRef = db.collection('planificaciones').doc(planId);
          const planDoc = await planRef.get();
          const planData = planDoc.data();
          const anotaciones = planData.anotaciones || [];
          anotaciones.splice(index, 1);
          
          try {
            await planRef.update({ anotaciones: anotaciones });
            cargarPlanificacionesAlumno();
          } catch (err) { alert('❌ Error: ' + err.message); }
        });
      });
      
      document.querySelectorAll('.calificar-plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const planId = btn.dataset.planid;
          const calificacionDiv = document.getElementById(`calificacion-${planId}`);
          const ejerciciosDiv = document.getElementById(`ejercicios-calificar-${planId}`);
          if (calificacionDiv.style.display === 'none') {
            calificacionDiv.style.display = 'block';
            btn.textContent = '🔽 Ocultar calificación';
            const plan = snapshot.docs.find(d => d.id === planId);
            if (plan && plan.data().ejercicios) {
              let ejerciciosHTML = '';
              plan.data().ejercicios.forEach((ej, idx) => {
                ejerciciosHTML += `<div style="margin-bottom:12px; padding:8px; background:white; border-radius:6px; border:1px solid #ddd;"><strong>${ej.nombreCuant} - ${ej.transicion.replace('_', 'ª → ')}ª</strong><p style="margin:4px 0; font-size:0.85rem; color:#666;">${ej.ejercicio.nombre}</p><label>Porcentaje alcanzado:</label><input type="number" min="0" max="100" value="${ej.calificacion || 0}" class="calificacion-input" data-ejercicio="${idx}" data-planid="${planId}" style="width:80px; padding:4px; margin-left:8px;"> %</div>`;
              });
              ejerciciosDiv.innerHTML = ejerciciosHTML;
            }
          } else { calificacionDiv.style.display = 'none'; btn.textContent = '⭐ Calificar'; }
        });
      });
      
      document.querySelectorAll('.guardar-calificacion-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const planId = btn.dataset.planid;
          const inputs = document.querySelectorAll(`.calificacion-input[data-planid="${planId}"]`);
          let suma = 0, cantidad = 0;
          inputs.forEach(input => { suma += parseInt(input.value) || 0; cantidad++; });
          const promedio = cantidad > 0 ? Math.round(suma / cantidad) : 0;
          const nuevoEstado = promedio >= 80 ? 'completada' : 'repetir';
          try {
            await db.collection('planificaciones').doc(planId).update({ estado: nuevoEstado, progreso: promedio });
            const estadoSpan = document.getElementById(`estado-plan-${planId}`);
            const progresoSpan = document.getElementById(`progreso-plan-${planId}`);
            if (estadoSpan) { estadoSpan.textContent = nuevoEstado === 'completada' ? '✅ Completada' : '🔄 Repetir'; estadoSpan.className = `estado ${nuevoEstado}`; }
            if (progresoSpan) { progresoSpan.textContent = `(${promedio}%)`; }
            alert(`✅ Calificación guardada. Promedio: ${promedio}%. Estado: ${nuevoEstado}`);
          } catch (err) { alert('❌ Error al guardar: ' + err.message); }
        });
      });
      
    } catch (err) { container.innerHTML = `<p>Error al cargar: ${err.message}</p>`; }
  }

  function obtenerNombreGolpe(golpeId) {
    const nombres = { smash: '🏐 Sobre Cabeza', volea: '🏸 Volea', pegadaFondo: '🎯 Pegada de Fondo', salidaPared: '🧱 Salida de Pared' };
    return nombres[golpeId] || golpeId;
  }

  // ========== NUEVA PLANIFICACIÓN ==========
  const alumnoPlanSelect = document.getElementById('alumnoPlanSelect');
  const golpePlanSelect = document.getElementById('golpePlanSelect');
  const categoriaObjetivoPlan = document.getElementById('categoriaObjetivoPlan');
  const generarYGuardarPlanBtn = document.getElementById('generarYGuardarPlanBtn');
  const planGeneradoPreview = document.getElementById('planGeneradoPreview');
  const planMensaje = document.getElementById('planMensaje');
  let planificacionGenerada = null;

  async function cargarAlumnosParaPlanificacion() {
    if (!window.currentUser) return;
    alumnoPlanSelect.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    try {
      const snapshot = await db.collection('usuarios').get();
      const usuarios = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.rol === 'alumno' || !data.rol) {
          usuarios.push({ uid: doc.id, nombre: data.nombre || 'Sin nombre' });
        }
      });
      usuarios.sort((a, b) => a.nombre.localeCompare(b.nombre));
      usuarios.forEach(usuario => {
        const opt = document.createElement('option');
        opt.value = usuario.uid;
        opt.textContent = `👤 ${usuario.nombre}`;
        alumnoPlanSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  }

  generarYGuardarPlanBtn.addEventListener('click', async () => {
    const alumnoUid = alumnoPlanSelect.value;
    const alumnoNombre = alumnoPlanSelect.options[alumnoPlanSelect.selectedIndex]?.text.replace('👤 ', '') || '';
    const golpe = golpePlanSelect.value;
    const objetivo = parseInt(categoriaObjetivoPlan.value);
    if (!alumnoUid) return alert('⚠️ Seleccioná un alumno.');
    const historial = await cargarEvaluacionesDesdeFirestore(true);
    const evaluacionesAlumno = historial.filter(eva => eva.uid === alumnoUid && eva.golpe === golpe);
    if (evaluacionesAlumno.length === 0) {
      planMensaje.innerHTML = '<p style="color:var(--rojo, red);">⚠️ No hay evaluaciones de este alumno para este golpe.</p>';
      return;
    }
    const evaluacion = evaluacionesAlumno[0];
    planificacionGenerada = construirPlan(evaluacion, objetivo);
    planGeneradoPreview.innerHTML = `<h3>Vista previa</h3>${planificacionGenerada}<button id="confirmarGuardarPlanBtn" class="btn-primary" style="margin-top:16px;">💾 Confirmar y Asignar a ${alumnoNombre}</button>`;
    document.getElementById('confirmarGuardarPlanBtn').addEventListener('click', async () => {
      try {
        await db.collection('planificaciones').add({
          profesorUid: window.currentUser.uid,
          alumnoNombre: alumnoNombre,
          alumnoUid: alumnoUid,
          golpe: golpe,
          objetivo: objetivo,
          contenidoHTML: planificacionGenerada,
          ejercicios: extraerEjerciciosDePlan(evaluacion, objetivo),
          fecha: window.firebase.firestore.FieldValue.serverTimestamp(),
          fechaLocal: new Date().toLocaleString(),
          estado: 'pendiente',
          progreso: 0
        });
        alert('✅ Planificación asignada correctamente.');
        planGeneradoPreview.innerHTML = '';
        planMensaje.innerHTML = '<p style="color:green;">✅ Plan guardado.</p>';
        alumnoPlanSelect.value = '';
      } catch (err) { alert('❌ Error: ' + err.message); }
    });
  });

  function extraerEjerciciosDePlan(evaluacion, objetivo) {
    const ejercicios = [];
    const golpeData = DATA.golpes[evaluacion.golpe];
    if (!golpeData) return ejercicios;
    for (const [parKey, parData] of Object.entries(golpeData.pares)) {
      const seleccionesPar = evaluacion.selecciones[parKey] || {};
      for (const cuant of parData.cuantificadores) {
        const catActual = seleccionesPar[cuant.id];
        if (catActual && catActual > objetivo) {
          for (let cat = catActual; cat > objetivo; cat--) {
            const transicion = `${cat}_${cat-1}`;
            const ejercicio = window.EJERCICIOS?.[evaluacion.golpe]?.[parKey]?.[cuant.id]?.[transicion];
            if (ejercicio) ejercicios.push({ parKey, cuantId: cuant.id, nombreCuant: cuant.nombre, transicion, ejercicio: { nombre: ejercicio.nombre, series: ejercicio.series, repeticiones: ejercicio.repeticiones, descripcion: ejercicio.descripcion, criterioExito: ejercicio.criterioExito } });
          }
        }
      }
    }
    return ejercicios;
  }

  // ========== ADMINISTRACIÓN DE USUARIOS ==========
  async function cargarAdminUsuarios() {
    const container = document.getElementById('adminUsuariosLista');
    if (!container) return;
    if (!window.currentUser) { container.innerHTML = '<p>Debés iniciar sesión como profesor para administrar usuarios.</p>'; return; }
    container.innerHTML = '<p>Cargando usuarios...</p>';
    try {
      const snapshot = await db.collection('usuarios').get();
      if (snapshot.empty) { container.innerHTML = '<p>No hay usuarios registrados.</p>'; return; }
      const vinculadosSnapshot = await db.collection('vinculaciones')
        .where('profesorUid', '==', window.currentUser.uid).get();
      const vinculadosUids = new Set();
      vinculadosSnapshot.docs.forEach(doc => vinculadosUids.add(doc.data().alumnoUid));
      let html = '';
      snapshot.docs.forEach(doc => {
        const usuario = doc.data();
        const userId = doc.id;
        const esVinculado = vinculadosUids.has(userId);
        const rolActual = usuario.rol || 'alumno';
        html += `<div class="alumno-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>${usuario.nombre || 'Sin nombre'}</h3>
            <span class="user-rol-badge">${rolActual.toUpperCase()}</span>
          </div>
          <p>Email: ${usuario.email || 'No disponible'}</p>
          <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            ${!esVinculado ? `<button class="btn-primary btn-chico vincular-alumno-btn" data-uid="${userId}" data-nombre="${usuario.nombre}">➕ Agregar a mis alumnos</button>` : `<button class="btn-secondary btn-chico desvincular-alumno-btn" data-uid="${userId}">🔗 Quitar de mis alumnos</button>`}
            <select class="cambiar-rol-select" data-uid="${userId}" style="padding:4px 8px; border-radius:6px;">
              <option value="alumno" ${rolActual === 'alumno' ? 'selected' : ''}>👤 Alumno</option>
              <option value="profesor" ${rolActual === 'profesor' ? 'selected' : ''}>🔍 Profesor</option>
              <option value="fiscal" ${rolActual === 'fiscal' ? 'selected' : ''}>📋 Fiscal</option>
            </select>
          </div>
        </div>`;
      });
      container.innerHTML = html;
      document.querySelectorAll('.vincular-alumno-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await db.collection('vinculaciones').add({
              profesorUid: window.currentUser.uid, alumnoUid: btn.dataset.uid,
              alumnoNombre: btn.dataset.nombre,
              fecha: window.firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('✅ Alumno agregado a tu lista.');
            cargarAdminUsuarios();
          } catch (err) { alert('❌ Error: ' + err.message); }
        });
      });
      document.querySelectorAll('.desvincular-alumno-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const snap = await db.collection('vinculaciones')
              .where('profesorUid', '==', window.currentUser.uid)
              .where('alumnoUid', '==', btn.dataset.uid).get();
            snap.docs.forEach(async (doc) => { await db.collection('vinculaciones').doc(doc.id).delete(); });
            alert('✅ Alumno quitado de tu lista.');
            cargarAdminUsuarios();
          } catch (err) { alert('❌ Error: ' + err.message); }
        });
      });
      document.querySelectorAll('.cambiar-rol-select').forEach(select => {
        select.addEventListener('change', async () => {
          try {
            await db.collection('usuarios').doc(select.dataset.uid).update({ rol: select.value });
            alert(`✅ Rol cambiado a ${select.value}.`);
          } catch (err) { alert('❌ Error: ' + err.message); }
        });
      });
    } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
  }
  // ========== CREAR ALUMNO DESDE ADMIN ==========
const nuevoAlumnoNombre = document.getElementById('nuevoAlumnoNombre');
const nuevoAlumnoEmail = document.getElementById('nuevoAlumnoEmail');
const nuevoAlumnoPassword = document.getElementById('nuevoAlumnoPassword');
const crearAlumnoBtn = document.getElementById('crearAlumnoBtn');
const crearAlumnoMensaje = document.getElementById('crearAlumnoMensaje');

if (crearAlumnoBtn) {
    crearAlumnoBtn.addEventListener('click', async () => {
        const nombre = nuevoAlumnoNombre.value.trim();
        const email = nuevoAlumnoEmail.value.trim();
        const password = nuevoAlumnoPassword.value;

        if (!nombre || !email || !password) {
            crearAlumnoMensaje.innerHTML = '<p style="color:var(--rojo);">Completá todos los campos.</p>';
            return;
        }
        if (password.length < 6) {
            crearAlumnoMensaje.innerHTML = '<p style="color:var(--rojo);">La contraseña debe tener al menos 6 caracteres.</p>';
            return;
        }

        try {
            // 1. Crear usuario en Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. Guardar datos en Firestore
            await db.collection('usuarios').doc(user.uid).set({
                nombre: nombre,
                email: email,
                rol: 'alumno',
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 3. Crear vinculación automática con el profesor actual
            await db.collection('vinculaciones').add({
                profesorUid: window.currentUser.uid,
                alumnoUid: user.uid,
                alumnoNombre: nombre,
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 4. Limpiar formulario y mostrar éxito
            nuevoAlumnoNombre.value = '';
            nuevoAlumnoEmail.value = '';
            nuevoAlumnoPassword.value = '';
            crearAlumnoMensaje.innerHTML = '<p style="color:green;">✅ Alumno creado correctamente. Ya podés evaluarlo y planificar.</p>';

            // Recargar lista de usuarios
            cargarAdminUsuarios();

            // Cerrar sesión del alumno recién creado (porque createUserWithEmailAndPassword inicia sesión automáticamente)
            await firebase.auth().signOut();
            // Volver a iniciar sesión con el profesor (si hay sesión guardada)
            const profData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (profData.email) {
                await firebase.auth().signInWithEmailAndPassword(profData.email, prompt('Para continuar, ingresá tu contraseña de profesor:'));
            }
        } catch (error) {
            console.error('Error al crear alumno:', error);
            if (error.code === 'auth/email-already-in-use') {
                crearAlumnoMensaje.innerHTML = '<p style="color:var(--rojo);">Ya existe un usuario con ese email.</p>';
            } else {
                crearAlumnoMensaje.innerHTML = `<p style="color:var(--rojo);">Error: ${error.message}</p>`;
            }
        }
    });
}

  // ========== PROGRESO VISUAL (GRÁFICOS) ==========
  let chartInstance = null;

  async function cargarProgreso() {
    if (!window.currentUser) return;
    const golpe = document.getElementById('progresoGolpeSelect').value;
    const metrica = document.getElementById('progresoMetricaSelect').value;
    
    const snapshot = await db.collection('evaluaciones')
      .where('uid', '==', window.currentUser.uid)
      .where('golpe', '==', golpe)
      .orderBy('fecha', 'asc')
      .get();
    
    if (snapshot.empty) {
      document.getElementById('graficoEvolucion').style.display = 'none';
      document.getElementById('noDatosProgreso').style.display = 'block';
      return;
    }
    
    document.getElementById('graficoEvolucion').style.display = 'block';
    document.getElementById('noDatosProgreso').style.display = 'none';
    
    const evaluaciones = snapshot.docs.map(doc => ({
      fecha: doc.data().fechaLocal || new Date(doc.data().fecha?.toDate()).toLocaleDateString(),
      selecciones: doc.data().selecciones,
      timestamp: doc.data().fecha?.toDate() || new Date()
    }));
    
    const labels = evaluaciones.map(e => e.fecha);
    
    if (metrica === 'promedio') {
      const promedios = evaluaciones.map(eva => {
        let total = 0;
        let count = 0;
        for (const par of Object.values(eva.selecciones)) {
          for (const cat of Object.values(par)) {
            total += cat;
            count++;
          }
        }
        return count > 0 ? total / count : 0;
      });
      
      if (chartInstance) chartInstance.destroy();
      const ctx = document.getElementById('graficoEvolucion').getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `Categoría promedio - ${obtenerNombreGolpe(golpe)}`,
            data: promedios,
            borderColor: '#f1c40f',
            backgroundColor: 'rgba(241, 196, 15, 0.1)',
            tension: 0.2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: { y: { min: 2, max: 7, title: { display: true, text: 'Categoría' } } },
          plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(1)}ª categoría` } } }
        }
      });
    } 
    else if (metrica === 'cuantificadores') {
      const golpeData = DATA.golpes[golpe];
      if (!golpeData) return;
      const cuantificadoresMap = new Map();
      for (const par of Object.values(golpeData.pares)) {
        for (const cuant of par.cuantificadores) {
          cuantificadoresMap.set(cuant.id, cuant.nombre);
        }
      }
      
      const datasets = [];
      for (let [cuantId, cuantNombre] of cuantificadoresMap.entries()) {
        const datos = evaluaciones.map(eva => {
          for (const par of Object.values(eva.selecciones)) {
            if (par[cuantId] !== undefined) return par[cuantId];
          }
          return null;
        }).filter(v => v !== null);
        
        if (datos.length >= 2) {
          datasets.push({
            label: cuantNombre,
            data: datos,
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            tension: 0.2,
            fill: false
          });
        }
      }
      
      if (chartInstance) chartInstance.destroy();
      const ctx = document.getElementById('graficoEvolucion').getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
          responsive: true,
          scales: { y: { min: 2, max: 7, title: { display: true, text: 'Categoría' } } }
        }
      });
    }
  }

  // ========== FORTALEZAS Y DEBILIDADES ==========
  async function analizarFortalezasDebilidades() {
    const resultadoDiv = document.getElementById('fortalezasResultado');
    if (!resultadoDiv) return;
    
    if (!window.currentUser) {
      resultadoDiv.innerHTML = '<p style="color:red;">⚠️ Debés iniciar sesión para ver tu análisis.</p>';
      return;
    }
    
    resultadoDiv.innerHTML = '<p>Cargando tus evaluaciones...</p>';
    
    try {
      const snapshot = await db.collection('evaluaciones')
        .where('uid', '==', window.currentUser.uid)
        .get();
      
      if (snapshot.empty) {
        resultadoDiv.innerHTML = '<p>📭 No tenés evaluaciones guardadas. Completá algunas evaluaciones para obtener un análisis.</p>';
        return;
      }
      
      const evaluaciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fechaLocal || new Date(doc.data().fecha?.toDate()).toLocaleDateString()
      }));
      
      const golpesData = {};
      for (const eva of evaluaciones) {
        const golpe = eva.golpe;
        if (!golpesData[golpe]) {
          golpesData[golpe] = {
            nombre: obtenerNombreGolpe(golpe),
            evaluaciones: [],
            sumaCategorias: 0,
            cantidad: 0
          };
        }
        
        let sumaEva = 0;
        let countEva = 0;
        for (const par of Object.values(eva.selecciones)) {
          for (const cat of Object.values(par)) {
            sumaEva += cat;
            countEva++;
          }
        }
        const promedioEva = countEva > 0 ? sumaEva / countEva : 0;
        
        golpesData[golpe].evaluaciones.push({
          fecha: eva.fecha,
          promedio: promedioEva,
          selecciones: eva.selecciones
        });
        golpesData[golpe].sumaCategorias += promedioEva;
        golpesData[golpe].cantidad++;
      }
      
      for (const golpe of Object.keys(golpesData)) {
        golpesData[golpe].promedioGeneral = golpesData[golpe].sumaCategorias / golpesData[golpe].cantidad;
      }
      
      const golpesOrdenados = Object.entries(golpesData).sort((a, b) => b[1].promedioGeneral - a[1].promedioGeneral);
      
      let html = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:20px; border-radius:16px; margin-bottom:20px;">
          <h3 style="margin:0 0 10px 0;">📊 Resumen General</h3>
          <p>Tenés <strong>${evaluaciones.length}</strong> evaluaciones registradas en <strong>${Object.keys(golpesData).length}</strong> golpes diferentes.</p>
          <p>Tu promedio general ponderado es: <strong>${(golpesOrdenados.reduce((acc, [_, g]) => acc + g.promedioGeneral, 0) / golpesOrdenados.length).toFixed(1)}ª categoría</strong></p>
        </div>
      `;
      
      html += `<div style="background:#e8f5e9; padding:16px; border-radius:12px; margin-bottom:20px; border-left:5px solid #4caf50;">`;
      html += `<h3 style="color:#2e7d32; margin-top:0;">✅ FORTALEZAS</h3>`;
      const fortalezas = golpesOrdenados.slice(0, 2);
      for (const [golpeId, data] of fortalezas) {
        html += `<div style="margin-bottom:12px;">
          <strong>🏆 ${data.nombre}</strong> - Promedio: <strong>${data.promedioGeneral.toFixed(1)}ª</strong>
          <div style="background:#ddd; border-radius:10px; height:10px; margin-top:5px;">
            <div style="background:#4caf50; width:${(data.promedioGeneral / 7) * 100}%; height:10px; border-radius:10px;"></div>
          </div>
          <p style="font-size:0.85rem; margin:5px 0 0 0;">${data.evaluaciones.length} evaluación(es) - Última: ${data.evaluaciones[data.evaluaciones.length-1]?.fecha || 'N/A'}</p>
        </div>`;
      }
      html += `</div>`;
      
      html += `<div style="background:#ffebee; padding:16px; border-radius:12px; margin-bottom:20px; border-left:5px solid #f44336;">`;
      html += `<h3 style="color:#c62828; margin-top:0;">⚠️ ÁREAS A MEJORAR</h3>`;
      const debilidades = golpesOrdenados.slice(-2).reverse();
      for (const [golpeId, data] of debilidades) {
        html += `<div style="margin-bottom:12px;">
          <strong>🎯 ${data.nombre}</strong> - Promedio: <strong>${data.promedioGeneral.toFixed(1)}ª</strong>
          <div style="background:#ddd; border-radius:10px; height:10px; margin-top:5px;">
            <div style="background:#f44336; width:${(data.promedioGeneral / 7) * 100}%; height:10px; border-radius:10px;"></div>
          </div>
          <p style="font-size:0.85rem; margin:5px 0 0 0;">${data.evaluaciones.length} evaluación(es) - Última: ${data.evaluaciones[data.evaluaciones.length-1]?.fecha || 'N/A'}</p>
        </div>`;
      }
      html += `</div>`;
      
      html += `<details style="margin-top:20px;">
        <summary style="cursor:pointer; font-weight:bold; padding:10px; background:#f5f5f5; border-radius:8px;">📋 Ver detalle completo por golpe</summary>
        <div style="margin-top:16px;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#333; color:white;">
                <th style="padding:8px; text-align:left;">Golpe</th>
                <th style="padding:8px; text-align:center;">Evaluaciones</th>
                <th style="padding:8px; text-align:center;">Promedio</th>
                <th style="padding:8px; text-align:center;">Tendencia</th>
               </tr>
            </thead>
            <tbody>`;
      
      for (const [golpeId, data] of golpesOrdenados) {
        let tendencia = '⚪ Sin datos';
        if (data.evaluaciones.length >= 2) {
          const primera = data.evaluaciones[0].promedio;
          const ultima = data.evaluaciones[data.evaluaciones.length-1].promedio;
          if (ultima > primera) tendencia = '🟢 Mejorando';
          else if (ultima < primera) tendencia = '🔴 Bajando';
          else tendencia = '🟡 Estable';
        } else if (data.evaluaciones.length === 1) {
          tendencia = '🟡 Primera evaluación';
        }
        
        html += `<tr style="border-bottom:1px solid #ddd;">
          <td style="padding:8px;"><strong>${data.nombre}</strong></td>
          <td style="padding:8px; text-align:center;">${data.evaluaciones.length}</td>
          <td style="padding:8px; text-align:center;"><strong>${data.promedioGeneral.toFixed(1)}ª</strong></td>
          <td style="padding:8px; text-align:center;">${tendencia}</td>
         </tr>`;
      }
      
      html += `</tbody>
           </table>
        </div>
      </details>`;
      
      resultadoDiv.innerHTML = html;
      
    } catch (err) {
      console.error('Error al analizar:', err);
      resultadoDiv.innerHTML = `<p style="color:red;">❌ Error al analizar: ${err.message}</p>`;
    }
  }

  // ========== EVENTOS DE BOTONES ADICIONALES ==========
  const actualizarGraficoBtn = document.getElementById('actualizarGraficoBtn');
  if (actualizarGraficoBtn) {
    actualizarGraficoBtn.addEventListener('click', cargarProgreso);
  }

  const analizarFortalezasBtn = document.getElementById('analizarFortalezasBtn');
  if (analizarFortalezasBtn) {
    analizarFortalezasBtn.addEventListener('click', analizarFortalezasDebilidades);
  }

  // ========== INICIALIZAR APLICACIÓN ==========
  window.renderizarGolpe = renderizarGolpe;
  
  window.initApp = function() {
    if (window.currentUser) {
      renderizarGolpe('smash');
      const activeTab = document.querySelector('#mainNav .tab.active');
      if (activeTab && activeTab.dataset.view) {
        const view = activeTab.dataset.view;
        if (view === 'historial') cargarHistorial().catch(console.error);
        if (view === 'alumnos') cargarAlumnos().catch(console.error);
        if (view === 'seguimiento') cargarAlumnosSeguimiento().catch(console.error);
        if (view === 'planificaciones') cargarPlanificacionesAlumno().catch(console.error);
        if (view === 'nuevaPlanificacion') cargarAlumnosParaPlanificacion().catch(console.error);
        if (view === 'admin') cargarAdminUsuarios().catch(console.error);
        if (view === 'progreso') cargarProgreso().catch(console.error);
        if (view === 'fortalezas') analizarFortalezasDebilidades().catch(console.error);
      }
    } else {
      if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
    }
  };

  if (window.currentUser) {
    window.initApp();
  } else {
    if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
  }
});
