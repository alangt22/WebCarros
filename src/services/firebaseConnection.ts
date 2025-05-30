import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBzQF--Aykx-dxaTqRBEA4slZfXXq-tUmI",
  authDomain: "webcarros-88455.firebaseapp.com",
  projectId: "webcarros-88455",
  storageBucket: "webcarros-88455.firebasestorage.app",
  messagingSenderId: "973432866211",
  appId: "1:973432866211:web:b064f1eb6f7e2e48638616"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };