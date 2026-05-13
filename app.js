// ==================== APP.JS – VERSIÓN FIREBASE COMPLETA ====================
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

  // ========== MODO ALUMNO/PROFESOR ==========
  function aplicarModoSegunRol() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const rol = userData.rol || 'alumno';
    const modoBadge = document.getElementById('modoBadge');
    if (rol === 'profesor') {
      body.classList.remove('modo-alumno');
      body.classList.add('modo-fiscal');
      if (modoBadge) modoBadge.textContent = 'Modo Profesor';
    } else {
      body.classList.remove('modo-fiscal');
      body.classList.add('modo-alumno');
      if (modoBadge) modoBadge.textContent = 'Modo Alumno';
    }
  }
  aplicarModoSegunRol();

  function configurarInterfazSegunRol() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const rol = userData.rol || 'alumno';
    const tabsProfesor = document.querySelectorAll('.solo-profesor');
    const tabsAlumno = document.querySelectorAll('.solo-alumno');
    if (rol === 'profesor') {
      tabsProfesor.forEach(tab => tab.style.display = '');
      tabsAlumno.forEach(tab => tab.style.display = 'none');
    } else {
      tabsProfesor.forEach(tab => tab.style.display = 'none');
      tabsAlumno.forEach(tab => tab.style.display = '');
    }
  }
  configurarInterfazSegunRol();

  // ========== NAVEGACIÓN ==========
  mainNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      const view = e.target.dataset.view;
      mainNav.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(view + 'View').classList.add('active');
      if (view === 'historial')        cargarHistorial().catch(console.error);
      if (view === 'entrenamiento')    cargarAlumnosEnSelect().catch(console.error);
      if (view === 'alumnos')          cargarAlumnos().catch(console.error);
      if (view === 'seguimiento')      cargarAlumnosSeguimiento().catch(console.error);
      if (view === 'planificaciones')  cargarPlanificacionesAlumno().catch(console.error);
      if (view === 'nuevaPlanificacion') cargarAlumnosParaPlanificacion().catch(console.error);
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
      if (window.currentUserData?.rol === 'profesor') {
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
    const nombre = playerNameInput.value.trim() || window.currentUserData?.nombre || 'Sin nombre';
    const evaluacion = {
      uid: window.currentUser.uid, evaluadorUid: window.currentUser.uid,
      evaluadorNombre: window.currentUserData?.nombre || '',
      tipo: window.currentUserData?.rol === 'profesor' ? 'profesor' : 'autoevaluacion',
      jugador: nombre, golpe: golpeActual, selecciones: evaluacionesCache,
      fecha: firebase.firestore.FieldValue.serverTimestamp(), fechaLocal: new Date().toLocaleString()
    };
    try {
      await db.collection('evaluaciones').add(evaluacion);
      window.evaluacionesCargadas = null;
      alert('✅ Evaluación guardada correctamente.');
    } catch (err) { alert('❌ Error al guardar: ' + err.message); }
  }
// ========== HISTORIAL ==========
async function cargarHistorial() {
  historialLista.innerHTML = '<p>Cargando evaluaciones...</p>';
  const historial = await cargarEvaluacionesDesdeFirestore(true);
  historialLista.innerHTML = '';
  if (historial.length === 0) { historialLista.innerHTML = '<p>No hay evaluaciones guardadas.</p>'; return; }
  historial.forEach(eva => {
    const div = document.createElement('div');
    div.className = 'historial-item';
    const badge = eva.tipo === 'profesor' ? '<span class="badge-tipo profesor">🔍 Profesor</span>' : '<span class="badge-tipo alumno">👤 Alumno</span>';
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

// ========== ALUMNOS ==========
const alumnosLista = document.getElementById('alumnosLista');
async function cargarAlumnos() {
  alumnosLista.innerHTML = '<p>Cargando...</p>';
  const historial = await cargarEvaluacionesDesdeFirestore();
  if (historial.length === 0) { alumnosLista.innerHTML = '<p>No hay alumnos registrados.</p>'; return; }
  const alumnos = {};
  historial.forEach(eva => { if (!alumnos[eva.jugador]) alumnos[eva.jugador] = []; alumnos[eva.jugador].push(eva); });
  let html = '';
  for (const [nombre, evaluaciones] of Object.entries(alumnos)) {
    html += `<div class="alumno-card"><h3>${nombre}</h3><table><thead><tr><th>Golpe</th><th>Tipo</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>`;
    evaluaciones.forEach(eva => {
      const tipoBadge = eva.tipo === 'profesor' ? '🔍' : '👤';
      html += `<tr><td>${eva.golpe}</td><td>${tipoBadge}</td><td>${eva.fecha}</td><td><button class="btn-secondary btn-chico generar-plan-alumno" data-id="${eva.firestoreId}">📋 Plan</button><button class="btn-secondary btn-chico eliminar-eva-alumno" data-id="${eva.firestoreId}">🗑️</button></td></tr>`;
    });
    html += `</tbody></table></div>`;
  }
  alumnosLista.innerHTML = html;
}

alumnosLista.addEventListener('click', async (e) => {
  if (e.target.classList.contains('generar-plan-alumno')) {
    const id = e.target.dataset.id;
    const historial = window.evaluacionesCargadas || [];
    const eva = historial.find(item => item.firestoreId === id);
    if (eva) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('.tab[data-view="entrenamiento"]').classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById('entrenamientoView').classList.add('active');
      await cargarAlumnosEnSelect();
      const options = alumnoSelect.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].textContent.includes(eva.jugador) && options[i].textContent.includes(eva.golpe)) {
          alumnoSelect.selectedIndex = i; break;
        }
      }
    }
  } else if (e.target.classList.contains('eliminar-eva-alumno')) {
    const id = e.target.dataset.id;
    if (!confirm('¿Eliminar?')) return;
    try { await db.collection('evaluaciones').doc(id).delete(); window.evaluacionesCargadas = null; cargarAlumnos(); }
    catch (err) { alert('Error: ' + err.message); }
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

  async function cargarAlumnosSeguimiento() {
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
      sesionContent.innerHTML = '<p>✅ Ya alcanza la categoría objetivo.</p>';
      planSesion = null;
      guardarSesionBtn.style.display = 'none';
      return;
    }
    planSesion = { jugador: evaluacion.jugador, golpe: evaluacion.golpe, objetivo, ejercicios };
    ejerciciosCompletados = new Array(ejercicios.length).fill(false);
    let html = `<h3>Plan para ${evaluacion.jugador} (objetivo: ${objetivo}ª)</h3>`;
    ejercicios.forEach((ej, index) => {
      html += `<div class="sesion-ejercicio" id="ejercicio-${index}"><h4>${ej.nombreCuant} – ${ej.transicion.replace('_', 'ª → ')}ª</h4><p><em>${ej.ejercicio.nombre}</em></p><p>${ej.totalSeries} series x ${ej.totalRepsPorSerie} rep. | Criterio: ${ej.criterioExigido}</p><div class="sesion-campos"><label>Series:</label><input type="number" min="0" max="${ej.totalSeries}" value="0" data-index="${index}" data-campo="series"><label>Éxitos:</label><input type="number" min="0" max="${ej.totalSeries * ej.totalRepsPorSerie}" value="0" data-index="${index}" data-campo="exitosas"><button class="btn-primary btn-chico finalizar-ejercicio" data-index="${index}">✔ Finalizar</button></div></div>`;
    });
    sesionContent.innerHTML = html;
    guardarSesionBtn.style.display = 'inline-block';
    document.querySelectorAll('.finalizar-ejercicio').forEach(btn => {
      btn.addEventListener('click', (ev) => finalizarEjercicio(parseInt(ev.target.dataset.index)));
    });
    cargarHistorialSesiones().catch(console.error);
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
    if (!ejercicioDiv.querySelector('.completado-msg'))
      btn.insertAdjacentHTML('afterend', '<span class="completado-msg">✅ Completado</span>');
    ejerciciosCompletados[idx] = true;
    if (planSesion) {
      planSesion.ejercicios[idx].seriesRealizadas = parseInt(inputs[0].value) || 0;
      planSesion.ejercicios[idx].repeticionesExitosas = parseInt(inputs[1].value) || 0;
    }
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

  function mostrarResultadoSesion(plan) { /* ... misma lógica de resultado ... */ }

  async function cargarHistorialSesiones() { /* ... misma lógica de historial ... */ }

  // ========== PLANIFICACIONES ALUMNO ==========
async function cargarPlanificacionesAlumno() {
    const container = document.getElementById('planificacionesAlumno');
    if (!container) return;
    container.innerHTML = '<p>Cargando planificaciones...</p>';
    
    if (!window.currentUser) {
        container.innerHTML = '<p>Debés iniciar sesión.</p>';
        return;
    }
    
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const rol = userData.rol || 'alumno';
        
        let snapshot;
        if (rol === 'profesor') {
            snapshot = await db.collection('planificaciones')
                .where('profesorUid', '==', window.currentUser.uid)
                .orderBy('fecha', 'desc')
                .limit(50)
                .get();
        } else {
            snapshot = await db.collection('planificaciones')
                .where('alumnoUid', '==', window.currentUser.uid)
                .orderBy('fecha', 'desc')
                .limit(50)
                .get();
        }
        
        if (snapshot.empty) {
            container.innerHTML = rol === 'profesor' 
                ? '<p>No has creado ninguna planificación todavía.</p>' 
                : '<p>No tenés planificaciones asignadas todavía.</p>';
            return;
        }
        
        let html = '';
        snapshot.docs.forEach(doc => {
            const plan = doc.data();
            const planId = doc.id;
            const estadoClase = plan.estado === 'completada' ? 'completada' : 
                               plan.estado === 'repetir' ? 'repetir' : 'pendiente';
            const estadoTexto = plan.estado === 'completada' ? '✅ Completada' :
                               plan.estado === 'repetir' ? '🔄 Repetir' : '⏳ Pendiente';
            
            html += `
                <div class="planificacion-card" id="plan-card-${planId}">
                    <h3>${obtenerNombreGolpe(plan.golpe)} - Objetivo: ${plan.objetivo}ª</h3>
                    <p>Alumno: <strong>${plan.alumnoNombre || 'Sin nombre'}</strong></p>
                    <p>Asignado: ${plan.fechaLocal || ''}</p>
                    <span class="estado ${estadoClase}" id="estado-plan-${planId}">${estadoTexto}</span>
                    <span id="progreso-plan-${planId}" style="margin-left:10px;font-weight:600;">
                        ${plan.progreso ? `(${plan.progreso}%)` : ''}
                    </span>
                    <div style="margin-top:12px;">
                        <button class="btn-secondary btn-chico ver-plan-btn" data-planid="${planId}">📋 Ver ejercicios</button>
                        ${rol === 'profesor' && plan.estado !== 'completada' ? 
                            `<button class="btn-primary btn-chico calificar-plan-btn" data-planid="${planId}">⭐ Calificar</button>` : ''}
                    </div>
                    <div id="plan-content-${planId}" style="margin-top:12px; display:none;">
                        ${plan.contenidoHTML || '<p>Sin contenido.</p>'}
                    </div>
                    <!-- Sección de calificación (solo profesor) -->
                    ${rol === 'profesor' ? `
                        <div id="calificacion-${planId}" style="display:none; margin-top:16px; padding:16px; background:#f9f9f9; border-radius:8px;">
                            <h4>⭐ Calificar Ejercicios</h4>
                            <div id="ejercicios-calificar-${planId}"></div>
                            <button class="btn-primary guardar-calificacion-btn" data-planid="${planId}" style="margin-top:12px;">💾 Guardar Calificación</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
        
        // Eventos para mostrar/ocultar ejercicios
        document.querySelectorAll('.ver-plan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const planId = btn.dataset.planid;
                const content = document.getElementById(`plan-content-${planId}`);
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    btn.textContent = '🔼 Ocultar';
                } else {
                    content.style.display = 'none';
                    btn.textContent = '📋 Ver ejercicios';
                }
            });
        });
        
        // Eventos para calificar (solo profesor)
        document.querySelectorAll('.calificar-plan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const planId = btn.dataset.planid;
                const calificacionDiv = document.getElementById(`calificacion-${planId}`);
                const ejerciciosDiv = document.getElementById(`ejercicios-calificar-${planId}`);
                
                // Mostrar/ocultar sección de calificación
                if (calificacionDiv.style.display === 'none') {
                    calificacionDiv.style.display = 'block';
                    btn.textContent = '🔽 Ocultar calificación';
                    
                    // Cargar ejercicios de esta planificación
                    const plan = snapshot.docs.find(d => d.id === planId);
                    if (plan && plan.data().ejercicios) {
                        let ejerciciosHTML = '';
                        plan.data().ejercicios.forEach((ej, idx) => {
                            ejerciciosHTML += `
                                <div style="margin-bottom:12px; padding:8px; background:white; border-radius:6px; border:1px solid #ddd;">
                                    <strong>${ej.nombreCuant} - ${ej.transicion.replace('_', 'ª → ')}ª</strong>
                                    <p style="margin:4px 0; font-size:0.85rem; color:#666;">${ej.ejercicio.nombre}</p>
                                    <label>Porcentaje alcanzado:</label>
                                    <input type="number" min="0" max="100" value="${ej.calificacion || 0}" 
                                           class="calificacion-input" data-ejercicio="${idx}" data-planid="${planId}"
                                           style="width:80px; padding:4px; margin-left:8px;"> %
                                </div>
                            `;
                        });
                        ejerciciosDiv.innerHTML = ejerciciosHTML;
                    }
                } else {
                    calificacionDiv.style.display = 'none';
                    btn.textContent = '⭐ Calificar';
                }
            });
        });
        
        // Eventos para guardar calificación
        document.querySelectorAll('.guardar-calificacion-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const planId = btn.dataset.planid;
                const inputs = document.querySelectorAll(`.calificacion-input[data-planid="${planId}"]`);
                
                let suma = 0;
                let cantidad = 0;
                
                inputs.forEach(input => {
                    suma += parseInt(input.value) || 0;
                    cantidad++;
                });
                
                const promedio = cantidad > 0 ? Math.round(suma / cantidad) : 0;
                const nuevoEstado = promedio >= 80 ? 'completada' : 'repetir';
                
                try {
                    await db.collection('planificaciones').doc(planId).update({
                        estado: nuevoEstado,
                        progreso: promedio
                    });
                    
                    // Actualizar visualmente
                    const estadoSpan = document.getElementById(`estado-plan-${planId}`);
                    const progresoSpan = document.getElementById(`progreso-plan-${planId}`);
                    
                    if (estadoSpan) {
                        estadoSpan.textContent = nuevoEstado === 'completada' ? '✅ Completada' : '🔄 Repetir';
                        estadoSpan.className = `estado ${nuevoEstado}`;
                    }
                    if (progresoSpan) {
                        progresoSpan.textContent = `(${promedio}%)`;
                    }
                    
                    alert(`✅ Calificación guardada. Promedio: ${promedio}%. Estado: ${nuevoEstado}`);
                    
                } catch (err) {
                    alert('❌ Error al guardar: ' + err.message);
                }
            });
        });
        
    } catch (err) {
        container.innerHTML = `<p>Error al cargar: ${err.message}</p>`;
    }
}
  // ========== NUEVA PLANIFICACIÓN (PROFESOR) ==========
  const alumnoPlanSelect = document.getElementById('alumnoPlanSelect');
  const golpePlanSelect = document.getElementById('golpePlanSelect');
  const categoriaObjetivoPlan = document.getElementById('categoriaObjetivoPlan');
  const generarYGuardarPlanBtn = document.getElementById('generarYGuardarPlanBtn');
  const planGeneradoPreview = document.getElementById('planGeneradoPreview');
  const planMensaje = document.getElementById('planMensaje');
  let planificacionGenerada = null;

  async function cargarAlumnosParaPlanificacion() {
    const historial = await cargarEvaluacionesDesdeFirestore(true);
    alumnoPlanSelect.innerHTML = '<option value="">-- Seleccionar alumno --</option>';
    const nombresUnicos = [...new Set(historial.map(eva => eva.jugador))];
    nombresUnicos.sort().forEach(nombre => {
      const opt = document.createElement('option');
      opt.value = nombre;
      opt.textContent = `👤 ${nombre}`;
      alumnoPlanSelect.appendChild(opt);
    });
  }

  generarYGuardarPlanBtn.addEventListener('click', async () => {
    const alumnoNombre = alumnoPlanSelect.value;
    const golpe = golpePlanSelect.value;
    const objetivo = parseInt(categoriaObjetivoPlan.value);
    if (!alumnoNombre) return alert('⚠️ Seleccioná un alumno.');
    const historial = await cargarEvaluacionesDesdeFirestore(true);
    const evaluacionesAlumno = historial.filter(eva => eva.jugador === alumnoNombre && eva.golpe === golpe);
    if (evaluacionesAlumno.length === 0) {
      planMensaje.innerHTML = '<p style="color:var(--rojo);">⚠️ No hay evaluaciones para este golpe.</p>';
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
          alumnoUid: evaluacion.uid || '',
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
function obtenerNombreGolpe(golpeId) {
    const nombres = {
        smash: '🏐 Sobre Cabeza',
        volea: '🏸 Volea',
        pegadaFondo: '🎯 Pegada de Fondo',
        salidaPared: '🧱 Salida de Pared'
    };
    return nombres[golpeId] || golpeId;
}
  // ========== INICIALIZAR ==========
  renderizarGolpe('smash');
});
