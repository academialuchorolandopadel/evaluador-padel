// ==================== AUTH-UI.JS (Corregido – sin duplicaciones) ====================
document.addEventListener('DOMContentLoaded', () => {

    // Las referencias a auth y db ya son globales (window.auth, window.db)
    // No es necesario volver a declararlas

    const authOverlay = document.getElementById('authOverlay');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authError = document.getElementById('authError');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRolDisplay = document.getElementById('userRolDisplay');
    const modoBadge = document.getElementById('modoBadge');

    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');
    const btnLogout = document.getElementById('btnLogout');
    const btnShowRegister = document.getElementById('btnShowRegister');
    const btnShowLogin = document.getElementById('btnShowLogin');

    let currentUser = null;

    if (btnLogin) btnLogin.addEventListener('click', loginUser);
    if (btnRegister) btnRegister.addEventListener('click', registerUser);
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);
    if (btnShowRegister) btnShowRegister.addEventListener('click', showRegister);
    if (btnShowLogin) btnShowLogin.addEventListener('click', showLogin);

    // Escuchar cambios en el estado de autenticación
    auth.onAuthStateChanged(async (user) => {
        const body = document.body;

        if (user) {
            currentUser = user;
            window.currentUser = user;   // Para que app.js lo detecte

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
                    window.currentUserData = usuarioLocal;

                    if (userNameDisplay) userNameDisplay.textContent = usuarioLocal.nombre;
                    if (userRolDisplay) userRolDisplay.textContent = 
                        usuarioLocal.rol === 'profesor' ? 'Profesor' : 
                        usuarioLocal.rol === 'fiscal' ? 'Fiscal' : 'Alumno';

                    // Usar la función global definida en app.js (no duplicar)
                    if (typeof window.aplicarModoSegunRol === 'function') {
                        window.aplicarModoSegunRol(usuarioLocal.rol);
                    }
                    
                    body.classList.remove('sin-sesion');
                    
                    // Actualizar clases CSS
                    if (usuarioLocal.rol === 'profesor' || usuarioLocal.rol === 'fiscal') {
                        body.classList.add('modo-fiscal');
                        body.classList.remove('modo-alumno');
                    } else {
                        body.classList.add('modo-alumno');
                        body.classList.remove('modo-fiscal');
                    }

                    // Llamar a la función de configuración de interfaz según rol (global)
                    if (typeof window.configurarInterfazSegunRol === 'function') {
                        window.configurarInterfazSegunRol();
                    }

                    // Inicializar la app (renderizar vista actual)
                    if (typeof window.initApp === 'function') {
                        window.initApp();
                    }
                }
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
                // Usuario existe en Auth pero no en Firestore: crear documento básico
                const usuarioBasico = {
                    uid: user.uid,
                    email: user.email,
                    nombre: user.email.split('@')[0],
                    rol: 'alumno'
                };
                localStorage.setItem('userData', JSON.stringify(usuarioBasico));
                window.currentUserData = usuarioBasico;
                
                // Intentar crear el documento en Firestore para futuras veces
                try {
                    await db.collection('usuarios').doc(user.uid).set({
                        nombre: usuarioBasico.nombre,
                        email: usuarioBasico.email,
                        rol: 'alumno',
                        fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (e) { console.warn('No se pudo crear el documento de usuario:', e); }

                if (userNameDisplay) userNameDisplay.textContent = usuarioBasico.nombre;
                if (userRolDisplay) userRolDisplay.textContent = 'Alumno';
                
                if (typeof window.aplicarModoSegunRol === 'function') {
                    window.aplicarModoSegunRol('alumno');
                }
                body.classList.remove('sin-sesion');
                body.classList.add('modo-alumno');

                if (typeof window.configurarInterfazSegunRol === 'function') {
                    window.configurarInterfazSegunRol();
                }
                if (typeof window.initApp === 'function') {
                    window.initApp();
                }
            }
        } else {
            // Usuario no logueado
            currentUser = null;
            window.currentUser = null;
            window.currentUserData = null;
            localStorage.removeItem('userData');
            body.classList.add('sin-sesion');
            showLogin();
            
            // Opcional: limpiar la vista principal
            const golpeContent = document.getElementById('golpeContent');
            if (golpeContent) golpeContent.innerHTML = '<p style="padding:20px; text-align:center;">Iniciá sesión para comenzar a evaluar.</p>';
        }
    });

    async function loginUser() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            mostrarError('Por favor, completá todos los campos.');
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // El resto se maneja en onAuthStateChanged
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
        const rol = 'alumno';  // Siempre se registran como alumnos

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
            // El onAuthStateChanged se encargará de cargar los datos
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
            window.currentUser = null;
            window.currentUserData = null;
            // Limpiar caché del Service Worker si existe
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            // Recargar la página para resetear toda la interfaz
            window.location.href = window.location.href.split('?')[0] + '?nocache=' + Date.now();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            mostrarError('Error al cerrar sesión.');
        }
    }

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

    // Funciones auxiliares globales que puede usar app.js
    window.getUserData = () => {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    };
    window.isProfesor = () => {
        const userData = window.getUserData();
        return userData && (userData.rol === 'profesor' || userData.rol === 'fiscal');
    };
    window.isAlumno = () => {
        const userData = window.getUserData();
        return userData && userData.rol === 'alumno';
    };
});
