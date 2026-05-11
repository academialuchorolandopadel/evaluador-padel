// ==================== AUTH-UI.JS ====================
window.currentUser     = null;
window.currentUserData = null;
window.evaluacionesCargadas = null;

function mostrarApp() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.add('oculto');
  document.body.classList.remove('sin-sesion');
}

function ocultarApp() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.remove('oculto');
  document.body.classList.add('sin-sesion');
}

// ========== ESCUCHAR CAMBIOS DE SESIÓN ==========
auth.onAuthStateChanged(async (user) => {

  if (user) {
    window.currentUser = user;

    // Perfil por defecto por si falla Firestore
    window.currentUserData = {
      nombre: user.displayName || user.email.split('@')[0],
      email:  user.email,
      rol:    'alumno'
    };

    // Intentar cargar perfil desde Firestore
    try {
      const doc = await db.collection('usuarios').doc(user.uid).get();
      if (doc.exists) {
        window.currentUserData = { ...window.currentUserData, ...doc.data() };
      } else {
        // Primera vez: crear perfil
        await db.collection('usuarios').doc(user.uid).set({
          nombre: window.currentUserData.nombre,
          email:  user.email,
          rol:    'alumno',
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('No se pudo cargar perfil de Firestore:', err.message);
      // Continúa igual con el perfil por defecto
    }

    // Actualizar header con nombre y rol
    const nameEl = document.getElementById('userNameDisplay');
    const rolEl  = document.getElementById('userRolDisplay');
    if (nameEl) nameEl.textContent = window.currentUserData.nombre;
    if (rolEl)  rolEl.textContent  = window.currentUserData.rol === 'profesor' ? '🔍 Profesor' : '👤 Alumno';

    // Pre-llenar nombre en evaluación
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput && window.currentUserData.rol === 'alumno') {
      playerNameInput.value = window.currentUserData.nombre;
    }

    // Ajustar UI según rol
    ajustarUIporRol(window.currentUserData.rol);

    // MOSTRAR LA APP
    mostrarApp();

  } else {
    window.currentUser          = null;
    window.currentUserData      = null;
    window.evaluacionesCargadas = null;

    // OCULTAR LA APP
    ocultarApp();

    // Limpiar formularios
    const loginEmail    = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    if (loginEmail)    loginEmail.value    = '';
    if (loginPassword) loginPassword.value = '';
    document.getElementById('authError').textContent = '';

    // Asegurarse de mostrar el form de login
    showLogin();
  }
});

// ========== LOGIN ==========
async function loginUser() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('authError');
  const btn      = document.querySelector('#loginForm .auth-btn');

  if (!email || !password) {
    errorDiv.textContent = 'Completá email y contraseña.';
    return;
  }

  try {
    errorDiv.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Ingresando...'; }
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged se dispara y llama a mostrarApp()
  } catch (err) {
    errorDiv.textContent = traducirError(err.code);
    if (btn) { btn.disabled = false; btn.textContent = 'Ingresar'; }
  }
}

// ========== REGISTRO ==========
async function registerUser() {
  const nombre   = document.getElementById('regNombre').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const rol      = document.getElementById('regRol').value;
  const errorDiv = document.getElementById('authError');
  const btn      = document.querySelector('#registerForm .auth-btn');

  if (!nombre || !email || !password) {
    errorDiv.textContent = 'Completá todos los campos.';
    return;
  }
  if (password.length < 6) {
    errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  try {
    errorDiv.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Creando cuenta...'; }
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    // Guardar perfil con el rol correcto
    window.currentUserData = { nombre, email, rol };
    await db.collection('usuarios').doc(cred.user.uid).set({
      nombre, email, rol,
      fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    // onAuthStateChanged se dispara automáticamente
  } catch (err) {
    errorDiv.textContent = traducirError(err.code);
    if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }
  }
}

// ========== LOGOUT ==========
function logoutUser() {
  if (confirm('¿Cerrar sesión?')) {
    window.evaluacionesCargadas = null;
    auth.signOut();
  }
}

// ========== TOGGLE FORMULARIOS ==========
function showRegister() {
  const lf = document.getElementById('loginForm');
  const rf = document.getElementById('registerForm');
  if (lf) lf.style.display = 'none';
  if (rf) rf.style.display = 'flex';
  const errorDiv = document.getElementById('authError');
  if (errorDiv) errorDiv.textContent = '';
}

function showLogin() {
  const lf = document.getElementById('loginForm');
  const rf = document.getElementById('registerForm');
  if (rf) rf.style.display = 'none';
  if (lf) lf.style.display = 'flex';
  const errorDiv = document.getElementById('authError');
  if (errorDiv) errorDiv.textContent = '';
}

// ========== AJUSTAR UI POR ROL ==========
function ajustarUIporRol(rol) {
  const checkbox   = document.getElementById('modoFiscalCheckbox');
  const tabAlumnos = document.querySelector('.tab[data-view="alumnos"]');

  if (rol === 'profesor') {
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
    }
  } else {
    // Alumnos no ven la tab de Alumnos
    if (tabAlumnos) tabAlumnos.style.display = 'none';
  }
}

// ========== TRADUCIR ERRORES FIREBASE ==========
function traducirError(code) {
  const errores = {
    'auth/user-not-found':         'No existe una cuenta con ese email.',
    'auth/wrong-password':         'Contraseña incorrecta.',
    'auth/invalid-credential':     'Email o contraseña incorrectos.',
    'auth/email-already-in-use':   'Ese email ya está registrado.',
    'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':          'El email no es válido.',
    'auth/too-many-requests':      'Demasiados intentos. Esperá unos minutos.',
    'auth/network-request-failed': 'Sin conexión a internet.',
  };
  return errores[code] || `Error: ${code}`;
}

window.loginUser    = loginUser;
window.registerUser = registerUser;
window.logoutUser   = logoutUser;
window.showRegister = showRegister;
window.showLogin    = showLogin;
