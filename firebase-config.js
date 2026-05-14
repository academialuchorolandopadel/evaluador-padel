// ==================== FIREBASE CONFIG (V8 Namespace) ====================
// Reemplazá los valores con los de tu proyecto Firebase si cambian
const firebaseConfig = {
  apiKey: "AIzaSyDwDKdpIabK15uolzjBxvjuppGK34cjbf0",
  authDomain: "academia-categorizacion.firebaseapp.com",
  projectId: "academia-categorizacion",
  storageBucket: "academia-categorizacion.firebasestorage.app",
  messagingSenderId: "18803469620",
  appId: "1:18803469620:web:2969b1dd6bc598b0370961"
};

// Inicializar Firebase (API namespace v8)
firebase.initializeApp(firebaseConfig);

// Referencias globales
window.auth = firebase.auth();
window.db   = firebase.firestore();
window.firebase = firebase;   // ← Necesario para usar serverTimestamp en app.js

// Persistencia offline con manejo de errores (múltiples pestañas)
window.db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Múltiples pestañas abiertas. La persistencia offline funciona solo en una.');
      // Opcional: mostrar un aviso al usuario
      const aviso = document.createElement('div');
      aviso.className = 'aviso-offline';
      aviso.textContent = '⚠️ Tienes varias pestañas abiertas. Cierra las demás para guardar datos offline.';
      aviso.style.cssText = 'position:fixed; bottom:10px; left:10px; background:#ff9800; color:#000; padding:8px 12px; border-radius:8px; z-index:9999; font-size:12px;';
      document.body.appendChild(aviso);
      setTimeout(() => aviso.remove(), 5000);
    } else if (err.code === 'unimplemented') {
      console.warn('El navegador no soporta persistencia offline.');
    }
  });
