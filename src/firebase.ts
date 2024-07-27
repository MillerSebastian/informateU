// Importa las funciones necesarias de Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  addDoc,
  collection,
  Timestamp,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Configuración de tu aplicación Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyDBLOiWa6WjTQHODO8ey1fH6fwUd_OeajI",
//   authDomain: "informateu-299a4.firebaseapp.com",
//   projectId: "informateu-299a4",
//   storageBucket: "informateu-299a4.appspot.com",
//   messagingSenderId: "771396794946",
//   appId: "1:771396794946:web:0e5ba47534505edf92cbdb",
//   measurementId: "G-0BHQ4G2KWC",
// };

const firebaseConfig = {
  apiKey: "AIzaSyBgU1iJIRrw7Cky8vuvf9AjqMUAr7KQxZo",
  authDomain: "informate-ce6c7.firebaseapp.com",
  projectId: "informate-ce6c7",
  storageBucket: "informate-ce6c7.appspot.com",
  messagingSenderId: "1061422497276",
  appId: "1:1061422497276:web:1f62a88c11440a42948679",
};

// Inicializa tu aplicación Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Analytics (opcional)
const db = getFirestore(app); // Firestore
const auth = getAuth(app); // Authentication
const storage = getStorage(app); // Firebase Storage

// Exporta todos los objetos para usarlos en tu aplicación
export {
  app,
  analytics,
  db,
  auth,
  storage,
  addDoc,
  collection,
  Timestamp,
  getStorage,
  getDownloadURL,
  ref,
  uploadBytes,
  updateDoc,
  doc,
  getDocs,
};
