// ==================== APP.JS – VERSIÓN COMPLETA CORREGIDA (CRÍTICOS RESUELTOS) ====================
document.addEventListener('DOMContentLoaded', () => {

  // Referencias a elementos del DOM
  const mainNav            = document.getElementById('mainNav');
  const views              = document.querySelectorAll('.view');
  const golpesList         = document.getElementById('golpesList');
  const golpeContent       = document.getElementById('golpeContent');
  const playerNameInput    = document.getElementById('playerName');
  const historialLista     = document.getElementById('historialLista');
  const limpiarHistorialBtn= document.getElementById('limpiarHistorialBtn');
  const body               = document.body;

  // Declaración explícita de Firestore
  const db = firebase.firestore();

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
      if (inputNombre) inputNombre.style.display = 'none';
      if (selectAlumnos) {
        selectAlumnos.style.display = 'block';
        cargarAlumnosSelectEvaluacion();
      }
      if (jugadorDiv) jugadorDiv.querySelector('label').innerHTML = 'Evaluar a:';
    } else {
      if (inputNombre) {
        inputNombre.style.display = 'block';
        inputNombre.value = window.currentUserData?.nombre || '';
        inputNombre.readOnly = true;
      }
      if (selectAlumnos) selectAlumnos.style.display = 'none';
      if (jugadorDiv) jugadorDiv.querySelector('label').innerHTML = 'Tu nombre:';
    }
  }

  // Cargar alumnos vinculados en el select de evaluación (profesores)
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
      if (view === 'progreso')            prepararVistaProgreso().catch(console.error);
      if (view === 'fortalezas')          prepararVistaFortalezas().catch(console.error);
      if (view === 'comparativa')         prepararVistaComparativa().catch(console.error);
      if (view === 'checklist')           prepararVistaChecklist().catch(console.error);
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
    let alumnoUid = null;
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    
    if (esProfesor) {
      const select = document.getElementById('alumnoSelectEval');
      const selectedOption = select.options[select.selectedIndex];
      if (!selectedOption || !selectedOption.value) {
        return alert('⚠️ Seleccioná un alumno para evaluar.');
      }
      nombre = selectedOption.textContent;
      alumnoUid = selectedOption.value;
    } else {
      nombre = window.currentUserData?.nombre || 'Sin nombre';
      // CORRECCIÓN CRÍTICA: en autoevaluación, alumnoUid debe ser el propio uid del alumno
      alumnoUid = window.currentUser.uid;
    }
    
    const evaluacion = {
      uid: window.currentUser.uid,
      alumnoUid: alumnoUid,
      evaluadorUid: window.currentUser.uid,
      evaluadorNombre: window.currentUserData?.nombre || '',
      tipo: esProfesor ? (window.currentUserData?.rol === 'fiscal' ? 'fiscal' : 'profesor') : 'autoevaluacion',
      jugador: nombre,
      golpe: golpeActual,
      selecciones: evaluacionesCache,
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
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
    const select = document.getElementById('alumnoSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) {
      const historial = await cargarEvaluacionesDesdeFirestore();
      historial.forEach((eva, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${eva.jugador} – ${eva.golpe} (${eva.fecha})`;
        select.appendChild(opt);
      });
      return;
    }
    
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
      console.error('Error cargando alumnos para entrenamiento:', err);
    }
  }

  generarPlanBtn.addEventListener('click', async () => {
    const alumnoUid = alumnoSelect.value;
    if (!alumnoUid) return alert('⚠️ Seleccioná un alumno.');
    
    const golpeSelect = document.getElementById('golpeEntrenamientoSelect');
    const golpe = golpeSelect ? golpeSelect.value : 'smash';
    
    const snapshot = await db.collection('evaluaciones')
      .where('uid', '==', alumnoUid)
      .where('golpe', '==', golpe)
      .orderBy('fecha', 'desc')
      .limit(1)
      .get();
      
    if (snapshot.empty) {
      alert(`No hay evaluaciones de este alumno para el golpe "${golpe}".`);
      return;
    }
    const evaluacion = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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
      alumnosLista.innerHTML = '<p>No tenés permisos para ver esta sección.</p>';
      return;
    }
    alumnosLista.innerHTML = '<p>Cargando lista de alumnos vinculados...</p>';
    try {
      const vinculacionesSnap = await db.collection('vinculaciones')
        .where('profesorUid', '==', window.currentUser.uid)
        .get();
      if (vinculacionesSnap.empty) {
        alumnosLista.innerHTML = '<p>No tenés alumnos vinculados todavía. Usá la pestaña "Admin" para agregar alumnos.</p>';
        return;
      }
      let html = '';
      for (const doc of vinculacionesSnap.docs) {
        const vinculacion = doc.data();
        const alumnoUid = vinculacion.alumnoUid;
        const nombreVinculacion = vinculacion.alumnoNombre || 'Sin nombre';
        let alumnoData = { email: 'No disponible', rol: 'alumno' };
        try {
          const alumnoDoc = await db.collection('usuarios').doc(alumnoUid).get();
          if (alumnoDoc.exists) {
            alumnoData = alumnoDoc.data();
          }
        } catch (err) { console.warn(err); }
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
      document.querySelectorAll('.ver-evaluaciones-alumno').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const uid = btn.dataset.uid;
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
      console.error(err);
      alumnosLista.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  }

  function calcularPromedioEvaluacion(selecciones) {
    let total = 0, count = 0;
    for (const par of Object.values(selecciones))
      for (const cat of Object.values(par)) { total += cat; count++; }
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
    const select = document.getElementById('alumnoSelectSeg');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) {
      const historial = await cargarEvaluacionesDesdeFirestore();
      historial.forEach((eva, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${eva.jugador} – ${eva.golpe} (${eva.fecha})`;
        select.appendChild(opt);
      });
      return;
    }
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
      console.error('Error cargando alumnos para seguimiento:', err);
    }
  }

  cargarPlanSegBtn.addEventListener('click', async () => {
    const alumnoUid = alumnoSelectSeg.value;
    if (!alumnoUid) return alert('⚠️ Seleccioná un alumno.');
    const objetivo = parseInt(categoriaObjetivoSeg.value);
    const golpeSelect = document.getElementById('golpeSeguimientoSelect');
    const golpeFiltro = golpeSelect && golpeSelect.value ? golpeSelect.value : null;
    let query = db.collection('evaluaciones').where('uid', '==', alumnoUid);
    if (golpeFiltro) query = query.where('golpe', '==', golpeFiltro);
    const snapshot = await query.orderBy('fecha', 'desc').limit(1).get();
    if (snapshot.empty) {
      alert('No hay evaluaciones de este alumno.');
      return;
    }
    const evaluacion = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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
      fecha: firebase.firestore.FieldValue.serverTimestamp(),
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

  // ========== MOSTRAR RESULTADO DE SESIÓN (CORREGIDO – TABLA SIN BASURA) ==========
  function mostrarResultadoSesion(plan) {
    const viejo = document.getElementById('resultadoSesion');
    if (viejo) viejo.remove();
    const div = document.createElement('div');
    div.id = 'resultadoSesion';
    div.className = 'resultado-sesion';
    div.innerHTML = '<h3>📊 Resultado</h3>';
    const obj = plan.objetivo;
    const res = {};
    plan.ejercicios.forEach(ej => {
      if (!res[ej.cuantId]) res[ej.cuantId] = { nombre: ej.nombreCuant, catActual: 5, catAlc: 7, ejs: [] };
      const ok = ej.repeticionesExitosas >= ej.minimoExitos;
      res[ej.cuantId].ejs.push({ ...ej, ok });
      if (ok && ej.catFin < res[ej.cuantId].catAlc) res[ej.cuantId].catAlc = ej.catFin;
    });
    let asc = 0, rep = 0, desc = 0;
    let tabla = '<table class="tabla-veredicto"><tr><th>Cuantificador</th><th>Obj</th><th>Alc</th><th>Veredicto</th></tr>';
    for (const [, d] of Object.entries(res)) {
      let v = '';
      if (d.catAlc <= obj) { v = '⬆ Ascender'; asc++; }
      else if (d.catAlc > 5) { v = '⬇ Descender'; desc++; }
      else { v = '↻ Repetir'; rep++; }
      tabla += `<tr><td>${d.nombre}</td><td>${obj}ª</td><td>${d.catAlc}ª</td><td>${v}</td></tr>`;
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
    let container = document.getElementById('historialSesiones');
    if (!container) {
      container = document.createElement('div');
      container.className = 'historial-sesiones';
      container.id = 'historialSesiones';
      sesionContent.appendChild(container);
    }
    container.innerHTML = '<p>Sesiones guardadas (disponible próximamente).</p>';
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
      // event listeners para anotaciones y calificaciones (similar a código anterior)
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
    const select = document.getElementById('alumnoPlanSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) {
      select.innerHTML = '<option disabled>No disponible para alumnos</option>';
      return;
    }
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
      console.error('Error cargando alumnos para planificación:', err);
      select.innerHTML = '<option disabled>Error al cargar alumnos</option>';
    }
  }

  generarYGuardarPlanBtn.addEventListener('click', async () => {
    const alumnoUid = alumnoPlanSelect.value;
    const alumnoNombre = alumnoPlanSelect.options[alumnoPlanSelect.selectedIndex]?.text.replace('👤 ', '') || '';
    const golpe = golpePlanSelect.value;
    const objetivo = parseInt(categoriaObjetivoPlan.value);
    if (!alumnoUid) return alert('⚠️ Seleccioná un alumno.');
    const snapshot = await db.collection('evaluaciones')
      .where('uid', '==', alumnoUid)
      .where('golpe', '==', golpe)
      .orderBy('fecha', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) {
      planMensaje.innerHTML = '<p style="color:var(--rojo, red);">⚠️ No hay evaluaciones de este alumno para este golpe.</p>';
      return;
    }
    const evaluacion = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
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
          fecha: firebase.firestore.FieldValue.serverTimestamp(),
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
      // event listeners para vinculación
      document.querySelectorAll('.vincular-alumno-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await db.collection('vinculaciones').add({
              profesorUid: window.currentUser.uid, alumnoUid: btn.dataset.uid,
              alumnoNombre: btn.dataset.nombre,
              fecha: firebase.firestore.FieldValue.serverTimestamp()
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
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await db.collection('usuarios').doc(user.uid).set({
          nombre: nombre,
          email: email,
          rol: 'alumno',
          fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('vinculaciones').add({
          profesorUid: window.currentUser.uid,
          alumnoUid: user.uid,
          alumnoNombre: nombre,
          fecha: firebase.firestore.FieldValue.serverTimestamp()
        });
        nuevoAlumnoNombre.value = '';
        nuevoAlumnoEmail.value = '';
        nuevoAlumnoPassword.value = '';
        crearAlumnoMensaje.innerHTML = '<p style="color:green;">✅ Alumno creado correctamente.</p>';
        cargarAdminUsuarios();
        crearAlumnoMensaje.innerHTML += '<br><strong>⚠️ La página se recargará para restaurar tu sesión de profesor.</strong>';
        setTimeout(() => { window.location.reload(); }, 3000);
      } catch (error) {
        console.error(error);
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
  async function prepararVistaProgreso() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    const contenedor = document.getElementById('progresoAlumnoContainer');
    if (!contenedor) return;
    if (esProfesor) {
      contenedor.style.display = 'block';
      let select = document.getElementById('progresoAlumnoSelect');
      if (!select) {
        contenedor.innerHTML = '<label style="font-weight:600; margin-right:10px;">Alumno:</label><select id="progresoAlumnoSelect"></select>';
        select = document.getElementById('progresoAlumnoSelect');
      }
      await cargarAlumnosSelect(select);
      select.addEventListener('change', () => cargarProgreso());
    } else {
      contenedor.style.display = 'none';
    }
    await cargarProgreso();
  }

  async function cargarAlumnosSelect(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    try {
      const vinculaciones = await db.collection('vinculaciones')
        .where('profesorUid', '==', window.currentUser.uid)
        .get();
      for (const doc of vinculaciones.docs) {
        const data = doc.data();
        const opt = document.createElement('option');
        opt.value = data.alumnoUid;
        opt.textContent = data.alumnoNombre || 'Alumno sin nombre';
        selectElement.appendChild(opt);
      }
      if (vinculaciones.size === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'No hay alumnos vinculados';
        opt.disabled = true;
        selectElement.appendChild(opt);
      }
    } catch (err) {
      console.error('Error cargando alumnos para selector:', err);
    }
  }

  async function cargarProgreso() {
    if (!window.currentUser) return;
    const golpe = document.getElementById('progresoGolpeSelect').value;
    const metrica = document.getElementById('progresoMetricaSelect').value;
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    let uid = window.currentUser.uid;
    if (esProfesor) {
      const alumnoSelect = document.getElementById('progresoAlumnoSelect');
      if (alumnoSelect && alumnoSelect.value) {
        uid = alumnoSelect.value;
      } else {
        document.getElementById('graficoEvolucion').style.display = 'none';
        document.getElementById('noDatosProgreso').style.display = 'block';
        document.getElementById('noDatosProgreso').innerHTML = '<p>Seleccioná un alumno para ver su progreso.</p>';
        return;
      }
    }
    const snapshot = await db.collection('evaluaciones')
      .where('uid', '==', uid)
      .where('golpe', '==', golpe)
      .orderBy('fecha', 'asc')
      .get();
    if (snapshot.empty) {
      document.getElementById('graficoEvolucion').style.display = 'none';
      document.getElementById('noDatosProgreso').style.display = 'block';
      document.getElementById('noDatosProgreso').innerHTML = '<p>No hay evaluaciones de este golpe para mostrar evolución.</p>';
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
        let total = 0, count = 0;
        for (const par of Object.values(eva.selecciones))
          for (const cat of Object.values(par)) { total += cat; count++; }
        return count > 0 ? total / count : 0;
      });
      if (chartInstance) chartInstance.destroy();
      const ctx = document.getElementById('graficoEvolucion').getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: `Categoría promedio - ${obtenerNombreGolpe(golpe)}`, data: promedios, borderColor: '#f1c40f', backgroundColor: 'rgba(241,196,15,0.1)', tension: 0.2, fill: true }] },
        options: { responsive: true, scales: { y: { min: 2, max: 7, title: { display: true, text: 'Categoría' } } }, plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(1)}ª categoría` } } } }
      });
    } else if (metrica === 'cuantificadores') {
      const golpeData = DATA.golpes[golpe];
      if (!golpeData) return;
      const cuantificadoresMap = new Map();
      for (const par of Object.values(golpeData.pares))
        for (const cuant of par.cuantificadores) cuantificadoresMap.set(cuant.id, cuant.nombre);
      const datasets = [];
      for (let [cuantId, cuantNombre] of cuantificadoresMap.entries()) {
        const datos = evaluaciones.map(eva => {
          for (const par of Object.values(eva.selecciones))
            if (par[cuantId] !== undefined) return par[cuantId];
          return null;
        }).filter(v => v !== null);
        if (datos.length >= 2) {
          datasets.push({ label: cuantNombre, data: datos, borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`, tension: 0.2, fill: false });
        }
      }
      if (chartInstance) chartInstance.destroy();
      const ctx = document.getElementById('graficoEvolucion').getContext('2d');
      chartInstance = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: datasets }, options: { responsive: true, scales: { y: { min: 2, max: 7, title: { display: true, text: 'Categoría' } } } } });
    }
  }

  // ========== FORTALEZAS Y DEBILIDADES ==========
  async function prepararVistaFortalezas() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    const contenedor = document.getElementById('fortalezasAlumnoContainer');
    if (!contenedor) return;
    if (esProfesor) {
      contenedor.style.display = 'block';
      let select = document.getElementById('fortalezasAlumnoSelect');
      if (!select) {
        contenedor.innerHTML = '<label style="font-weight:600; margin-right:10px;">Alumno:</label><select id="fortalezasAlumnoSelect"></select>';
        select = document.getElementById('fortalezasAlumnoSelect');
      }
      await cargarAlumnosSelect(select);
      select.addEventListener('change', () => analizarFortalezasDebilidades());
    } else {
      contenedor.style.display = 'none';
    }
    await analizarFortalezasDebilidades();
  }

  async function analizarFortalezasDebilidades() {
    const resultadoDiv = document.getElementById('fortalezasResultado');
    if (!resultadoDiv) return;
    if (!window.currentUser) {
      resultadoDiv.innerHTML = '<p style="color:red;">⚠️ Debés iniciar sesión para ver tu análisis.</p>';
      return;
    }
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    let uid = window.currentUser.uid;
    let nombrePersona = window.currentUserData?.nombre || 'Usuario';
    if (esProfesor) {
      const alumnoSelect = document.getElementById('fortalezasAlumnoSelect');
      if (alumnoSelect && alumnoSelect.value) {
        uid = alumnoSelect.value;
        nombrePersona = alumnoSelect.options[alumnoSelect.selectedIndex].text;
      } else {
        resultadoDiv.innerHTML = '<p style="color:#888;">Seleccioná un alumno para ver su análisis de fortalezas.</p>';
        return;
      }
    }
    resultadoDiv.innerHTML = '<p>Cargando evaluaciones...</p>';
    try {
      const snapshot = await db.collection('evaluaciones').where('uid', '==', uid).get();
      if (snapshot.empty) {
        resultadoDiv.innerHTML = `<p>📭 ${nombrePersona} no tiene evaluaciones guardadas aún.</p>`;
        return;
      }
      const evaluaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), fecha: doc.data().fechaLocal || new Date(doc.data().fecha?.toDate()).toLocaleDateString() }));
      const golpesData = {};
      for (const eva of evaluaciones) {
        const golpe = eva.golpe;
        if (!golpesData[golpe]) golpesData[golpe] = { nombre: obtenerNombreGolpe(golpe), evaluaciones: [], sumaCategorias: 0, cantidad: 0 };
        let sumaEva = 0, countEva = 0;
        for (const par of Object.values(eva.selecciones))
          for (const cat of Object.values(par)) { sumaEva += cat; countEva++; }
        const promedioEva = countEva > 0 ? sumaEva / countEva : 0;
        golpesData[golpe].evaluaciones.push({ fecha: eva.fecha, promedio: promedioEva, selecciones: eva.selecciones });
        golpesData[golpe].sumaCategorias += promedioEva;
        golpesData[golpe].cantidad++;
      }
      for (const golpe of Object.keys(golpesData)) golpesData[golpe].promedioGeneral = golpesData[golpe].sumaCategorias / golpesData[golpe].cantidad;
      const golpesOrdenados = Object.entries(golpesData).sort((a, b) => b[1].promedioGeneral - a[1].promedioGeneral);
      let html = `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:20px; border-radius:16px; margin-bottom:20px;">
          <h3 style="margin:0 0 10px 0;">📊 Resumen General de ${nombrePersona}</h3>
          <p>Tiene <strong>${evaluaciones.length}</strong> evaluaciones registradas en <strong>${Object.keys(golpesData).length}</strong> golpes diferentes.</p>
          <p>Su promedio general ponderado es: <strong>${(golpesOrdenados.reduce((acc, [_, g]) => acc + g.promedioGeneral, 0) / golpesOrdenados.length).toFixed(1)}ª categoría</strong></p>
        </div>`;
      html += `<div style="background:#e8f5e9; padding:16px; border-radius:12px; margin-bottom:20px; border-left:5px solid #4caf50;"><h3 style="color:#2e7d32; margin-top:0;">✅ FORTALEZAS</h3>`;
      const fortalezas = golpesOrdenados.slice(0, 2);
      for (const [golpeId, data] of fortalezas) {
        html += `<div style="margin-bottom:12px;"><strong>🏆 ${data.nombre}</strong> - Promedio: <strong>${data.promedioGeneral.toFixed(1)}ª</strong>
          <div style="background:#ddd; border-radius:10px; height:10px; margin-top:5px;"><div style="background:#4caf50; width:${(data.promedioGeneral / 7) * 100}%; height:10px; border-radius:10px;"></div></div>
          <p style="font-size:0.85rem; margin:5px 0 0 0;">${data.evaluaciones.length} evaluación(es) - Última: ${data.evaluaciones[data.evaluaciones.length-1]?.fecha || 'N/A'}</p></div>`;
      }
      html += `</div><div style="background:#ffebee; padding:16px; border-radius:12px; margin-bottom:20px; border-left:5px solid #f44336;"><h3 style="color:#c62828; margin-top:0;">⚠️ ÁREAS A MEJORAR</h3>`;
      const debilidades = golpesOrdenados.slice(-2).reverse();
      for (const [golpeId, data] of debilidades) {
        html += `<div style="margin-bottom:12px;"><strong>🎯 ${data.nombre}</strong> - Promedio: <strong>${data.promedioGeneral.toFixed(1)}ª</strong>
          <div style="background:#ddd; border-radius:10px; height:10px; margin-top:5px;"><div style="background:#f44336; width:${(data.promedioGeneral / 7) * 100}%; height:10px; border-radius:10px;"></div></div>
          <p style="font-size:0.85rem; margin:5px 0 0 0;">${data.evaluaciones.length} evaluación(es) - Última: ${data.evaluaciones[data.evaluaciones.length-1]?.fecha || 'N/A'}</p></div>`;
      }
      html += `</div><details style="margin-top:20px;"><summary style="cursor:pointer; font-weight:bold; padding:10px; background:#f5f5f5; border-radius:8px;">📋 Ver detalle completo por golpe</summary>
        <div style="margin-top:16px;"><table style="width:100%; border-collapse:collapse;"><thead><tr style="background:#333; color:white;"><th style="padding:8px; text-align:left;">Golpe</th><th style="padding:8px; text-align:center;">Evaluaciones</th><th style="padding:8px; text-align:center;">Promedio</th><th style="padding:8px; text-align:center;">Tendencia</th></tr></thead><tbody>`;
      for (const [golpeId, data] of golpesOrdenados) {
        let tendencia = '⚪ Sin datos';
        if (data.evaluaciones.length >= 2) {
          const primera = data.evaluaciones[0].promedio;
          const ultima = data.evaluaciones[data.evaluaciones.length-1].promedio;
          if (ultima > primera) tendencia = '🟢 Mejorando';
          else if (ultima < primera) tendencia = '🔴 Bajando';
          else tendencia = '🟡 Estable';
        } else if (data.evaluaciones.length === 1) tendencia = '🟡 Primera evaluación';
        html += `<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;"><strong>${data.nombre}</strong></td><td style="padding:8px; text-align:center;">${data.evaluaciones.length}</td><td style="padding:8px; text-align:center;"><strong>${data.promedioGeneral.toFixed(1)}ª</strong></td><td style="padding:8px; text-align:center;">${tendencia}</td></tr>`;
      }
      html += `</tbody></table></div></details>`;
      resultadoDiv.innerHTML = html;
    } catch (err) {
      console.error(err);
      resultadoDiv.innerHTML = `<p style="color:red;">❌ Error al analizar: ${err.message}</p>`;
    }
  }

  // ========== COMPARATIVA (Alumno vs Profesor) ==========
  async function prepararVistaComparativa() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) return;
    const select = document.getElementById('comparativaAlumnoSelect');
    if (select) {
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
      } catch (err) { console.error(err); }
    }
    const resultadoDiv = document.getElementById('comparativaResultado');
    if (resultadoDiv) resultadoDiv.innerHTML = '<p style="color:#888;">Seleccioná un alumno y un golpe, luego presioná "Cargar Comparativa".</p>';
  }

  async function cargarComparativa() {
    const resultadoDiv = document.getElementById('comparativaResultado');
    if (!resultadoDiv) return;
    const alumnoSelect = document.getElementById('comparativaAlumnoSelect');
    const golpe = document.getElementById('comparativaGolpeSelect').value;
    if (!alumnoSelect || !alumnoSelect.value) {
      resultadoDiv.innerHTML = '<p style="color:#888;">Seleccioná un alumno y un golpe.</p>';
      return;
    }
    const alumnoUid = alumnoSelect.value;
    const alumnoNombre = alumnoSelect.options[alumnoSelect.selectedIndex].text;
    resultadoDiv.innerHTML = '<p>Cargando evaluaciones...</p>';
    try {
      const autoEvalSnapshot = await db.collection('evaluaciones')
        .where('uid', '==', alumnoUid)
        .where('golpe', '==', golpe)
        .where('tipo', '==', 'autoevaluacion')
        .orderBy('fecha', 'desc')
        .limit(1)
        .get();
      const profEvalSnapshot = await db.collection('evaluaciones')
        .where('alumnoUid', '==', alumnoUid)
        .where('golpe', '==', golpe)
        .where('tipo', 'in', ['profesor', 'fiscal'])
        .orderBy('fecha', 'desc')
        .limit(1)
        .get();
      const autoEval = autoEvalSnapshot.empty ? null : { id: autoEvalSnapshot.docs[0].id, ...autoEvalSnapshot.docs[0].data() };
      const profEval = profEvalSnapshot.empty ? null : { id: profEvalSnapshot.docs[0].id, ...profEvalSnapshot.docs[0].data() };
      if (!autoEval && !profEval) {
        resultadoDiv.innerHTML = '<p>📭 No hay evaluaciones de este alumno para este golpe.</p>';
        return;
      }
      const golpeData = DATA.golpes[golpe];
      if (!golpeData) {
        resultadoDiv.innerHTML = '<p>Error: No se encontraron datos del golpe.</p>';
        return;
      }
      let html = `<h3>Comparativa para ${alumnoNombre} - ${golpeData.nombre}</h3><div style="display:flex; gap:20px; overflow-x:auto;">`;
      html += `<div style="flex:1; background:#f5f5f5; border-radius:12px; padding:16px;"><h4 style="text-align:center;">📝 Autoevaluación del Alumno</h4>`;
      if (autoEval) {
        html += `<p><small>Fecha: ${autoEval.fechaLocal || 'Sin fecha'}</small></p>`;
        html += generarTablaEvaluacion(autoEval.selecciones, golpeData, profEval ? profEval.selecciones : null);
      } else {
        html += `<p style="color:#999; text-align:center;">No hay autoevaluación registrada.</p>`;
      }
      html += `</div><div style="flex:1; background:#f5f5f5; border-radius:12px; padding:16px;"><h4 style="text-align:center;">👨‍🏫 Evaluación del Profesor</h4>`;
      if (profEval) {
        html += `<p><small>Fecha: ${profEval.fechaLocal || 'Sin fecha'}</small></p>`;
        html += generarTablaEvaluacion(profEval.selecciones, golpeData, autoEval ? autoEval.selecciones : null);
      } else {
        html += `<p style="color:#999; text-align:center;">No hay evaluación del profesor.</p>`;
      }
      html += `</div></div>`;
      resultadoDiv.innerHTML = html;
      const evaluarBtn = document.getElementById('evaluarDesdeComparativaBtn');
      if (evaluarBtn) {
        if (!profEval) {
          evaluarBtn.style.display = 'inline-block';
          evaluarBtn.onclick = () => {
            const selectEval = document.getElementById('alumnoSelectEval');
            if (selectEval) {
              for (let i = 0; i < selectEval.options.length; i++) {
                if (selectEval.options[i].value === alumnoUid) { selectEval.selectedIndex = i; break; }
              }
            }
            document.querySelector('.tab[data-view="evaluacion"]').click();
          };
        } else {
          evaluarBtn.style.display = 'none';
        }
      }
    } catch (err) {
      console.error(err);
      resultadoDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
  }

  // ========== GENERAR TABLA EVALUACIÓN (CORREGIDO – SIN DUPLICADO) ==========
  function generarTablaEvaluacion(selecciones, golpeData, otraSeleccion = null) {
    let html = '<table style="width:100%; border-collapse:collapse;">';
    for (const [parKey, parData] of Object.entries(golpeData.pares)) {
      const parSelecciones = selecciones[parKey] || {};
      html += `<tr><td colspan="2" style="background:#ddd; padding:8px; font-weight:bold;">${parData.nombre}</td></tr>`;
      for (const cuant of parData.cuantificadores) {
        const catAuto = parSelecciones[cuant.id] || '?';
        let catProf = null;
        let diferencia = '';
        if (otraSeleccion && otraSeleccion[parKey] && otraSeleccion[parKey][cuant.id] !== undefined) {
          catProf = otraSeleccion[parKey][cuant.id];
          if (catAuto !== catProf) diferencia = ` <span style="color:red;">(dif: ${Math.abs(catAuto - catProf)}ª)</span>`;
        }
        html += `<tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;">${cuant.nombre}</td>
          <td style="padding:8px; text-align:center;">
            <span class="cat-badge cat-${catAuto}">${catAuto}ª</span>
            ${catProf ? `<span style="margin:0 8px;">→</span> <span class="cat-badge cat-${catProf}">${catProf}ª</span>` : ''}
            ${diferencia}
          </td>
        </tr>`;
      }
    }
    html += '</table>';
    return html;
  }

  // ========== CHECKLIST TÉCNICO POR GOLPE ==========
  const HABILIDADES_POR_GOLPE = {
    smash: { nombre: "Sobre Cabeza", items: ["Plano", "Efecto lado derecho", "Efecto lado revés (bandeja)", "Víboras", "Rulo", "Gancho", "A traerla (lento)"] },
    voleaDerecha: { nombre: "Volea Derecha", items: ["Bloqueo", "Plana", "Slice / cortada", "Globo defensivo", "Globo de ataque", "Drop / dejada"] },
    voleaReves: { nombre: "Volea Revés", items: ["Bloqueo", "Plana", "Slice / cortada", "Globo defensivo", "Globo de ataque", "Drop / dejada"] },
    pegadaFondoDerecha: { nombre: "Pegada de Fondo Derecha", items: ["Plana", "Cortada (slice)", "Liftada (topspin)", "Globo cruzado", "Globo paralelo", "Sobrepique", "Chiquita / drop", "Tensa (a media altura)"] },
    pegadaFondoReves: { nombre: "Pegada de Fondo Revés", items: ["Plana", "Cortada (slice)", "Liftada (topspin)", "Globo cruzado", "Globo paralelo", "Sobrepique", "Chiquita / drop", "Tensa (a media altura)"] },
    salidaPared: { nombre: "Salida de Pared", items: ["Drive rasante", "Revés rasante", "Globo desde pared", "Contra pared"] }
  };

  async function prepararVistaChecklist() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    const contenedorAlumno = document.getElementById('checklistAlumnoContainer');
    if (esProfesor) {
      contenedorAlumno.style.display = 'block';
      const select = document.getElementById('checklistAlumnoSelect');
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
        select.addEventListener('change', () => cargarChecklist());
      } catch (err) { console.error(err); }
    } else {
      contenedorAlumno.style.display = 'none';
    }
    const guardarBtn = document.getElementById('guardarChecklistBtn');
    if (guardarBtn) {
      guardarBtn.style.display = esProfesor ? 'block' : 'none';
      guardarBtn.onclick = guardarChecklist;
    }
    const golpeSelect = document.getElementById('checklistGolpeSelect');
    if (golpeSelect) golpeSelect.addEventListener('change', () => cargarChecklist());
    await cargarChecklist();
  }

  async function cargarChecklist() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    let alumnoUid = window.currentUser?.uid;
    if (esProfesor) {
      const select = document.getElementById('checklistAlumnoSelect');
      if (select && select.value) {
        alumnoUid = select.value;
      } else {
        const container = document.getElementById('checklistHabilidades');
        container.innerHTML = '<p style="color:#888;">Seleccioná un alumno para ver su checklist.</p>';
        return;
      }
    }
    const golpeKey = document.getElementById('checklistGolpeSelect').value;
    const habilidades = HABILIDADES_POR_GOLPE[golpeKey];
    if (!habilidades) return;
    try {
      const docRef = db.collection('checklists').doc(`${alumnoUid}_${golpeKey}`);
      const docSnap = await docRef.get();
      let habilidadesGuardadas = {};
      if (docSnap.exists) habilidadesGuardadas = docSnap.data().habilidades || {};
      const container = document.getElementById('checklistHabilidades');
      container.innerHTML = `<h3>${habilidades.nombre}</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px;">`;
      for (const item of habilidades.items) {
        const isChecked = habilidadesGuardadas[item] === true;
        const disabledAttr = !esProfesor ? 'disabled' : '';
        container.innerHTML += `<label class="checklist-item" style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9f9f9; border-radius: 8px;">
            <input type="checkbox" value="${item}" ${isChecked ? 'checked' : ''} ${disabledAttr}>
            <span>${item}</span>
          </label>`;
      }
      container.innerHTML += `</div>`;
      document.getElementById('checklistMensaje').innerHTML = '';
    } catch (err) {
      console.error(err);
      document.getElementById('checklistHabilidades').innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  }

  async function guardarChecklist() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) { alert('Solo los profesores pueden guardar el checklist.'); return; }
    const select = document.getElementById('checklistAlumnoSelect');
    if (!select || !select.value) { alert('Seleccioná un alumno primero.'); return; }
    const alumnoUid = select.value;
    const golpeKey = document.getElementById('checklistGolpeSelect').value;
    const habilidades = HABILIDADES_POR_GOLPE[golpeKey];
    if (!habilidades) return;
    const checkboxes = document.querySelectorAll('#checklistHabilidades input[type="checkbox"]');
    const habilidadesGuardadas = {};
    checkboxes.forEach(cb => { habilidadesGuardadas[cb.value] = cb.checked; });
    try {
      const docRef = db.collection('checklists').doc(`${alumnoUid}_${golpeKey}`);
      await docRef.set({
        alumnoUid, golpe: golpeKey, habilidades: habilidadesGuardadas,
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
        actualizadoPor: window.currentUser.uid
      });
      document.getElementById('checklistMensaje').innerHTML = '<p style="color:green;">✅ Checklist guardado correctamente.</p>';
      setTimeout(() => { const msg = document.getElementById('checklistMensaje'); if (msg) msg.innerHTML = ''; }, 3000);
    } catch (err) {
      console.error(err);
      document.getElementById('checklistMensaje').innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
  }

  // ========== EVENTOS DE BOTONES ADICIONALES ==========
  const actualizarGraficoBtn = document.getElementById('actualizarGraficoBtn');
  if (actualizarGraficoBtn) actualizarGraficoBtn.addEventListener('click', cargarProgreso);
  const analizarFortalezasBtn = document.getElementById('analizarFortalezasBtn');
  if (analizarFortalezasBtn) analizarFortalezasBtn.addEventListener('click', analizarFortalezasDebilidades);
  const cargarComparativaBtn = document.getElementById('cargarComparativaBtn');
  if (cargarComparativaBtn) cargarComparativaBtn.addEventListener('click', cargarComparativa);

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
        if (view === 'progreso') prepararVistaProgreso().catch(console.error);
        if (view === 'fortalezas') prepararVistaFortalezas().catch(console.error);
        if (view === 'comparativa') prepararVistaComparativa().catch(console.error);
        if (view === 'checklist') prepararVistaChecklist().catch(console.error);
      }
    } else {
      if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
    }
  };
  if (window.currentUser) window.initApp();
  else if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
});
