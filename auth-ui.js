// ==================== AUTH-UI.JS ====================
// Manejo de autenticación y estado de sesión

window.currentUser     = null;
window.currentUserData = null;
window.evaluacionesCargadas = null; // cache global de evaluaciones

// ========== ESCUCHAR CAMBIOS DE SESIÓN ==========
auth.onAuthStateChanged(async (user) => {
  const overlay = document.getElementById('authOverlay');

  if (user) {
    window.currentUser = user;

    try {
      const doc = await db.collection('usuarios').doc(user.uid).get();
      if (doc.exists) {
        window.currentUserData = doc.data();
      } else {
        // Primera vez: crear perfil básico
        const perfil = {
          nombre: user.displayName || user.email.split('@')[0],
          email:  user.email,
          rol:    'alumno',
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('usuarios').doc(user.uid).set(perfil);
        window.currentUserData = perfil;
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
      window.currentUserData = { nombre: user.email, rol: 'alumno', email: user.email };
    }

    // Actualizar header
    const nameEl = document.getElementById('userNameDisplay');
    const rolEl  = document.getElementById('userRolDisplay');
    if (nameEl) nameEl.textContent = window.currentUserData.nombre;
    if (rolEl)  rolEl.textContent  = window.currentUserData.rol === 'profesor' ? '🔍 Profesor' : '👤 Alumno';

    // Pre-llenar nombre del jugador si es alumno
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput && window.currentUserData.rol === 'alumno') {
      playerNameInput.value = window.currentUserData.nombre;
    }

    // Ajustar interfaz según rol
    ajustarUIporRol(window.currentUserData.rol);

    // Ocultar overlay
    if (overlay) overlay.style.display = 'none';

  } else {
    // Sin sesión
    window.currentUser          = null;
    window.currentUserData      = null;
    window.evaluacionesCargadas = null;
    if (overlay) overlay.style.display = 'flex';
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
    if (btn) btn.disabled = true;
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    errorDiv.textContent = traducirError(err.code);
    if (btn) btn.disabled = false;
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
    if (btn) btn.disabled = true;
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('usuarios').doc(cred.user.uid).set({
      nombre,
      email,
      rol,
      fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    // onAuthStateChanged se dispara automáticamente y completa el flujo
  } catch (err) {
    errorDiv.textContent = traducirError(err.code);
    if (btn) btn.disabled = false;
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
  document.getElementById('loginForm').style.display    = 'none';
  document.getElementById('registerForm').style.display = 'flex';
  document.getElementById('authError').textContent      = '';
}

function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display    = 'flex';
  document.getElementById('authError').textContent      = '';
}

// ========== AJUSTAR UI POR ROL ==========
function ajustarUIporRol(rol) {
  const checkbox = document.getElementById('modoFiscalCheckbox');
  if (rol === 'profesor') {
    // Profesores arrancan en modo fiscal automáticamente
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
    }
  } else {
    // Alumnos no ven la tab de Alumnos (es para el profe)
    const tabAlumnos = document.querySelector('.tab[data-view="alumnos"]');
    if (tabAlumnos) tabAlumnos.style.display = 'none';
  }
}

// ========== TRADUCIR ERRORES FIREBASE ==========
function traducirError(code) {
  const errores = {
    'auth/user-not-found':        'No existe una cuenta con ese email.',
    'auth/wrong-password':        'Contraseña incorrecta.',
    'auth/invalid-credential':    'Email o contraseña incorrectos.',
    'auth/email-already-in-use':  'Ese email ya está registrado.',
    'auth/weak-password':         'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':         'El email no es válido.',
    'auth/too-many-requests':     'Demasiados intentos. Esperá unos minutos.',
    'auth/network-request-failed':'Sin conexión a internet.',
  };
  return errores[code] || 'Error inesperado. Intentá de nuevo.';
}

// Exponer funciones al HTML
window.loginUser    = loginUser;
window.registerUser = registerUser;
window.logoutUser   = logoutUser;
window.showRegister = showRegister;
window.showLogin    = showLogin;
