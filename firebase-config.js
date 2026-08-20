// Portal RUFE · San Pedro
// Configuración de la Web App Firebase existente de Rendición de Cuentas.
// La apiKey web identifica la aplicación cliente; la seguridad real depende de Auth,
// Firestore Rules, Storage Rules y las Cloud Functions incluidas en este paquete.
window.RUFE_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD02YaIMxLO2IPAJYZdPY2cWUvpkZDRo2U',
  authDomain: 'rendicion-de-cuentas-6aceb.firebaseapp.com',
  projectId: 'rendicion-de-cuentas-6aceb',
  storageBucket: 'rendicion-de-cuentas-6aceb.firebasestorage.app',
  messagingSenderId: '509564686428',
  appId: '1:509564686428:web:4e1257b5305dd8b4c51699',
  measurementId: 'G-BQ6DLM4ENY',
  functionsRegion: 'us-central1',
  // Opcional en producción. Déjalo vacío hasta configurar reCAPTCHA Enterprise/App Check.
  appCheckSiteKey: ''
};
window.RUFE_EVENT_ID = 'san-pedro-sismo-2026';
