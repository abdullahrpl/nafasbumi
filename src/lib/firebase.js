import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAmLz0qVf4GN0TdDO-G7XdOM7PJI_KaNwo",
    authDomain: "nafasbumi-7104f.firebaseapp.com",
    projectId: "nafasbumi-7104f",
    storageBucket: "nafasbumi-7104f.appspot.com",
    messagingSenderId: "640077220735",
    appId: "1:640077220735:web:d58d2ac6183651a090284a",
    measurementId: "G-EG13J7CKD4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
