// ==================== APP.JS – VERSIÓN FINAL CORREGIDA ====================
document.addEventListener('DOMContentLoaded', () => {

  // Función global para logs visibles en pantalla
  window.logToScreen = window.logToScreen || ((msg) => console.log(msg));

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

  // ========== CONFIGURAR INTERFAZ SEGÚN ROL ==========
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
    const historialTab = document.querySelector('.tab[data-view="historial"]');
    const manualTab = document.querySelector('.tab[data-view="manual"]');

    if (adminTab) adminTab.style.display = esProfesorOFiscal ? '' : 'none';
    if (nuevaPlanificacionTab) nuevaPlanificacionTab.style.display = esProfesorOFiscal ? '' : 'none';
    if (historialTab) historialTab.style.display = esProfesorOFiscal ? '' : 'none';
    if (manualTab) manualTab.style.display = esProfesorOFiscal ? '' : 'none';

    // ========== CAMPO JUGADOR SEGÚN ROL ==========
    const jugadorDiv = document.getElementById('jugadorInfoDiv');
    const inputNombre = document.getElementById('playerName');
    const selectAlumnos = document.getElementById('alumnoSelectEval');

    if (esProfesorOFiscal) {
      if (inputNombre) inputNombre.style.display = 'none';
      if (selectAlumnos) {
        selectAlumnos.style.display = 'block';
        llenarSelectConAlumnos(selectAlumnos);  // CORRECCIÓN #2
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

      // CORRECCIÓN #8: Botón "Mis evaluaciones" para alumnos
      const btnMisEval = document.getElementById('btnMisEvaluaciones');
      if (btnMisEval) btnMisEval.style.display = 'inline-block';
    }

    // CORRECCIÓN #5: Mostrar número de habilidad en perfil alumno
    if (!esProfesorOFiscal && window.currentUser) {
      mostrarNumeroHabilidadAlumno(window.currentUser.uid);
    }
  }

  // CORRECCIÓN #2: Función única para cargar alumnos vinculados con caché
  async function cargarAlumnosVinculados() {
    if (window.alumnosVinculadosCache && window.alumnosVinculadosCache.timestamp > Date.now() - 300000) {
      return window.alumnosVinculadosCache.data;
    }
    const data = [];
    try {
      const vinculaciones = await db.collection('vinculaciones')
        .where('profesorUid', '==', window.currentUser.uid)
        .get();
      vinculaciones.forEach(doc => {
        const d = doc.data();
        data.push({ uid: d.alumnoUid, nombre: d.alumnoNombre || 'Sin nombre' });
      });
      window.alumnosVinculadosCache = { data, timestamp: Date.now() };
    } catch (err) {
      console.error('Error cargando alumnos vinculados:', err);
      window.alumnosVinculadosCache = { data: [], timestamp: Date.now() };
    }
    return data;
  }

  function llenarSelectConAlumnos(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    cargarAlumnosVinculados().then(alumnos => {
      if (alumnos.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'No hay alumnos vinculados';
        opt.disabled = true;
        selectElement.appendChild(opt);
        return;
      }
      alumnos.forEach(al => {
        const opt = document.createElement('option');
        opt.value = al.uid;
        opt.textContent = al.nombre;
        selectElement.appendChild(opt);
      });
    }).catch(err => console.error(err));
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
      if (view === 'manual')              prepararVistaManual();  // CORRECCIÓN #7 y #9
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
    // CORRECCIÓN #2: usar función unificada
    llenarSelectConAlumnos(select);
  }

  generarPlanBtn.addEventListener('click', async () => {
    window.logToScreen('🔘 Botón Generar Plan clickeado');
    const alumnoUid = alumnoSelect.value;
    window.logToScreen(`Alumno UID: ${alumnoUid}`);
    if (!alumnoUid) { alert('⚠️ Seleccioná un alumno.'); return; }
    const golpeSelect = document.getElementById('golpeEntrenamientoSelect');
    const golpe = golpeSelect ? golpeSelect.value : 'smash';
    window.logToScreen(`Golpe: ${golpe}`);
    try {
      const snapshot = await db.collection('evaluaciones')
        .where('alumnoUid', '==', alumnoUid)   // CORRECCIÓN #3
        .where('golpe', '==', golpe)
        .orderBy('fecha', 'desc')
        .limit(1)
        .get();
      window.logToScreen(`Evaluaciones encontradas: ${snapshot.size}`);
      if (snapshot.empty) {
        alert(`No hay evaluaciones de este alumno para el golpe "${golpe}".`);
        return;
      }
      const evaluacion = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      const objetivo = parseInt(categoriaObjetivo.value);
      planGeneradoHTML = construirPlan(evaluacion, objetivo);
      planEntrenamiento.innerHTML = planGeneradoHTML;
      descargarPlanBtn.style.display = 'inline-block';
      window.logToScreen('✅ Plan generado correctamente');
    } catch (err) {
      window.logToScreen(`❌ Error: ${err.message}`);
      alert('Error al generar plan: ' + err.message);
    }
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
        let alumnoData = { email: 'No disponible', rol: 'alumno', numeroHabilidad: null };
        try {
          const alumnoDoc = await db.collection('usuarios').doc(alumnoUid).get();
          if (alumnoDoc.exists) alumnoData = alumnoDoc.data();
        } catch (err) { console.warn(err); }

        // CORRECCIÓN #5: Mostrar número de habilidad
        let numeroHabilidadHTML = '';
        if (alumnoData.numeroHabilidad) {
          numeroHabilidadHTML = `<span class="numero-habilidad-badge">🏅 ${alumnoData.numeroHabilidad.toFixed(1)}</span>`;
        } else {
          numeroHabilidadHTML = `<span class="numero-habilidad-badge" style="opacity:0.5;">🏅 ?</span>`;
        }

        html += `
          <div class="alumno-card" data-uid="${alumnoUid}">
            <h3>${nombreVinculacion} ${numeroHabilidadHTML}</h3>
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

      // CORRECCIÓN #5: calcular número de habilidad para cada alumno
      vinculacionesSnap.docs.forEach(async (doc) => {
        const alumnoUid = doc.data().alumnoUid;
        try {
          await calcularNumeroHabilidad(alumnoUid);
          // Refrescar badge si es necesario (podría actualizar el DOM)
        } catch (e) { console.warn('Error calculando habilidad para', alumnoUid, e); }
      });

      document.querySelectorAll('.ver-evaluaciones-alumno').forEach(btn => {
        btn.addEventListener('click', async () => {
          const uid = btn.dataset.uid;
          const container = document.getElementById(`evaluaciones-${uid}`);
          if (container.style.display === 'none') {
            container.style.display = 'block';
            container.innerHTML = '<p>Cargando evaluaciones...</p>';
            try {
              // CORRECCIÓN #3: cambiar uid por alumnoUid
              const evaluacionesSnap = await db.collection('evaluaciones')
                .where('alumnoUid', '==', uid)
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
            } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
            btn.textContent = '🔼 Ocultar evaluaciones';
          } else {
            container.style.display = 'none';
            btn.textContent = '📋 Ver evaluaciones';
          }
        });
      });
      document.querySelectorAll('.ver-planificaciones-alumno').forEach(btn => {
        btn.addEventListener('click', async () => {
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
            } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
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

  // CORRECCIÓN #5: Calcular número de habilidad
  async function calcularNumeroHabilidad(alumnoUid) {
    try {
      // Evaluaciones de profesor/fiscal para ese alumno
      const evalsSnap = await db.collection('evaluaciones')
        .where('alumnoUid', '==', alumnoUid)
        .where('tipo', 'in', ['profesor', 'fiscal'])
        .get();

      let promedioCat = null;
      if (!evalsSnap.empty) {
        let suma = 0, cuenta = 0;
        evalsSnap.forEach(doc => {
          const data = doc.data();
          if (data.selecciones) {
            for (const par of Object.values(data.selecciones)) {
              for (const cat of Object.values(par)) {
                suma += cat;
                cuenta++;
              }
            }
          }
        });
        if (cuenta > 0) promedioCat = suma / cuenta;
      }

      let nivelBase = 1;
      if (promedioCat !== null) {
        // 7ª -> 1, 6ª -> 2, ..., 2ª -> 6
        nivelBase = Math.round(8 - promedioCat);
        nivelBase = Math.max(1, Math.min(6, nivelBase));
      }

      // Checklists del alumno
      const checklistSnap = await db.collection('checklists').where('alumnoUid', '==', alumnoUid).get();
      let totalItems = 0, marcados = 0;
      checklistSnap.forEach(doc => {
        const data = doc.data();
        const habilidades = data.habilidades || {};
        const personalizadas = data.habilidadesPersonalizadas || {};
        const allHabs = { ...habilidades, ...personalizadas };
        const keys = Object.keys(allHabs);
        totalItems += keys.length;
        keys.forEach(k => { if (allHabs[k] === true) marcados++; });
      });

      let decimal = 0;
      if (totalItems > 0) decimal = marcados / totalItems;
      decimal = Math.round(decimal * 10) / 10; // un decimal

      const numeroHabilidad = nivelBase + decimal;
      // Guardar en Firestore
      await db.collection('usuarios').doc(alumnoUid).update({ numeroHabilidad: numeroHabilidad });
      return numeroHabilidad;
    } catch (err) {
      console.error('Error calculando número de habilidad:', err);
      return null;
    }
  }

  // Función para mostrar en el perfil del alumno
  async function mostrarNumeroHabilidadAlumno(uid) {
    const span = document.getElementById('numeroHabilidadAlumno');
    if (!span) return;
    try {
      const userDoc = await db.collection('usuarios').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data.numeroHabilidad) {
          span.textContent = `🏅 ${data.numeroHabilidad.toFixed(1)}`;
          span.style.display = 'inline';
        } else {
          span.style.display = 'none';
        }
      }
    } catch (e) { console.warn(e); }
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
    // CORRECCIÓN #2
    llenarSelectConAlumnos(select);
  }

  cargarPlanSegBtn.addEventListener('click', async () => {
    const alumnoUid = alumnoSelectSeg.value;
    if (!alumnoUid) return alert('⚠️ Seleccioná un alumno.');
    const objetivo = parseInt(categoriaObjetivoSeg.value);
    const golpeSelect = document.getElementById('golpeSeguimientoSelect');
    const golpeFiltro = golpeSelect && golpeSelect.value ? golpeSelect.value : null;
    let query = db.collection('evaluaciones').where('alumnoUid', '==', alumnoUid);  // CORRECCIÓN #3
    if (golpeFiltro) query = query.where('golpe', '==', golpeFiltro);
    const snapshot = await query.orderBy('fecha', 'desc').limit(1).get();
    if (snapshot.empty) { alert('No hay evaluaciones de este alumno.'); return; }
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
          <label>Series:</label><input type="number" min="0" max="${ej.totalSeries}" value="0" data-index="${index}" data-campo="series">
          <label>Éxitos:</label><input type="number" min="0" max="${ej.totalSeries * ej.totalRepsPorSerie}" value="0" data-index="${index}" data-campo="exitosas">
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

  // ========== MOSTRAR RESULTADO DE SESIÓN (CORREGIDO) ==========
  function mostrarResultadoSesion(plan) {
    const viejo = document.getElementById('resultadoSesion');
    if (viejo) viejo.remove();
    const div = document.createElement('div');
    div.id = 'resultadoSesion';
    div.className = 'resultado-sesion';
    const obj = plan.objetivo;
    const res = {};
    plan.ejercicios.forEach(ej => {
      if (!res[ej.cuantId]) res[ej.cuantId] = { nombre: ej.nombreCuant, catActual: 5, catAlc: 7, ejs: [] };
      const ok = ej.repeticionesExitosas >= ej.minimoExitos;
      res[ej.cuantId].ejs.push({ ...ej, ok });
      if (ok && ej.catFin < res[ej.cuantId].catAlc) res[ej.cuantId].catAlc = ej.catFin;
    });
    let asc = 0, rep = 0, desc = 0;
    // CORRECCIÓN #1: tabla limpia
    let tabla = '<table class="tabla-veredicto"><tr><th>Cuantificador</th><th>Obj</th><th>Alc</th><th>Veredicto</th></tr>';
    for (const [, d] of Object.entries(res)) {
      let v = '';
      if (d.catAlc <= obj) { v = '⬆ Ascender'; asc++; }
      else if (d.catAlc > 5) { v = '⬇ Descender'; desc++; }
      else { v = '↻ Repetir'; rep++; }
      tabla += `<tr><td><strong>${d.nombre}</strong></td><td>${obj}ª</td><td>${d.catAlc}ª</td><td>${v}</td></tr>`;
    }
    tabla += '</table>';
    let vg = '';
    if (desc > 0) vg = '<span class="veredicto descenso">⬇ DESCENDER</span>';
    else if (rep > 0) vg = '<span class="veredicto repetir">↻ REPETIR</span>';
    else vg = '<span class="veredicto ascenso">⬆ ASCENDER</span>';
    div.innerHTML = '<h3>📊 Resultado</h3>' + tabla + `<p class="veredicto-global">${vg}</p>`;
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
    // CORRECCIÓN #2
    llenarSelectConAlumnos(select);
  }
  generarYGuardarPlanBtn.addEventListener('click', async () => {
    const alumnoUid = alumnoPlanSelect.value;
    const alumnoNombre = alumnoPlanSelect.options[alumnoPlanSelect.selectedIndex]?.text.replace('👤 ', '') || '';
    const golpe = golpePlanSelect.value;
    const objetivo = parseInt(categoriaObjetivoPlan.value);
    if (!alumnoUid) return alert('⚠️ Seleccioná un alumno.');
    const snapshot = await db.collection('evaluaciones')
      .where('alumnoUid', '==', alumnoUid)  // CORRECCIÓN #3
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
      // CORRECCIÓN #2: llenar select con alumnos vinculados
      llenarSelectConAlumnos(select);
      select.addEventListener('change', () => cargarProgreso());
    } else {
      contenedor.style.display = 'none';
    }
    await cargarProgreso();
  }

  async function cargarProgreso() {
    if (!window.currentUser) return;
    const golpe = document.getElementById('progresoGolpeSelect').value;
    const metrica = document.getElementById('progresoMetricaSelect').value;
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    let uid = window.currentUser.uid;
    if (esProfesor) {
      const alumnoSelect = document.getElementById('progresoAlumnoSelect');
      if (alumnoSelect && alumnoSelect.value) uid = alumnoSelect.value;
      else {
        document.getElementById('graficoEvolucion').style.display = 'none';
        document.getElementById('noDatosProgreso').style.display = 'block';
        document.getElementById('noDatosProgreso').innerHTML = '<p>Seleccioná un alumno para ver su progreso.</p>';
        return;
      }
    }
    // CORRECCIÓN #3: usar alumnoUid en lugar de uid
    const snapshot = await db.collection('evaluaciones')
      .where('alumnoUid', '==', uid)
      .where('golpe', '==', golpe)
      .orderBy('fecha', 'asc')
      .get();
    if (snapshot.empty) {
      document.getElementById('graficoEvolucion').style.display = 'none';
      document.getElementById('noDatosProgreso').style.display = 'block';
      document.getElementById('noDatosProgreso').innerHTML = '<p>No hay evaluaciones de este golpe.</p>';
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
      // CORRECCIÓN #2
      llenarSelectConAlumnos(select);
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
        resultadoDiv.innerHTML = '<p style="color:#888;">Seleccioná un alumno para ver su análisis.</p>';
        return;
      }
    }
    resultadoDiv.innerHTML = '<p>Cargando evaluaciones...</p>';
    try {
      // CORRECCIÓN #3: usar alumnoUid
      const snapshot = await db.collection('evaluaciones').where('alumnoUid', '==', uid).get();
      if (snapshot.empty) {
        resultadoDiv.innerHTML = `<p>📭 ${nombrePersona} no tiene evaluaciones guardadas.</p>`;
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
          <p>Tiene <strong>${evaluaciones.length}</strong> evaluaciones en <strong>${Object.keys(golpesData).length}</strong> golpes.</p>
          <p>Promedio general: <strong>${(golpesOrdenados.reduce((acc, [_, g]) => acc + g.promedioGeneral, 0) / golpesOrdenados.length).toFixed(1)}ª</strong></p>
        </div>`;
      html += `<div style="background:#e8f5e9; padding:16px; border-radius:12px; margin-bottom:20px; border-left:5px solid #4caf50;"><h3>✅ FORTALEZAS</h3>`;
      for (const [golpeId, data] of golpesOrdenados.slice(0, 2)) {
        html += `<div><strong>🏆 ${data.nombre}</strong> - Promedio: <strong>${data.promedioGeneral.toFixed(1)}ª</strong><div style="background:#ddd; border-radius:10px; height:10px; margin-top:5px;"><div style="background:#4caf50; width:${(data.promedioGeneral / 7) * 100}%; height:10px; border-radius:10px;"></div></div><p>${data.evaluaciones.length} eva(s) - Última: ${data.evaluaciones[data.evaluaciones.length-1]?.fecha || 'N/A'}</p></div>`;
      }
      html += `</div><div style="background:#ffebee; padding:16px; border-radius:12px; margin-bottom:20px; border-left:5px solid #f44336;"><h3>⚠️ ÁREAS A MEJORAR</h3>`;
      for (const [golpeId, data] of golpesOrdenados.slice(-2).reverse()) {
        html += `<div><strong>🎯 ${data.nombre}</strong> - Promedio: <strong>${data.promedioGeneral.toFixed(1)}ª</strong><div style="background:#ddd; border-radius:10px; height:10px; margin-top:5px;"><div style="background:#f44336; width:${(data.promedioGeneral / 7) * 100}%; height:10px; border-radius:10px;"></div></div><p>${data.evaluaciones.length} eva(s) - Última: ${data.evaluaciones[data.evaluaciones.length-1]?.fecha || 'N/A'}</p></div>`;
      }
      html += `</div><details><summary>📋 Detalle completo</summary><table style="width:100%; border-collapse:collapse;"><thead><tr style="background:#333; color:white;"><th>Golpe</th><th>Evaluaciones</th><th>Promedio</th><th>Tendencia</th></tr></thead><tbody>`;
      for (const [golpeId, data] of golpesOrdenados) {
        let tendencia = '⚪ Sin datos';
        if (data.evaluaciones.length >= 2) {
          const primera = data.evaluaciones[0].promedio;
          const ultima = data.evaluaciones[data.evaluaciones.length-1].promedio;
          tendencia = ultima > primera ? '🟢 Mejorando' : ultima < primera ? '🔴 Bajando' : '🟡 Estable';
        } else if (data.evaluaciones.length === 1) tendencia = '🟡 Primera evaluación';
        html += `<tr><td><strong>${data.nombre}</strong></td><td style="text-align:center;">${data.evaluaciones.length}</td><td style="text-align:center;"><strong>${data.promedioGeneral.toFixed(1)}ª</strong></td><td style="text-align:center;">${tendencia}</td></tr>`;
      }
      html += `</tbody></table></details>`;
      resultadoDiv.innerHTML = html;
    } catch (err) {
      console.error(err);
      resultadoDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
  }

  // ========== COMPARATIVA (Alumno vs Profesor) ==========
  async function prepararVistaComparativa() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) return;
    const select = document.getElementById('comparativaAlumnoSelect');
    if (select) {
      // CORRECCIÓN #2
      llenarSelectConAlumnos(select);
    }
    const resultadoDiv = document.getElementById('comparativaResultado');
    if (resultadoDiv) resultadoDiv.innerHTML = '<p>Seleccioná alumno y golpe, luego presioná "Cargar Comparativa".</p>';
  }

  async function cargarComparativa() {
    const resultadoDiv = document.getElementById('comparativaResultado');
    if (!resultadoDiv) return;
    const alumnoSelect = document.getElementById('comparativaAlumnoSelect');
    const golpe = document.getElementById('comparativaGolpeSelect').value;
    if (!alumnoSelect || !alumnoSelect.value) {
      resultadoDiv.innerHTML = '<p>Seleccioná un alumno y un golpe.</p>';
      return;
    }
    const alumnoUid = alumnoSelect.value;
    const alumnoNombre = alumnoSelect.options[alumnoSelect.selectedIndex].text;
    resultadoDiv.innerHTML = '<p>Cargando...</p>';
    try {
      // Autoevaluación del alumno
      const autoEvalSnapshot = await db.collection('evaluaciones')
        .where('alumnoUid', '==', alumnoUid)
        .where('golpe', '==', golpe)
        .where('tipo', '==', 'autoevaluacion')
        .orderBy('fecha', 'desc')
        .limit(1)
        .get();
      // Evaluación del profesor/fiscal
      const profEvalSnapshot = await db.collection('evaluaciones')
        .where('alumnoUid', '==', alumnoUid)
        .where('golpe', '==', golpe)
        .where('tipo', 'in', ['profesor', 'fiscal'])
        .orderBy('fecha', 'desc')
        .limit(1)
        .get();
      const autoEval = autoEvalSnapshot.empty ? null : autoEvalSnapshot.docs[0].data();
      const profEval = profEvalSnapshot.empty ? null : profEvalSnapshot.docs[0].data();
      if (!autoEval && !profEval) {
        resultadoDiv.innerHTML = '<p>No hay evaluaciones de este alumno para este golpe.</p>';
        return;
      }
      const golpeData = DATA.golpes[golpe];
      if (!golpeData) {
        resultadoDiv.innerHTML = '<p>Error: datos del golpe no encontrados.</p>';
        return;
      }
      let html = `<h3>Comparativa para ${alumnoNombre} - ${golpeData.nombre}</h3><div style="display:flex; gap:20px; overflow-x:auto;">`;
      html += `<div style="flex:1; background:#f5f5f5; border-radius:12px; padding:16px;"><h4>📝 Autoevaluación</h4>`;
      if (autoEval) {
        html += `<p><small>Fecha: ${autoEval.fechaLocal || 'Sin fecha'}</small></p>`;
        html += generarTablaEvaluacion(autoEval.selecciones, golpeData, profEval ? profEval.selecciones : null);
      } else { html += '<p>No hay autoevaluación.</p>'; }
      html += `</div><div style="flex:1; background:#f5f5f5; border-radius:12px; padding:16px;"><h4>👨‍🏫 Evaluación del Profesor</h4>`;
      if (profEval) {
        html += `<p><small>Fecha: ${profEval.fechaLocal || 'Sin fecha'}</small></p>`;
        html += generarTablaEvaluacion(profEval.selecciones, golpeData, autoEval ? autoEval.selecciones : null);
      } else { html += '<p>No hay evaluación del profesor.</p>'; }
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
        } else { evaluarBtn.style.display = 'none'; }
      }
    } catch (err) {
      console.error(err);
      resultadoDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
  }

  function generarTablaEvaluacion(selecciones, golpeData, otraSeleccion = null) {
    let html = '<table style="width:100%; border-collapse:collapse;">';
    for (const [parKey, parData] of Object.entries(golpeData.pares)) {
      const parSelecciones = selecciones[parKey] || {};
      html += `<tr><td colspan="2" style="background:#ddd; padding:8px; font-weight:bold;">${parData.nombre}</td></tr>`;
      for (const cuant of parData.cuantificadores) {
        const catAuto = parSelecciones[cuant.id] || '?';
        let catProf = null, diferencia = '';
        if (otraSeleccion && otraSeleccion[parKey] && otraSeleccion[parKey][cuant.id] !== undefined) {
          catProf = otraSeleccion[parKey][cuant.id];
          if (catAuto !== catProf) diferencia = ` <span style="color:red;">(dif: ${Math.abs(catAuto - catProf)}ª)</span>`;
        }
        html += `<tr><td>${cuant.nombre}</td><td><span class="cat-badge cat-${catAuto}">${catAuto}ª</span>${catProf ? ` → <span class="cat-badge cat-${catProf}">${catProf}ª</span>` : ''}${diferencia}</td></tr>`;
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
      // CORRECCIÓN #2
      llenarSelectConAlumnos(select);
      select.addEventListener('change', () => cargarChecklist());
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

  // CORRECCIÓN #6: Habilidades personalizadas
  async function cargarChecklist() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    let alumnoUid = window.currentUser?.uid;
    if (esProfesor) {
      const select = document.getElementById('checklistAlumnoSelect');
      if (select && select.value) alumnoUid = select.value;
      else {
        document.getElementById('checklistHabilidades').innerHTML = '<p>Seleccioná un alumno.</p>';
        return;
      }
    }
    const golpeKey = document.getElementById('checklistGolpeSelect').value;
    const habilidadesBase = HABILIDADES_POR_GOLPE[golpeKey];
    if (!habilidadesBase) return;

    try {
      const docRef = db.collection('checklists').doc(`${alumnoUid}_${golpeKey}`);
      const docSnap = await docRef.get();
      let habilidadesGuardadas = {};
      let personalizadasGuardadas = [];
      if (docSnap.exists) {
        const data = docSnap.data();
        habilidadesGuardadas = data.habilidades || {};
        personalizadasGuardadas = data.habilidadesPersonalizadas || [];
      }

      const todasHabilidades = [...habilidadesBase.items, ...personalizadasGuardadas];
      const container = document.getElementById('checklistHabilidades');
      container.innerHTML = `<h3>${habilidadesBase.nombre}</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px;">`;

      todasHabilidades.forEach(item => {
        const isChecked = habilidadesGuardadas[item] === true || personalizadasGuardadas.includes(item) && habilidadesGuardadas[item] !== false;
        const disabledAttr = !esProfesor ? 'disabled' : '';
        let eliminarBtn = '';
        if (esProfesor && personalizadasGuardadas.includes(item)) {
          eliminarBtn = ` <button class="btn-chico eliminar-habilidad-pers" data-habilidad="${item}" style="margin-left:8px; padding:2px 6px; background:#e74c3c; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️</button>`;
        }
        container.innerHTML += `<label style="display:flex; align-items:center;"><input type="checkbox" value="${item}" ${isChecked ? 'checked' : ''} ${disabledAttr}> ${item}${eliminarBtn}</label>`;
      });
      container.innerHTML += `</div>`;

      // Input para agregar habilidad personalizada (solo profesor)
      if (esProfesor) {
        container.innerHTML += `
          <div style="margin-top:16px; display:flex; gap:8px; align-items:center;">
            <input type="text" id="nuevaHabilidadInput" placeholder="Nueva habilidad personalizada" style="flex:1; padding:8px; border-radius:6px; border:1px solid #ccc;">
            <button id="agregarHabilidadBtn" class="btn-primary btn-chico">➕ Agregar habilidad</button>
          </div>`;
        document.getElementById('agregarHabilidadBtn').addEventListener('click', async () => {
          const input = document.getElementById('nuevaHabilidadInput');
          const nuevaHab = input.value.trim();
          if (!nuevaHab) return;
          // Actualizar documento en Firestore
          const docRef = db.collection('checklists').doc(`${alumnoUid}_${golpeKey}`);
          const docSnap = await docRef.get();
          let habilidadesGuardadas = {};
          let personalizadasGuardadas = [];
          if (docSnap.exists) {
            const data = docSnap.data();
            habilidadesGuardadas = data.habilidades || {};
            personalizadasGuardadas = data.habilidadesPersonalizadas || [];
          }
          if (!personalizadasGuardadas.includes(nuevaHab)) {
            personalizadasGuardadas.push(nuevaHab);
            habilidadesGuardadas[nuevaHab] = false; // por defecto no marcada
            await docRef.set({
              alumnoUid,
              golpe: golpeKey,
              habilidades: habilidadesGuardadas,
              habilidadesPersonalizadas: personalizadasGuardadas,
              ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
              actualizadoPor: window.currentUser.uid
            }, { merge: true });
            input.value = '';
            cargarChecklist(); // refrescar
          } else {
            alert('Esa habilidad ya existe.');
          }
        });
      }

      // Eventos para eliminar habilidades personalizadas
      document.querySelectorAll('.eliminar-habilidad-pers').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const habilidad = btn.dataset.habilidad;
          if (!confirm(`¿Eliminar "${habilidad}"?`)) return;
          const docRef = db.collection('checklists').doc(`${alumnoUid}_${golpeKey}`);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const data = docSnap.data();
            let personalizadasGuardadas = data.habilidadesPersonalizadas || [];
            personalizadasGuardadas = personalizadasGuardadas.filter(h => h !== habilidad);
            const habilidades = data.habilidades || {};
            delete habilidades[habilidad];
            await docRef.update({ habilidades, habilidadesPersonalizadas: personalizadasGuardadas });
            cargarChecklist();
          }
        });
      });

      document.getElementById('checklistMensaje').innerHTML = '';
    } catch (err) {
      console.error(err);
      document.getElementById('checklistHabilidades').innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  }

  async function guardarChecklist() {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    if (!esProfesor) { alert('Solo profesores pueden guardar.'); return; }
    const select = document.getElementById('checklistAlumnoSelect');
    if (!select || !select.value) { alert('Seleccioná un alumno.'); return; }
    const alumnoUid = select.value;
    const golpeKey = document.getElementById('checklistGolpeSelect').value;
    const checkboxes = document.querySelectorAll('#checklistHabilidades input[type="checkbox"]');
    const habilidadesGuardadas = {};
    checkboxes.forEach(cb => { habilidadesGuardadas[cb.value] = cb.checked; });
    // Obtener también las personalizadas actuales (no perdemos referencia)
    const docRef = db.collection('checklists').doc(`${alumnoUid}_${golpeKey}`);
    const docSnap = await docRef.get();
    let personalizadasGuardadas = [];
    if (docSnap.exists) {
      personalizadasGuardadas = docSnap.data().habilidadesPersonalizadas || [];
    }
    try {
      await docRef.set({
        alumnoUid,
        golpe: golpeKey,
        habilidades: habilidadesGuardadas,
        habilidadesPersonalizadas: personalizadasGuardadas,
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
        actualizadoPor: window.currentUser.uid
      });
      document.getElementById('checklistMensaje').innerHTML = '<p style="color:green;">✅ Checklist guardado.</p>';
      setTimeout(() => { document.getElementById('checklistMensaje').innerHTML = ''; }, 3000);
    } catch (err) {
      console.error(err);
      document.getElementById('checklistMensaje').innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
  }

  // ========== FUNCIONES COMPLETAS DEL MANUAL ==========
  function prepararVistaManual() {
    const container = document.getElementById('manualView');
    if (!container) return;

    container.innerHTML = `
      <div class="manual-wrapper">

        <div class="manual-hero">
          <h1>📘 Método Sistemático de Categorización</h1>
          <p class="manual-subtitulo">Colegio de Fiscales F.A.P. — Base técnica de este sistema de evaluación</p>
        </div>

        <!-- INTRODUCCIÓN -->
        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>📖 Introducción al Método</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <p>Este método tiene como única finalidad encontrar una forma objetiva de <strong>categorizar el nivel de juego</strong> de cualquier jugador de pádel, independientemente de comparaciones con otros jugadores o resultados de competencias.</p>
            <div class="manual-highlight">
              <strong>Principio clave:</strong> No existe un golpe de 5ª o de 3ª, sino una <em>forma característica de juego</em> de 5ª o 3ª. Por eso el sistema analiza los golpes junto con los desplazamientos asociados a ellos.
            </div>
            <h3>Métodos descartados</h3>
            <ul>
              <li><strong>Método Comparativo:</strong> Requiere jugadores "modelo" por categoría. Limitado geográficamente, subjetivo y pierde vigencia rápidamente en categorías bajas donde la evolución es veloz.</li>
              <li><strong>Método de Ascensos y Descensos:</strong> Solo apto para quienes compiten a nivel nacional con frecuencia. Excluye a la gran mayoría de jugadores.</li>
            </ul>
            <h3>¿Qué analiza este método?</h3>
            <p>Se identificaron <strong>4 golpes base</strong> que se ejecutan en cualquier partido, y para cada uno se definieron <strong>4 cuantificadores</strong> que permiten medir nivel de manera precisa y repetible:</p>
            <div class="manual-golpes-grid">
              <div class="manual-golpe-chip">🏐 Smash</div>
              <div class="manual-golpe-chip">🏸 Volea</div>
              <div class="manual-golpe-chip">🎯 Pegada de Fondo</div>
              <div class="manual-golpe-chip">🧱 Salida de Pared</div>
            </div>
          </div>
        </div>

        <!-- LOS CUANTIFICADORES -->
        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>📏 Los 4 Cuantificadores por Golpe</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <p>Para cada uno de los 4 golpes, se miden estas 4 dimensiones:</p>

            <div class="manual-cuant-grid">
              <div class="manual-cuant-card">
                <div class="cuant-numero">1</div>
                <h4>Aptitud de Golpe-Impacto</h4>
                <p>Capacidad para impactar la pelota y transferirle efectos (plano, sidespin, slice, topspin).</p>
              </div>
              <div class="manual-cuant-card">
                <div class="cuant-numero">2</div>
                <h4>Capacidad de Direccionamiento</h4>
                <p>Grado de exactitud con que el jugador puede elegir <em>conscientemente</em> el lugar de destino de la pelota.</p>
              </div>
              <div class="manual-cuant-card">
                <div class="cuant-numero">3</div>
                <h4>Cambios de Velocidad</h4>
                <p>Habilidad para cambiar voluntariamente la velocidad de la pelota, usando ese recurso a favor (estrategia del golpe).</p>
              </div>
              <div class="manual-cuant-card">
                <div class="cuant-numero">4</div>
                <h4>Factor Específico del Golpe</h4>
                <p>Varía según el golpe: <strong>Continuidad</strong> (Smash), <strong>Profundidad</strong> (Volea), <strong>Error</strong> (Pegada de Fondo), <strong>Levantadas</strong> (Salida de Pared).</p>
              </div>
            </div>

            <h3 style="margin-top:24px;">Zonas de la cancha</h3>
            <p>El método divide cada campo en 3 zonas para precisar las observaciones:</p>
            <div class="manual-zonas">
              <div class="zona zona-c"><strong>ZONA I</strong><br>1,5 m desde la red</div>
              <div class="zona zona-b"><strong>ZONA II</strong><br>5,5 m intermedios</div>
              <div class="zona zona-a"><strong>ZONA III</strong><br>3 m desde pared de fondo</div>
            </div>
          </div>
        </div>

        <!-- LOS PARES -->
        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>⚙️ Los Pares y Posicionamientos</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <p>Un partido de pádel es una sucesión ininterrumpida de golpes y desplazamientos. Por eso el método evalúa cada golpe unido a sus movimientos asociados, en unidades que llama <strong>Pares</strong>:</p>

            <div class="manual-par-box">
              <div class="par-box-item">
                <span class="par-badge">PAR I</span>
                <h4>Golpe-Impacto + Desplazamiento de Posicionamiento</h4>
                <p>Asocia el golpe con los movimientos que el jugador hace <em>mientras la pelota viaja hacia el rival</em> (hasta que el rival la impacta). Evalúa técnica de golpe + inteligencia táctica de reubicación.</p>
              </div>
              <div class="par-box-item">
                <span class="par-badge">PAR II</span>
                <h4>Desplazamiento de Reposicionamiento + Golpe-Devolución</h4>
                <p>Evalúa los movimientos <em>desde que el rival impacta</em> hasta que nuestro jugador está en condiciones de pegar. Incluye la <strong>Lectura de Pelota</strong>: anticipar trayectoria, efectos y rebotes.</p>
              </div>
            </div>

            <div class="manual-highlight">
              <strong>Lectura de Pelota</strong> es el conocimiento que brinda la práctica y la concentración para presumir, <em>antes que el rival impulse la pelota</em>, dónde va a ir y qué recorrido va a describir considerando efectos, velocidad y rebotes en paredes.
            </div>

            <h3>Desplazamientos: dos dimensiones</h3>
            <ul>
              <li><strong>Verticales:</strong> Según el eje red-pared trasera. Hacia adelante (red) o hacia atrás (pared).</li>
              <li><strong>Horizontales:</strong> Paralelos a la red. Para cubrir los costados y cerrar la red.</li>
            </ul>
          </div>
        </div>

        <!-- CATEGORÍAS POR GOLPE -->
        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>🏆 Categorías por Golpe</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">

            <!-- TABS DE GOLPE -->
            <div class="manual-golpe-tabs">
              <button class="manual-golpe-tab active" onclick="mostrarGolpeManual('smash', this)">🏐 Smash</button>
              <button class="manual-golpe-tab" onclick="mostrarGolpeManual('volea', this)">🏸 Volea</button>
              <button class="manual-golpe-tab" onclick="mostrarGolpeManual('fondo', this)">🎯 Pegada de Fondo</button>
              <button class="manual-golpe-tab" onclick="mostrarGolpeManual('pared', this)">🧱 Salida de Pared</button>
            </div>

            <!-- SMASH -->
            <div id="manual-golpe-smash" class="manual-golpe-content active">
              ${generarCategoriaHTML('smash')}
            </div>

            <!-- VOLEA -->
            <div id="manual-golpe-volea" class="manual-golpe-content" style="display:none;">
              ${generarCategoriaHTML('volea')}
            </div>

            <!-- PEGADA DE FONDO -->
            <div id="manual-golpe-fondo" class="manual-golpe-content" style="display:none;">
              ${generarCategoriaHTML('fondo')}
            </div>

            <!-- SALIDA DE PARED -->
            <div id="manual-golpe-pared" class="manual-golpe-content" style="display:none;">
              ${generarCategoriaHTML('pared')}
            </div>

          </div>
        </div>

      </div>

      <style>
        .manual-wrapper { max-width: 900px; margin: 0 auto; padding: 16px; }
        .manual-hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 32px; border-radius: 16px; margin-bottom: 24px; text-align: center; }
        .manual-hero h1 { margin: 0 0 8px 0; font-size: 1.6rem; }
        .manual-subtitulo { margin: 0; color: #aac4ff; font-size: 0.9rem; }

        .manual-seccion { background: white; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eee; }
        .manual-seccion-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; cursor: pointer; background: #f8f9fa; transition: background 0.2s; }
        .manual-seccion-header:hover { background: #e9ecef; }
        .manual-seccion-header h2 { margin: 0; font-size: 1.1rem; }
        .manual-seccion-body { padding: 20px; border-top: 1px solid #eee; }
        .manual-seccion-body.collapsed { display: none; }

        .manual-highlight { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .manual-golpes-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .manual-golpe-chip { background: #e8f4fd; border: 2px solid #3498db; border-radius: 20px; padding: 6px 16px; font-weight: 600; font-size: 0.9rem; }

        .manual-cuant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }
        .manual-cuant-card { background: #f8f9fa; border-radius: 10px; padding: 16px; border-top: 4px solid #3498db; }
        .cuant-numero { width: 32px; height: 32px; background: #3498db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px; }
        .manual-cuant-card h4 { margin: 0 0 8px 0; font-size: 0.95rem; }
        .manual-cuant-card p { margin: 0; font-size: 0.85rem; color: #555; }

        .manual-zonas { display: flex; gap: 8px; margin-top: 12px; }
        .zona { flex: 1; padding: 12px; border-radius: 8px; text-align: center; font-size: 0.85rem; line-height: 1.4; }
        .zona-a { background: #fff3e0; border: 2px solid #ff9800; }
        .zona-b { background: #e8f5e9; border: 2px solid #4caf50; }
        .zona-c { background: #e3f2fd; border: 2px solid #2196f3; }

        .manual-par-box { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
        .par-box-item { background: #f8f9fa; border-radius: 10px; padding: 16px; border-left: 4px solid #9b59b6; }
        .par-badge { background: #9b59b6; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; display: inline-block; margin-bottom: 8px; }
        .par-box-item h4 { margin: 0 0 8px 0; font-size: 0.95rem; }
        .par-box-item p { margin: 0; font-size: 0.85rem; color: #555; }

        .manual-golpe-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .manual-golpe-tab { padding: 8px 16px; border: 2px solid #ddd; border-radius: 20px; background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .manual-golpe-tab.active, .manual-golpe-tab:hover { background: #2c3e50; color: white; border-color: #2c3e50; }

        .manual-cat-card { border-radius: 10px; margin-bottom: 12px; overflow: hidden; border: 1px solid #e0e0e0; }
        .manual-cat-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; transition: background 0.2s; }
        .manual-cat-header:hover { filter: brightness(0.95); }
        .manual-cat-body { padding: 16px; background: white; border-top: 1px solid #eee; display: none; }
        .manual-cat-body.open { display: block; }

        .cat-color-7 { background: #f8d7da; }
        .cat-color-6 { background: #fff3cd; }
        .cat-color-5 { background: #d1ecf1; }
        .cat-color-4 { background: #d4edda; }
        .cat-color-3 { background: #cce5ff; }
        .cat-color-2 { background: #e2d9f3; }

        .cat-titulo { font-weight: bold; font-size: 1rem; }
        .cat-subtitulo { font-size: 0.8rem; color: #555; margin-left: auto; }

        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cat-item h5 { margin: 0 0 4px 0; font-size: 0.85rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .cat-item p { margin: 0; font-size: 0.82rem; color: #444; line-height: 1.5; }
        .cat-par { background: #f8f9fa; border-radius: 8px; padding: 10px 12px; margin-top: 12px; border-left: 3px solid #6c757d; font-size: 0.83rem; color: #444; }
        .cat-par strong { color: #2c3e50; }

        @media (max-width: 600px) {
          .manual-zonas { flex-direction: column; }
          .manual-par-box { grid-template-columns: 1fr; }
          .cat-grid { grid-template-columns: 1fr; }
        }
      </style>
    `;
  }

  const MANUAL_CATEGORIAS = {
    smash: {
      nombre: 'Smash (Sobre Cabeza)',
      categorias: {
        7: {
          nombre: '7ª Categoría',
          aptitud: 'Pega plano. Muy ocasionalmente con sidespin, más por defecto que por efectividad.',
          direccion: 'No dirige volitivamente a dos paredes ni a pared de fondo.',
          velocidad: 'Sin variación. No tiene criterio para seleccionar el cambio de velocidad.',
          factor: 'Continuidad: cada 4 golpes erra 3.',
          par: 'Pega el smash generalmente plano, sin dirigir ni intentar sacarla. Velocidad casi siempre igual. Escasa actitud de desplazamiento vertical hacia la red después de impactar.'
        },
        6: {
          nombre: '6ª Categoría',
          aptitud: 'Pega con sidespin además de plano.',
          direccion: 'Intenta buscar dos paredes tanto plano como sidespin (sin lograrlo en alto porcentaje). Pega plano para traerla por pared de fondo (bajo porcentaje).',
          velocidad: 'Cambia velocidad solo por tipo de golpe. El sidespin es más lento que el plano. No siempre acierta la elección.',
          factor: 'Continuidad: cada 5 golpes 2 son malos. Los errores se dan al intentar cosas que puede imaginar pero no ejecutar.',
          par: 'Pega plano y con sidespin. Cambia velocidad por tipo de golpe. Su desplazamiento hacia la red es discontinuo y no siempre eficiente.'
        },
        5: {
          nombre: '5ª Categoría',
          aptitud: 'Impacta plano y con sidespin de un lado. Eventualmente busca sidespin contrario (resultado incierto).',
          direccion: 'Busca las dos paredes. Dirige a los alambres e intenta sacarla de la cancha (no con buenos resultados).',
          velocidad: 'Logra variación de velocidad con limitaciones, tanto con sidespin como plano.',
          factor: 'Continuidad: cada 6 golpes 2 son malos. Error por apurar la definición.',
          par: 'Puede impactar plano o sidespin con igual habilidad. Dirige a paredes, alambres, etc. Cambia velocidades con buena continuidad. Sus desplazamientos tienen dinámica pero no logra cierres rápidos y eficientes.'
        },
        4: {
          nombre: '4ª Categoría',
          aptitud: 'Pega con sidespin siempre del mismo lado, y también plano.',
          direccion: 'Conscientemente busca las paredes eligiendo según conveniencia. Intenta sacar la pelota. Con sidespin busca las dos paredes.',
          velocidad: 'Cambia velocidad por tipo de golpe (sidespin más lento). Cambia el impulso para traerla (plano).',
          factor: 'Continuidad: ante inseguridad elige continuar flojo asegurando el tanto. De 6 golpes erra 1.',
          par: 'Pega con sidespin o plano según conveniencia. Cambia velocidad por tipo. Busca dos paredes con sidespin y logra sacarla. Sus movimientos tienden a la red pero no eficientemente aún.'
        },
        3: {
          nombre: '3ª Categoría',
          aptitud: 'Impacta plano y con sidespin logrando con mucha eficiencia el resultado buscado.',
          direccion: 'Busca con facilidad las dos paredes eligiendo a voluntad cuál pegar primero. Dirige a alambres e intenta sacarla con éxito. Busca también el cuerpo del rival.',
          velocidad: 'Cambia velocidades indistintamente por golpe o por impulso, tanto plano como sidespin.',
          factor: 'Continuidad: gran salto. Es raro que erre un smash desde Zona II. De 7 golpes erra 1.',
          par: 'Impacta plano o sidespin de ambos lados. Dirige a ángulos buscados, dos paredes, alambre, cambiando velocidades. Desplazamientos mucho más dinámicos logrando cierre de red con gran eficiencia.'
        },
        2: {
          nombre: '2ª Categoría',
          aptitud: 'Pega plano y sidespin indistintamente de ambos lados con gran maestría. Pega tanto desde Zona II como Zona III con igual resultado.',
          direccion: 'Varía dirección a discreción sin dificultad. Saca por alambres o pared de fondo aún cuando la pelota no le queda cómoda. Busca con intención el cuerpo del rival.',
          velocidad: 'Cambia de velocidad según conveniencia siendo totalmente criterioso. Cuando impacta a traerla se destaca por la eficiencia. Al cambiar velocidad es un gran estratega.',
          factor: 'Continuidad: de 8 o 9 golpes a 1. No se arriesgan pelotas porque sí, siempre construye el tanto.',
          par: 'Gran estratega. Pega plano o sidespin según conveniencia desde Zona III. Construye el tanto para definir en el momento adecuado. Excelente lectura de juego. Sus desplazamientos verticales y horizontales son óptimos; superarlo con rasantes es muy difícil.'
        }
      }
    },
    volea: {
      nombre: 'Volea',
      categorias: {
        7: {
          nombre: '7ª Categoría',
          aptitud: 'Bloquea en Zona I tanto de drive como de revés. Puede intentar pegar plano de revés. Voleas con escasa profundidad y alto margen de error.',
          direccion: 'No posee capacidad de direccionamiento.',
          velocidad: 'La velocidad depende de la pelota que viene, no de la voluntad del jugador.',
          factor: 'Profundidad: prácticamente imposible que busque volitivamente la profundidad. Puede salir profunda o no. Characteristic: volea tanto desde Zona II como Zona I por deficiente lectura.',
          par: 'Volea de bloqueo sin direccionamiento ni manejo de velocidad. No maneja profundidad. Se queda parado o retrocede por carencia de desplazamiento.'
        },
        6: {
          nombre: '6ª Categoría',
          aptitud: 'Bloquea tanto de drive como de revés usando la fuerza del rival.',
          direccion: 'Intenta buscar los alambres como alternativa de complicación (no lo consigue en gran porcentaje). Con slice de revés suele buscar el medio. En volea alta la angula como si fuese smash.',
          velocidad: 'Intenta realizar cambios de velocidad frecuentemente pero sin resultados óptimos.',
          factor: 'Profundidad: busca conscientemente pelotas profundas pero no lo logra la mayoría de las veces.',
          par: 'Mayorita­riamente volea bloqueando. La volea alta la impacta plana. No mantiene posición, comienza a intentar cerrar horizontalmente la red sin lograrlo generalmente.'
        },
        5: {
          nombre: '5ª Categoría',
          aptitud: 'Impacta con slice tanto de drive como de revés cuando desee. El globo de volea se utiliza con fines de ataque (sin ser eficiente en la mayoría de los casos). La volea alta se pega con mucho slice.',
          direccion: 'Busca alambres e intenta pelotas profundas tanto de drive como de revés. En volea alta dirige al medio variando su velocidad.',
          velocidad: 'Comienza a utilizar cambios de velocidad tanto de drive como de revés (plano y slice).',
          factor: 'Profundidad: trata de que la pelota pique en Zona III pero no lo logra en gran mayoría.',
          par: 'Puede impactar con slice de drive y revés al igual que la volea alta. El globo se juega con finalidad de ganar la red en ataque. Busca angular a alambres, intenta cambiar velocidades. Desplazamiento vertical más rápido pero el horizontal no es adecuado para cerrar la red.'
        },
        4: {
          nombre: '4ª Categoría',
          aptitud: 'Bloquea solo cuando la pelota viene con gran velocidad y está a muy corta distancia. El globo de volea lo utiliza de forma defensiva. La volea alta en Zona II se impacta plano y con potencia.',
          direccion: 'Angula la pelota y busca los alambres. De revés impacta con slice buscando el medio. La volea alta la angula como un smash.',
          velocidad: 'Busca deliberadamente diferentes ángulos, cambiando la velocidad de impulso de la pelota.',
          factor: 'Profundidad: busca conscientemente pelotas profundas pero no lo logra en la totalidad de las veces.',
          par: 'Bloquea solo con potencia del rival. Globo de volea defensivo. Angula y busca alambres. Cambia velocidad según conveniencia. Utiliza desplazamientos verticales y horizontales con muy buen resultado.'
        },
        3: {
          nombre: '3ª Categoría',
          aptitud: 'Impacta con slice de drive y revés cuando desea. El globo de volea se utiliza con fines de ataque con buenos resultados. La volea alta es impactada con muy buen slice.',
          direccion: 'Pegando plano puede direccionar para que vuelva al mismo campo. Con slice dirige a ángulos y alambres. En volea alta la dirige en gran porcentaje al medio.',
          velocidad: 'Usa mucho el cambio de velocidad, jugando a voluntad la pelota corta con mucho slice. Tira corta a picar en Zona I.',
          factor: 'Profundidad: juega profundo tanto plano como slice, sobretodo slice. Un 50% pican en Zona III.',
          par: 'Impacta con slice de drive y revés igual que la volea alta. El globo en actitud firme de ataque. Busca angulares a alambres e incluso trae la pelota a su campo. Tira corta para picar en Zona I. Impacta buscando profundidad. Todo con desplazamientos vertical y horizontal rápidos y eficaces.'
        },
        2: {
          nombre: '2ª Categoría',
          aptitud: 'Pega plano y con slice tanto de drive como de revés sin dificultad alguna. Tanto desde Zona I como Zona II con la misma eficacia.',
          direccion: 'Habilidad y capacidad para direccionar tanto de revés como de drive hacia alambres, angularla o al cuerpo del rival.',
          velocidad: 'A voluntad del jugador teniendo en cuenta posición de sus rivales para ganar el tanto. Ejecuta drop con muy buenos resultados.',
          factor: 'Profundidad: de 8 o 9 golpes, 1 no es profundo.',
          par: 'No existe dificultad alguna al impactar, tanto de drive como de revés con slice o plano, desde Zona I o Zona II con igual eficiencia, incluso a traerla a su campo. Direcciona según conveniencia. La volea alta es de alta efectividad con slice y profundidad. Cierra de forma efectiva la red con movimientos horizontales y verticales.'
        }
      }
    },
    fondo: {
      nombre: 'Pegada de Fondo',
      categorias: {
        7: {
          nombre: '7ª Categoría',
          aptitud: 'Golpea plano de drive. Levanta en globo de revés. Algunos pueden pegar con slice de drive por deficiencia técnica.',
          direccion: 'Sin direccionamiento de drive ni de revés. Los tiros paralelos tienen alto porcentaje de error.',
          velocidad: 'Siempre fuerte con pocos cambios de velocidad, más por defecto que por voluntad.',
          factor: 'Error: grande, 4/1.',
          par: 'Pega plano y levanta de revés sin lugar definido. Siempre la misma velocidad, fuerte de drive. No realiza movimientos de posicionamiento hasta que se confirma que la pelota pasó a los rivales; entonces avanza sin llegar a la red.'
        },
        6: {
          nombre: '6ª Categoría',
          aptitud: 'Pega plano y fuerte de drive (da buenos resultados aún). En tránsito evolutivo comienza a usar slice de drive. De revés intenta levantar de globo por falta de dominio del golpe rasante.',
          direccion: 'Buen direccionamiento dentro de sus limitaciones. El globo casi siempre cruzado.',
          velocidad: 'Pega generalmente fuerte, no cambia la velocidad. Cuando tira rasante de revés le imprime menor velocidad por falta de habilidad.',
          factor: 'Error: sigue siendo alto, 3/1. Se apuran en la definición y pegan todas con igual potencia.',
          par: 'De drive plano, también con slice en menor proporción. De revés sigue levantando en globo; cuando intenta rasante lo hace de forma poco consistente. Acompaña el golpe con movimiento hacia la red solo cuando pasa la línea de ataque rival.'
        },
        5: {
          nombre: '5ª Categoría',
          aptitud: 'Tanto de drive como de revés impacta plano o con slice. Juega a media altura intentando cruzarla. Comienza a utilizar el paralelo.',
          direccion: 'Dirige con igual facilidad hacia cualquier dirección. Los globos cruzados o paralelos según la oportunidad.',
          velocidad: 'Imprime velocidad o "afloja" de acuerdo a lo más conveniente.',
          factor: 'Error: al poder manejar velocidades se reduce considerablemente. Cuando la devolución fue con mucha presión reduce la fuerza, logrando mayor seguridad. Cada 4/1.',
          par: 'Drive y revés plano o con slice. Comienza a manejar direccionamiento y velocidades en ambos lados. Ataca las pelotas aunque no hayan pasado la línea de ataque rival, lo que implica un cambio profundo en actitud y preparación física.'
        },
        4: {
          nombre: '4ª Categoría',
          aptitud: 'Impacta tanto de drive como de revés plano o slice. De revés tanto rasante como en globo.',
          direccion: 'Dirige paralelos, cruzados y al medio con buen direccionamiento. Los globos generalmente cruzados.',
          velocidad: 'Los realiza tanto de drive como de revés (plano o slice).',
          factor: 'Error: cada 6/1.',
          par: 'Pegan de drive o revés plano o slice con dirección y cambios de velocidad, con mayor habilidad de drive. Factor de error menor que la categoría anterior. Se posiciona después de ejecutar el golpe e incluso se adelanta para bloquear el smash. El sobrepique aún no lo direccionan. Solo va decididamente a la red cuando pasan definitivamente a los rivales.'
        },
        3: {
          nombre: '3ª Categoría',
          aptitud: 'Pega de drive o revés con slice o plano sin mayores dificultades.',
          direccion: 'Direcciona hacia laterales buscando alambres, al medio. Comienza a tirar pelotas muy rasantes para que el rival deba levantar. Globo a discreción, cruzado o paralelo, intentando que sea "llovido".',
          velocidad: 'Cambia a voluntad tanto de drive como de revés. Al medio fuerte y con potencia; a los laterales suave.',
          factor: 'Error: 7/1.',
          par: 'Impacta drive o revés plano o slice. Direcciona hacia cualquier lado según conveniencia. Imprime velocidades para complicar al rival. Una vez impactado avanza con movimientos verticales para contraatacar, también cuando tira suave a los laterales. Siempre tiende a ganar la red aún sin pasar a los rivales con un globo.'
        },
        2: {
          nombre: '2ª Categoría',
          aptitud: 'Pegan plano o slice tanto de drive como de revés siendo muy hábiles.',
          direccion: 'Direccionan hacia cualquier lado con igual maestría. Globo cruzado o paralelo a voluntad en forma "llovida" o al rincón. El sobrepique es totalmente direccionado.',
          velocidad: 'Fuerte cuando es necesario de ambos lados, incluso buscan el cuerpo del rival para que impacten incómodos. Suavidad hacia los laterales muy rasante para que el rival levante y así contraatacar.',
          factor: 'Error: disminuye de 8 o 9 a 1.',
          par: 'Pegan slice o plano de drive y revés con total habilidad. Direccionan a voluntad siempre para ganar el tanto. Imprimen cambios de velocidad para presionar desde atrás. Sus movimientos son siempre tendientes hacia la red para ganarla.'
        }
      }
    },
    pared: {
      nombre: 'Salida de Pared',
      categorias: {
        7: {
          nombre: '7ª Categoría',
          aptitud: 'Habitualmente levanta en globo tanto de drive como de revés. El volver contra pared de fondo se usa de forma abusiva y con resultado incierto.',
          direccion: 'No posee direccionamiento en drive, revés ni globo.',
          velocidad: 'No posee habilidad para cambiar velocidades. Siempre impacta fuerte.',
          factor: 'Levantadas: margen de error amplio por falta de habilidad y maestría.',
          par: 'Se abusa de globos de drive y de revés. De drive sale fuerte y plano. No se levantan pelotas exigidas. Sin movimientos de ataque después del golpe salvo que el rival deba salir de pared de fondo.'
        },
        6: {
          nombre: '6ª Categoría',
          aptitud: 'En drive se impacta plano y en revés se "acompaña" la pelota. Volver contra pared de fondo con factor de caída 5/2, permite pegarlo con mayor confianza.',
          direccion: 'De drive busca todas las direcciones; de revés básicamente el medio. Los globos se tratan de buscar cruzados. Contra pared sin direccionamiento.',
          velocidad: 'Comienza a variar la velocidad tanto de revés como de drive.',
          factor: 'Levantadas: comienza a levantar pelotas a muy baja altura, por lo general en globo o contra pared.',
          par: 'Juega de drive y revés. De revés acompaña la pelota generalmente al medio. El globo impactado cruzado; contra pared sin direccionamiento. Comienza a levantar pelotas a poca altura. No ataca si no superó al rival. Cuando lo supera se desplaza verticalmente a comienzo de Zona I.'
        },
        5: {
          nombre: '5ª Categoría',
          aptitud: 'De drive o revés sale de pared con slice. La salida contra pared de fondo se usa con frecuencia por poder lograr buen factor de caída (5/3).',
          direccion: 'Busca todas las direcciones con gran porcentaje de acierto. De revés cambia el ángulo. Aún no direcciona el contra pared.',
          velocidad: 'Cambia velocidad tanto de drive como de revés, pegando plano o con slice.',
          factor: 'Levantadas: levanta pelotas de baja altura tanto de drive como de revés. Usa el globo en este golpe.',
          par: 'Tanto de drive como de revés sale plano o con slice, hacia todas las direcciones y manejando la velocidad según la conveniencia. Factor de levantada bueno, saliendo con pelotas flojas hacia costados o al medio. Ataca pelotas no firmes ya sea globo o rasante, flojas o fuertes.'
        },
        4: {
          nombre: '4ª Categoría',
          aptitud: 'Ha adquirido el desarrollo necesario para impactar tanto de drive como de revés en forma rasante. Contra pared de fondo logra un factor de caída que permite pegar con gran confianza.',
          direccion: 'De drive busca todas las direcciones. De revés acentúa la pelota al medio. Los globos tanto cruzados como paralelos.',
          velocidad: 'Tanto de drive como de revés impacta fuerte y "aflojando" hacia costados o al medio.',
          factor: 'Levantadas: levanta pelotas a muy baja altura por lo general con globos o contra pared con buenos resultados.',
          par: 'Impacta de drive y revés con gran habilidad imprimiendo diferentes velocidades, direccionando a ángulos, alambres y medio. Comienza a levantar pelotas a baja altura direccionándolas cruzadas y paralelas. Intenta avanzar a Zona II luego de salir con globo o tiro rasante.'
        },
        3: {
          nombre: '3ª Categoría',
          aptitud: 'Impacta plano o con slice tanto de drive como de revés.',
          direccion: 'Tanto de drive como de revés muy buen direccionamiento, busca alambres, ángulos y el medio. Los globos paralelos y cruzados.',
          velocidad: 'Los realiza tanto de drive como de revés, logrando manejo del slice.',
          factor: 'Levantadas: los realiza a muy baja altura utilizando drive y revés, saliendo con globo o pelota rasante.',
          par: 'Impacta de drive y revés plano o slice. Direcciona sin dificultad a alambres, ángulos y medio. Imprime cambios de velocidad. Levanta pelotas a muy escasa altura. Luego de impactar intenta tomar la red con movimientos verticales para ganar el tanto.'
        },
        2: {
          nombre: '2ª Categoría',
          aptitud: 'Pega plano o con slice tanto de drive como de revés sin dificultad.',
          direccion: 'Direcciona sin dificultad a ángulos, alambres y medio en forma rasante. El globo es dirigido paralelo y cruzado en forma "llovida" dificultando su devolución.',
          velocidad: 'Los realiza según las circunstancias sin dificultad, tanto de drive como de revés. Al medio más fuerte; a los laterales suave; incluso busca el cuerpo del rival.',
          factor: 'Levantadas: levanta pelotas de muy baja altura saliendo sin problemas con tiros rasantes, globos cruzados o paralelos.',
          par: 'Impacta de drive y revés con gran habilidad. Plano o slice. Imprime velocidad según circunstancias y ubicación del rival. Levanta pelotas a muy escasa altura. Sus movimientos verticales son siempre tendientes a ganar la red.'
        }
      }
    }
  };

  function generarCategoriaHTML(golpeKey) {
    const golpe = MANUAL_CATEGORIAS[golpeKey];
    if (!golpe) return '<p>Sin datos</p>';

    const colores = { 7: 'cat-color-7', 6: 'cat-color-6', 5: 'cat-color-5', 4: 'cat-color-4', 3: 'cat-color-3', 2: 'cat-color-2' };
    const etiquetas = { 7: 'Principiante', 6: 'Básico', 5: 'Intermedio Bajo', 4: 'Intermedio', 3: 'Avanzado', 2: 'Elite' };

    let html = '';
    for (const [num, cat] of Object.entries(golpe.categorias)) {
      html += `
        <div class="manual-cat-card">
          <div class="manual-cat-header ${colores[num]}" onclick="this.nextElementSibling.classList.toggle('open')">
            <span class="cat-badge cat-${num}">${num}ª</span>
            <span class="cat-titulo">${cat.nombre}</span>
            <span class="cat-subtitulo">${etiquetas[num]} ▼</span>
          </div>
          <div class="manual-cat-body">
            <div class="cat-grid">
              <div class="cat-item">
                <h5>🎯 Aptitud de Golpe-Impacto</h5>
                <p>${cat.aptitud}</p>
              </div>
              <div class="cat-item">
                <h5>🧭 Capacidad de Direccionamiento</h5>
                <p>${cat.direccion}</p>
              </div>
              <div class="cat-item">
                <h5>⚡ Cambios de Velocidad</h5>
                <p>${cat.velocidad}</p>
              </div>
              <div class="cat-item">
                <h5>📊 Factor Específico</h5>
                <p>${cat.factor}</p>
              </div>
            </div>
            <div class="cat-par">
              <strong>Par completo (golpe + desplazamiento):</strong> ${cat.par}
            </div>
          </div>
        </div>
      `;
    }
    return html;
  }

  function toggleManualSeccion(header) {
    const body = header.nextElementSibling;
    body.classList.toggle('collapsed');
    const icon = header.querySelector('.toggle-icon');
    if (icon) icon.textContent = body.classList.contains('collapsed') ? '▶' : '▼';
  }

  function mostrarGolpeManual(golpeKey, btn) {
    document.querySelectorAll('.manual-golpe-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.manual-golpe-tab').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`manual-golpe-${golpeKey}`);
    if (target) target.style.display = 'block';
    btn.classList.add('active');
  }

  // ========== CORRECCIÓN #8: MODAL "MIS EVALUACIONES" PARA ALUMNOS ==========
  function configurarBotonMisEvaluaciones() {
    const esAlumno = !(window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    const btnMisEval = document.getElementById('btnMisEvaluaciones');
    if (btnMisEval) btnMisEval.style.display = esAlumno ? 'inline-block' : 'none';

    if (esAlumno && btnMisEval) {
      btnMisEval.addEventListener('click', async () => {
        if (!window.currentUser) return;
        const modal = document.getElementById('modalMisEvaluaciones');
        const lista = document.getElementById('misEvaluacionesLista');
        modal.style.display = 'flex';
        lista.innerHTML = 'Cargando...';
        try {
          const snapshot = await db.collection('evaluaciones')
            .where('uid', '==', window.currentUser.uid)
            .orderBy('fecha', 'desc')
            .limit(5)
            .get();
          if (snapshot.empty) {
            lista.innerHTML = '<p>No tenés evaluaciones guardadas.</p>';
            return;
          }
          let html = '<ul>';
          snapshot.docs.forEach(doc => {
            const eva = doc.data();
            html += `<li><strong>${eva.golpe}</strong> – ${eva.fechaLocal || 'Sin fecha'} – Promedio: ${calcularPromedioEvaluacion(eva.selecciones)}ª</li>`;
          });
          html += '</ul>';
          lista.innerHTML = html;
        } catch (err) {
          lista.innerHTML = `<p>Error: ${err.message}</p>`;
        }
      });
      document.getElementById('cerrarModalMisEval').addEventListener('click', () => {
        document.getElementById('modalMisEvaluaciones').style.display = 'none';
      });
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
        if (view === 'manual') prepararVistaManual();
      }
      configurarBotonMisEvaluaciones();
    } else {
      if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
    }
  };

  // Hacer accesibles globalmente las funciones del manual
  window.toggleManualSeccion = toggleManualSeccion;
  window.mostrarGolpeManual = mostrarGolpeManual;

  if (window.currentUser) window.initApp();
  else if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
});
