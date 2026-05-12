// ==================== AUTH-UI.JS (Eventos automáticos) ====================
document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias a Firebase ---
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Elementos del DOM ---
    const authOverlay = document.getElementById('authOverlay');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authError = document.getElementById('authError');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRolDisplay = document.getElementById('userRolDisplay');
    const modoBadge = document.getElementById('modoBadge');

    // --- Botones ---
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');
    const btnLogout = document.getElementById('btnLogout');
    const btnShowRegister = document.getElementById('btnShowRegister');
    const btnShowLogin = document.getElementById('btnShowLogin');

    // --- Estado ---
    let currentUser = null;

    // ============================================================
    // 1. EVENTOS DE BOTONES
    // ============================================================
    if (btnLogin) btnLogin.addEventListener('click', loginUser);
    if (btnRegister) btnRegister.addEventListener('click', registerUser);
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);
    if (btnShowRegister) btnShowRegister.addEventListener('click', showRegister);
    if (btnShowLogin) btnShowLogin.addEventListener('click', showLogin);

    // ============================================================
    // 2. OBSERVADOR DE AUTENTICACIÓN
    // ============================================================
    auth.onAuthStateChanged(async (user) => {
        const body = document.body;

        if (user) {
            currentUser = user;

            try {
                const userDoc = await db.collection('usuarios').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const usuarioLocal = {
                        uid: user.uid,
                        email: user.email,
                        nombre: userData.nombre || user.email.split('@')[0],
                        rol: userData.rol || 'alumno'
                    };
                    localStorage.setItem('userData', JSON.stringify(usuarioLocal));

                    if (userNameDisplay) userNameDisplay.textContent = usuarioLocal.nombre;
                    if (userRolDisplay) userRolDisplay.textContent = usuarioLocal.rol === 'profesor' ? 'Profesor' : 'Alumno';

                    aplicarModoSegunRol(usuarioLocal.rol);
                    body.classList.remove('sin-sesion');

                    if (usuarioLocal.rol === 'profesor') {
                        body.classList.add('modo-fiscal');
                        body.classList.remove('modo-alumno');
                    } else {
                        body.classList.add('modo-alumno');
                        body.classList.remove('modo-fiscal');
                    }
                    actualizarBadgeModo(usuarioLocal.rol);
                }
            } catch (error) {
                console.error('Error al obtener datos:', error);
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
            currentUser = null;
            localStorage.removeItem('userData');
            body.classList.add('sin-sesion');
            showLogin();
        }
    });

    // ============================================================
    // 3. FUNCIONES DE AUTENTICACIÓN
    // ============================================================
    async function loginUser() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            mostrarError('Por favor, completá todos los campos.');
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Error de login:', error);
            switch (error.code) {
                case 'auth/user-not-found': mostrarError('No existe una cuenta con este email.'); break;
                case 'auth/wrong-password': mostrarError('Contraseña incorrecta.'); break;
                case 'auth/invalid-email': mostrarError('El email no es válido.'); break;
                case 'auth/too-many-requests': mostrarError('Demasiados intentos. Esperá unos minutos.'); break;
                default: mostrarError('Error al iniciar sesión: ' + error.message);
            }
        }
    }

    async function registerUser() {
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const rol = document.getElementById('regRol').value;

        if (!nombre || !email || !password) {
            mostrarError('Por favor, completá todos los campos.');
            return;
        }
        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await db.collection('usuarios').doc(user.uid).set({
                nombre: nombre,
                email: email,
                rol: rol,
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error de registro:', error);
            switch (error.code) {
                case 'auth/email-already-in-use': mostrarError('Ya existe una cuenta con este email.'); break;
                case 'auth/invalid-email': mostrarError('El email no es válido.'); break;
                case 'auth/weak-password': mostrarError('La contraseña es muy débil.'); break;
                default: mostrarError('Error al registrarse: ' + error.message);
            }
        }
    }

    async function logoutUser() {
        try {
            await auth.signOut();
            localStorage.removeItem('userData');
            currentUser = null;
            window.location.reload();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            mostrarError('Error al cerrar sesión.');
        }
    }

    // ============================================================
    // 4. UI
    // ============================================================
    function mostrarError(mensaje) {
        if (authError) {
            authError.textContent = mensaje;
            setTimeout(() => { authError.textContent = ''; }, 5000);
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
    // 5. MODO ALUMNO/PROFESOR
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
        if (modoBadge) {
            modoBadge.textContent = rol === 'profesor' ? 'Modo Profesor' : 'Modo Alumno';
        }
    }

    // Exportar funciones útiles globalmente
    window.getUserData = () => {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    };
    window.isProfesor = () => {
        const userData = window.getUserData();
        return userData && userData.rol === 'profesor';
    };
    window.isAlumno = () => {
        const userData = window.getUserData();
        return userData && userData.rol === 'alumno';
    };
});
