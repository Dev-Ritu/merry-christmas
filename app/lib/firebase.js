// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSVBk82e1XdhKMr_WkGwSz7Tp4z2kZU7Y",
  authDomain: "merry-christmas-3bf52.firebaseapp.com",
  projectId: "merry-christmas-3bf52",
  storageBucket: "merry-christmas-3bf52.firebasestorage.app",
  messagingSenderId: "302313269868",
  appId: "1:302313269868:web:3418024b6f95007d4d0649",
  measurementId: "G-H7J0M40FWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
// export const db = initializeFirestore(app, {
//   localCache: persistentLocalCache()
// });