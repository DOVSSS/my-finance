import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRmRVB6IAwonTmMyZ08YibPmSRyVJqD3A",
  authDomain: "familytreasury-24376.firebaseapp.com",
  projectId: "familytreasury-24376",
  storageBucket: "familytreasury-24376.firebasestorage.app",
  messagingSenderId: "1060569127399",
  appId: "1:1060569127399:web:aa86ce303893dfb3654542"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


