// ====================================================================
// banco-ui.js — Pestaña "Banco de Ejercicios" (solo profesor/fiscal)
// Academia Lucho Rolando
//
// Lee/escribe en la colección Firestore "bancoEjercicios".
// La primera vez, siembra los ejercicios de BANCO_EJERCICIOS_BASE.
// ====================================================================

(function () {
  const dbBanco = firebase.firestore();

  // Mapa de nombres de golpe para títulos
  const NOMBRES_GOLPE = {
    smash: '🏐 Sobre Cabeza',
    volea: '🏸 Volea',
    pegadaFondo: '🎯 Pegada de Fondo',
    salidaPared: '🧱 Salida de Pared'
  };

  let bancoFiltroGolpe = 'smash';
  let bancoFiltroCategoria = 'todas';
  let bancoSembrado = false;

  // Esta función la llama app.js cuando se entra a la pestaña
  window.prepararVistaBanco = async function () {
    const esProfesor = (window.currentUserData?.rol === 'profesor' || window.currentUserData?.rol === 'fiscal');
    const container = document.getElementById('bancoView');
    if (!container) return;

    if (!esProfesor) {
      container.innerHTML = '<p style="padding:20px;text-align:center;">Esta sección es solo para profesores.</p>';
      return;
    }

    // Construir la interfaz una sola vez
    if (!window._bancoUIConstruida) {
      construirInterfazBanco(container);
      window._bancoUIConstruida = true;
    }

    await sembrarSiHaceFalta();
    await cargarYMostrarEjercicios();
  };

  function construirInterfazBanco(container) {
    container.innerHTML = `
      <div class="banco-header">
        <h2>🗂️ Banco de Ejercicios</h2>
        <p>Catálogo de ejercicios por golpe y categoría objetivo. Editá, agregá o quitá según tu experiencia en cancha.</p>
      </div>

      <div class="banco-filtros">
        <div class="banco-filtro-grupo">
          <label>Golpe</label>
          <select id="bancoGolpeSelect">
            <option value="smash">🏐 Sobre Cabeza</option>
            <option value="volea">🏸 Volea</option>
            <option value="pegadaFondo">🎯 Pegada de Fondo</option>
            <option value="salidaPared">🧱 Salida de Pared</option>
          </select>
        </div>
        <div class="banco-filtro-grupo">
          <label>Categoría objetivo</label>
          <select id="bancoCategoriaSelect">
            <option value="todas">Todas</option>
            <option value="6">6ª</option>
            <option value="5">5ª</option>
            <option value="4">4ª</option>
            <option value="3">3ª</option>
            <option value="2">2ª</option>
          </select>
        </div>
        <button id="bancoNuevoBtn" class="btn-primary">➕ Nuevo ejercicio</button>
      </div>

      <div id="bancoLista" class="banco-lista"></div>

      <!-- Modal de edición/creación -->
      <div id="bancoModal" class="banco-modal" style="display:none;">
        <div class="banco-modal-card">
          <h3 id="bancoModalTitulo">Nuevo ejercicio</h3>
          <input type="hidden" id="bancoEditId">
          <div class="form-group">
            <label for="bancoFormGolpe">Golpe</label>
            <select id="bancoFormGolpe">
              <option value="smash">🏐 Sobre Cabeza</option>
              <option value="volea">🏸 Volea</option>
              <option value="pegadaFondo">🎯 Pegada de Fondo</option>
              <option value="salidaPared">🧱 Salida de Pared</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bancoFormCategoria">Categoría objetivo</label>
            <select id="bancoFormCategoria">
              <option value="6">6ª</option>
              <option value="5">5ª</option>
              <option value="4">4ª</option>
              <option value="3">3ª</option>
              <option value="2">2ª</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bancoFormNombre">Nombre del ejercicio</label>
            <input type="text" id="bancoFormNombre" class="auth-input" placeholder="Ej: Buscar las dos paredes">
          </div>
          <div class="form-group">
            <label for="bancoFormCuant">Cuantificador que trabaja</label>
            <input type="text" id="bancoFormCuant" class="auth-input" placeholder="Ej: Direccionamiento">
          </div>
          <div class="form-group">
            <label for="bancoFormDesc">Descripción / consigna</label>
            <textarea id="bancoFormDesc" class="auth-input" style="min-height:70px;" placeholder="Cómo se ejecuta el ejercicio..."></textarea>
          </div>
          <div class="banco-form-fila">
            <div class="form-group">
              <label for="bancoFormSeries">Series</label>
              <input type="number" id="bancoFormSeries" class="auth-input" min="1" value="3">
            </div>
            <div class="form-group">
              <label for="bancoFormReps">Repeticiones</label>
              <input type="number" id="bancoFormReps" class="auth-input" min="1" value="10">
            </div>
          </div>
          <div class="form-group">
            <label for="bancoFormCriterio">Criterio de éxito</label>
            <input type="text" id="bancoFormCriterio" class="auth-input" placeholder="Ej: 7 de 10 a zona objetivo">
          </div>
          <div class="banco-modal-acciones">
            <button id="bancoGuardarBtn" class="btn-primary">💾 Guardar</button>
            <button id="bancoCancelarBtn" class="btn-secondary">Cancelar</button>
          </div>
          <div id="bancoFormMensaje" style="margin-top:8px;"></div>
        </div>
      </div>
    `;

    // Listeners de filtros
    document.getElementById('bancoGolpeSelect').addEventListener('change', (e) => {
      bancoFiltroGolpe = e.target.value;
      cargarYMostrarEjercicios();
    });
    document.getElementById('bancoCategoriaSelect').addEventListener('change', (e) => {
      bancoFiltroCategoria = e.target.value;
      cargarYMostrarEjercicios();
    });
    document.getElementById('bancoNuevoBtn').addEventListener('click', () => abrirModalNuevo());
    document.getElementById('bancoCancelarBtn').addEventListener('click', () => cerrarModal());
    document.getElementById('bancoGuardarBtn').addEventListener('click', () => guardarEjercicio());
  }

  // Siembra el banco base la primera vez (si la colección está vacía)
  async function sembrarSiHaceFalta() {
    if (bancoSembrado) return;
    try {
      const snap = await dbBanco.collection('bancoEjercicios').limit(1).get();
      if (!snap.empty) { bancoSembrado = true; return; }
      if (!window.BANCO_EJERCICIOS_BASE) { bancoSembrado = true; return; }

      const batch = dbBanco.batch();
      const base = window.BANCO_EJERCICIOS_BASE;
      for (const golpe of Object.keys(base)) {
        const categorias = base[golpe].categorias;
        for (const cat of Object.keys(categorias)) {
          categorias[cat].forEach(ej => {
            const ref = dbBanco.collection('bancoEjercicios').doc();
            batch.set(ref, {
              golpe: golpe,
              categoria: parseInt(cat),
              nombre: ej.nombre,
              cuantificador: ej.cuantificador || '',
              descripcion: ej.descripcion || '',
              series: ej.series || 3,
              repeticiones: ej.repeticiones || 10,
              criterioExito: ej.criterioExito || '',
              creadoPor: window.currentUser ? window.currentUser.uid : 'sistema',
              fecha: firebase.firestore.FieldValue.serverTimestamp()
            });
          });
        }
      }
      await batch.commit();
      bancoSembrado = true;
    } catch (err) {
      console.error('Error sembrando banco:', err);
      bancoSembrado = true; // no reintentar en bucle
    }
  }

  async function cargarYMostrarEjercicios() {
    const lista = document.getElementById('bancoLista');
    if (!lista) return;
    lista.innerHTML = '<div class="cargando-container"><div class="spinner"></div><p>Cargando ejercicios...</p></div>';
    try {
      let ref = dbBanco.collection('bancoEjercicios').where('golpe', '==', bancoFiltroGolpe);
      if (bancoFiltroCategoria !== 'todas') {
        ref = ref.where('categoria', '==', parseInt(bancoFiltroCategoria));
      }
      const snap = await ref.get();
      if (snap.empty) {
        lista.innerHTML = '<p style="padding:20px;text-align:center;color:#888;">No hay ejercicios para este filtro. Tocá "Nuevo ejercicio" para agregar el primero.</p>';
        return;
      }

      // Agrupar por categoría
      const porCat = {};
      snap.docs.forEach(doc => {
        const d = doc.data();
        const cat = d.categoria;
        if (!porCat[cat]) porCat[cat] = [];
        porCat[cat].push({ id: doc.id, ...d });
      });

      // Ordenar categorías de 6 a 2 (de menos a más nivel)
      const catsOrdenadas = Object.keys(porCat).map(Number).sort((a, b) => b - a);
      let html = '';
      catsOrdenadas.forEach(cat => {
        html += `<div class="banco-cat-grupo"><h3 class="banco-cat-titulo">Para alcanzar <span class="cat-badge cat-${cat}">${cat}ª</span></h3>`;
        porCat[cat].forEach(ej => {
          html += `
            <div class="banco-ejercicio">
              <div class="banco-ej-cabecera">
                <strong>${ej.nombre}</strong>
                ${ej.cuantificador ? `<span class="banco-cuant-tag">${ej.cuantificador}</span>` : ''}
              </div>
              <p class="banco-ej-desc">${ej.descripcion || ''}</p>
              <div class="banco-ej-datos">
                <span>📊 ${ej.series} series × ${ej.repeticiones} rep.</span>
                <span>✅ ${ej.criterioExito || 'Sin criterio'}</span>
              </div>
              <div class="banco-ej-acciones">
                <button class="btn-secondary btn-chico banco-editar" data-id="${ej.id}">✏️ Editar</button>
                <button class="btn-secondary btn-chico banco-eliminar" data-id="${ej.id}">🗑️ Eliminar</button>
              </div>
            </div>`;
        });
        html += `</div>`;
      });
      lista.innerHTML = html;

      // Listeners de editar/eliminar
      lista.querySelectorAll('.banco-editar').forEach(btn => {
        btn.addEventListener('click', () => abrirModalEditar(btn.dataset.id));
      });
      lista.querySelectorAll('.banco-eliminar').forEach(btn => {
        btn.addEventListener('click', () => eliminarEjercicio(btn.dataset.id));
      });
    } catch (err) {
      lista.innerHTML = `<p style="padding:20px;color:red;">Error al cargar: ${err.message}</p>`;
    }
  }

  function abrirModalNuevo() {
    document.getElementById('bancoModalTitulo').textContent = 'Nuevo ejercicio';
    document.getElementById('bancoEditId').value = '';
    document.getElementById('bancoFormGolpe').value = bancoFiltroGolpe;
    document.getElementById('bancoFormCategoria').value = bancoFiltroCategoria !== 'todas' ? bancoFiltroCategoria : '5';
    document.getElementById('bancoFormNombre').value = '';
    document.getElementById('bancoFormCuant').value = '';
    document.getElementById('bancoFormDesc').value = '';
    document.getElementById('bancoFormSeries').value = '3';
    document.getElementById('bancoFormReps').value = '10';
    document.getElementById('bancoFormCriterio').value = '';
    document.getElementById('bancoFormMensaje').innerHTML = '';
    document.getElementById('bancoModal').style.display = 'flex';
  }

  async function abrirModalEditar(id) {
    try {
      const doc = await dbBanco.collection('bancoEjercicios').doc(id).get();
      if (!doc.exists) return;
      const d = doc.data();
      document.getElementById('bancoModalTitulo').textContent = 'Editar ejercicio';
      document.getElementById('bancoEditId').value = id;
      document.getElementById('bancoFormGolpe').value = d.golpe;
      document.getElementById('bancoFormCategoria').value = d.categoria;
      document.getElementById('bancoFormNombre').value = d.nombre || '';
      document.getElementById('bancoFormCuant').value = d.cuantificador || '';
      document.getElementById('bancoFormDesc').value = d.descripcion || '';
      document.getElementById('bancoFormSeries').value = d.series || 3;
      document.getElementById('bancoFormReps').value = d.repeticiones || 10;
      document.getElementById('bancoFormCriterio').value = d.criterioExito || '';
      document.getElementById('bancoFormMensaje').innerHTML = '';
      document.getElementById('bancoModal').style.display = 'flex';
    } catch (err) {
      alert('Error al abrir el ejercicio: ' + err.message);
    }
  }

  function cerrarModal() {
    document.getElementById('bancoModal').style.display = 'none';
  }

  async function guardarEjercicio() {
    const id = document.getElementById('bancoEditId').value;
    const nombre = document.getElementById('bancoFormNombre').value.trim();
    const mensaje = document.getElementById('bancoFormMensaje');

    if (!nombre) {
      mensaje.innerHTML = '<p style="color:var(--rojo);">El nombre es obligatorio.</p>';
      return;
    }

    const datos = {
      golpe: document.getElementById('bancoFormGolpe').value,
      categoria: parseInt(document.getElementById('bancoFormCategoria').value),
      nombre: nombre,
      cuantificador: document.getElementById('bancoFormCuant').value.trim(),
      descripcion: document.getElementById('bancoFormDesc').value.trim(),
      series: parseInt(document.getElementById('bancoFormSeries').value) || 3,
      repeticiones: parseInt(document.getElementById('bancoFormReps').value) || 10,
      criterioExito: document.getElementById('bancoFormCriterio').value.trim(),
      actualizadoPor: window.currentUser ? window.currentUser.uid : 'desconocido',
      fecha: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      if (id) {
        await dbBanco.collection('bancoEjercicios').doc(id).update(datos);
      } else {
        datos.creadoPor = window.currentUser ? window.currentUser.uid : 'desconocido';
        await dbBanco.collection('bancoEjercicios').add(datos);
      }
      cerrarModal();
      // Ajustar filtros a lo recién guardado para que se vea
      bancoFiltroGolpe = datos.golpe;
      document.getElementById('bancoGolpeSelect').value = datos.golpe;
      await cargarYMostrarEjercicios();
    } catch (err) {
      mensaje.innerHTML = `<p style="color:var(--rojo);">Error al guardar: ${err.message}</p>`;
    }
  }

  async function eliminarEjercicio(id) {
    if (!confirm('¿Eliminar este ejercicio del banco?')) return;
    try {
      await dbBanco.collection('bancoEjercicios').doc(id).delete();
      await cargarYMostrarEjercicios();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }
})();
