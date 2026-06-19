import { initializeApp } from "firebase/app";

import {
getAuth,
GoogleAuthProvider
}
from "firebase/auth";


import {
getFirestore
}
from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyBNwf093RsvTGUiSRCM7ZE5OXGljXWRPNY",
  authDomain: "project-tea-2d910.firebaseapp.com",
  projectId: "project-tea-2d910",
  storageBucket: "project-tea-2d910.firebasestorage.app",
  messagingSenderId: "238363177175",
  appId: "1:238363177175:web:cb7ec18b1c31ae96ee8092",
  measurementId: "G-V3GD1NNQHB"
};



const app =
initializeApp(firebaseConfig);



export const auth =
getAuth(app);



export const googleProvider =
new GoogleAuthProvider();



export const db =
getFirestore(app);