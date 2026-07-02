import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyAcvCGZZdyTR-Z_pI1NaGi3s_fYkOrubrM",
  authDomain: "codeflux-93c41.firebaseapp.com",
  projectId: "codeflux-93c41",
  storageBucket: "codeflux-93c41.firebasestorage.app",
  messagingSenderId: "581575696432",
  appId: "1:581575696432:web:055650b03a64c1c42e4df5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
