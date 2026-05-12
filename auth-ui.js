// ==================== AUTH-UI.JS ====================
// Manejo de autenticación con Firebase y roles

// --- Referencias a elementos del DOM ---
const authOverlay = document.getElementById('authOverlay');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const regNombre = document.getElementById('regNombre');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regRol = document.getElementById('regRol');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRolDisplay = document.getElementById('userRolDisplay');

// --- Estado de autenticación ---
let currentUser = null;

// --- Firebase Auth (debe estar inicializado globalmente) ---
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
// 1. OBSERVADOR DE ESTADO DE AUTENTICACIÓN
// ============================================================
auth.onAuthStateChanged(async (user) => {
    const body = document.body;
    
    if (user) {
        // Usuario logueado
        currentUser = user;
        
        try {
            // Obtener datos del usuario desde Firestore
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Guardar datos en localStorage para usar en toda la app
                const usuarioLocal = {
                    uid: user.uid,
                    email: user.email,
                    nombre: userData.nombre || user.email,
                    rol: userData.rol || 'alumno'
                };
                localStorage.setItem('userData', JSON.stringify(usuarioLocal));
                
                // Mostrar datos en la interfaz
                if (userNameDisplay) {
                    userNameDisplay.textContent = usuarioLocal.nombre;
                }
                if (userRolDisplay) {
                    userRolDisplay.textContent = usuarioLocal.rol === 'profesor' ? 'Profesor' : 'Alumno';
                }
                
                // Aplicar modo visual según rol
                aplicarModoSegunRol(usuarioLocal.rol);
                
                // Mostrar la app y ocultar el overlay de login
                body.classList.remove('sin-sesion');
                
                // Si es profesor, activar modo fiscal permanentemente
                if (usuarioLocal.rol === 'profesor') {
                    body.classList.add('modo-fiscal');
                    body.classList.remove('modo-alumno');
                } else {
                    body.classList.add('modo-alumno');
                    body.classList.remove('modo-fiscal');
                }
                
                // Actualizar badge de modo
                actualizarBadgeModo(usuarioLocal.rol);
                
            } else {
                console.error('Documento de usuario no encontrado en Firestore');
                mostrarError('Error al cargar datos del perfil. Contactá al administrador.');
            }
            
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            // Si hay error, usar datos básicos
            const usuarioBasico = {
                uid: user.uid,
                email: user.email,
                nombre: user.email.split('@')[0],
                rol: 'alumno'
            };
            localStorage.setItem('userData', JSON.stringify(usuarioBasico));
            
            if (userNameDisplay) userNameDisplay.textContent = usuarioBasico.nombre;
            if (userRolDisplay) userRolDisplay.textContent = 'Alumno';
            
            aplicarModoSegunRol('alumno');
            body.classList.remove('sin-sesion');
            body.classList.add('modo-alumno');
            actualizarBadgeModo('alumno');
        }
        
    } else {
        // Usuario NO logueado
        currentUser = null;
        localStorage.removeItem('userData');
        
        // Mostrar overlay de login
        body.classList.add('sin-sesion');
        
        // Limpiar campos
        if (loginEmail) loginEmail.value = '';
        if (loginPassword) loginPassword.value = '';
        if (regNombre) regNombre.value = '';
        if (regEmail) regEmail.value = '';
        if (regPassword) regPassword.value = '';
        if (authError) authError.textContent = '';
        
        // Mostrar formulario de login por defecto
        showLogin();
    }
});

// ============================================================
// 2. FUNCIONES DE AUTENTICACIÓN
// ============================================================

// Iniciar sesión
async function loginUser() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) {
        mostrarError('Por favor, completá todos los campos.');
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Usuario logueado:', userCredential.user.email);
    } catch (error) {
        console.error('Error de login:', error);
        
        switch (error.code) {
            case 'auth/user-not-found':
                mostrarError('No existe una cuenta con este email.');
                break;
            case 'auth/wrong-password':
                mostrarError('Contraseña incorrecta.');
                break;
            case 'auth/invalid-email':
                mostrarError('El email no es válido.');
                break;
            case 'auth/too-many-requests':
                mostrarError('Demasiados intentos. Esperá unos minutos.');
                break;
            default:
                mostrarError('Error al iniciar sesión: ' + error.message);
        }
    }
}

// Registrar nuevo usuario
async function registerUser() {
    const nombre = regNombre.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    const rol = regRol.value;
    
    if (!nombre || !email || !password) {
        mostrarError('Por favor, completá todos los campos.');
        return;
    }
    
    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    try {
        // Crear usuario en Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Guardar datos adicionales en Firestore
        await db.collection('usuarios').doc(user.uid).set({
            nombre: nombre,
            email: email,
            rol: rol,
            fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
            ultimoAcceso: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Usuario registrado:', user.email);
        
    } catch (error) {
        console.error('Error de registro:', error);
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                mostrarError('Ya existe una cuenta con este email.');
                break;
            case 'auth/invalid-email':
                mostrarError('El email no es válido.');
                break;
            case 'auth/weak-password':
                mostrarError('La contraseña es muy débil.');
                break;
            default:
                mostrarError('Error al registrarse: ' + error.message);
        }
    }
}

// Cerrar sesión
async function logoutUser() {
    try {
        await auth.signOut();
        localStorage.removeItem('userData');
        currentUser = null;
        console.log('Sesión cerrada correctamente');
        
        // Recargar la página para reiniciar el estado
        window.location.reload();
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarError('Error al cerrar sesión.');
    }
}

// ============================================================
// 3. FUNCIONES DE UI
// ============================================================

function mostrarError(mensaje) {
    if (authError) {
        authError.textContent = mensaje;
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            authError.textContent = '';
        }, 5000);
    }
}

function showLogin() {
    if (loginForm) loginForm.style.display = 'flex';
    if (registerForm) registerForm.style.display = 'none';
    if (authError) authError.textContent = '';
}

function showRegister() {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'flex';
    if (authError) authError.textContent = '';
}

// ============================================================
// 4. MODO ALUMNO/PROFESOR
// ============================================================

function aplicarModoSegunRol(rol) {
    const body = document.body;
    
    if (rol === 'profesor') {
        body.classList.remove('modo-alumno');
        body.classList.add('modo-fiscal');
    } else {
        body.classList.remove('modo-fiscal');
        body.classList.add('modo-alumno');
    }
}

function actualizarBadgeModo(rol) {
    const modoBadge = document.getElementById('modoBadge');
    if (modoBadge) {
        if (rol === 'profesor') {
            modoBadge.textContent = 'Modo Profesor';
            modoBadge.style.background = 'rgba(200,150,62,0.3)';
            modoBadge.style.color = '#E0C78A';
        } else {
            modoBadge.textContent = 'Modo Alumno';
            modoBadge.style.background = 'rgba(200,150,62,0.2)';
            modoBadge.style.color = '#E0C78A';
        }
    }
}

// ============================================================
// 5. FUNCIONES AUXILIARES PARA OBTENER DATOS DEL USUARIO
// ============================================================

function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

function isProfesor() {
    const userData = getUserData();
    return userData && userData.rol === 'profesor';
}

function isAlumno() {
    const userData = getUserData();
    return userData && userData.rol === 'alumno';
}

function getCurrentUserId() {
    const userData = getUserData();
    return userData ? userData.uid : null;
}

function getCurrentUserName() {
    const userData = getUserData();
    return userData ? userData.nombre : 'Usuario';
}

// ============================================================
// 6. EXPORTACIÓN GLOBAL (por si se necesita desde consola)
// ============================================================
window.authHelpers = {
    loginUser,
    registerUser,
    logoutUser,
    showLogin,
    showRegister,
    mostrarError,
    getUserData,
    isProfesor,
    isAlumno,
    getCurrentUserId,
    getCurrentUserName
};
