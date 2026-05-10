// ==================== FIREBASE CONFIG ====================
// Reemplazá los valores con los de tu proyecto Firebase
// Dónde encontrarlos: Firebase Console → ⚙ Configuración → Tu app web

const firebaseConfig = {
  apiKey: "AIzaSyDwDKdpIabK15uolzjBxvjuppGK34cjbf0",
  authDomain: "academia-categorizacion.firebaseapp.com",
  projectId: "academia-categorizacion",
  storageBucket: "academia-categorizacion.firebasestorage.app",
  messagingSenderId: "18803469620",
  appId: "1:18803469620:web:2969b1dd6bc598b0370961"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias globales (disponibles para auth-ui.js y app.js)
const auth = firebase.auth();
const db   = firebase.firestore();

// Persistencia offline – permite usar la app sin internet (PWA)
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => console.warn('Persistencia offline no disponible:', err.code));

window.auth = auth;
window.db   = db;
