/* ====================================================================
   DIGITAL CLASSES - FIREBASE CONFIGURATION & INITIALIZATION
   ==================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  update, 
  remove, 
  child, 
  get,
  push,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSdTvqbCn-UMi2cUiyNPQN3UbKfqsfNoI",
  authDomain: "digital-classes-app-14235.firebaseapp.com",
  databaseURL: "https://digital-classes-app-14235-default-rtdb.firebaseio.com",
  projectId: "digital-classes-app-14235",
  storageBucket: "digital-classes-app-14235.firebasestorage.app",
  messagingSenderId: "889883419588",
  appId: "1:889883419588:web:0ae24d6da84740f127ba91",
  measurementId: "G-0B2V3DXV7G"
};

const app = initializeApp(firebaseConfig);

// App Check Safe Initialization
try {
  if (typeof initializeAppCheck === 'function' && window.location.hostname !== 'localhost') {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LeGfbktAAAAAJH1mQYnIlrviupgxfFNPO3AbRj1'),
      isTokenAutoRefreshEnabled: true
    });
  }
} catch (err) {
  console.warn("App Check bypass:", err);
}

const db = getDatabase(app);

// Messaging (FCM) - Safe init
let messaging = null;
try {
  if (typeof getMessaging === 'function') {
    messaging = getMessaging(app);
  }
} catch(e) {
  console.warn("FCM not available:", e);
}

// App Icons (Digital Classes)
const ICON_PORTAL = `https://raw.githubusercontent.com/Dev-AmmarAhmed/DIGITAL-CLASSES/a4a25f244fa56db83e669d00a5b3023296ab67a6/icon.png`;
const ICON_BOOK = ICON_PORTAL;
const ICON_TEACHER = ICON_PORTAL;
const ICON_ANALYTICS = ICON_PORTAL;

export {
  app,
  db,
  messaging,
  ref,
  onValue,
  set,
  update,
  remove,
  child,
  get,
  push,
  query,
  orderByChild,
  limitToLast,
  getToken,
  onMessage,
  ICON_PORTAL,
  ICON_BOOK,
  ICON_TEACHER,
  ICON_ANALYTICS
};
