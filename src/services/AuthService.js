import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }

  /**
   * Sign up a new user with email and password
   */
  async signUp(email, password, username) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, {
        displayName: username
      });

      // Store user info in localStorage
      localStorage.setItem(`codeflux_user_${user.uid}`, JSON.stringify({
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }));

      return { success: true, user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Sign in existing user with email and password
   */
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in localStorage
      const userInfo = JSON.parse(localStorage.getItem(`codeflux_user_${userCredential.user.uid}`) || '{}');
      userInfo.lastLogin = new Date().toISOString();
      localStorage.setItem(`codeflux_user_${userCredential.user.uid}`, JSON.stringify(userInfo));

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user info exists in localStorage, if not create it
      const existingUser = localStorage.getItem(`codeflux_user_${user.uid}`);
      if (!existingUser) {
        localStorage.setItem(`codeflux_user_${user.uid}`, JSON.stringify({
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          provider: 'google'
        }));
      } else {
        // Update last login
        const userInfo = JSON.parse(existingUser);
        userInfo.lastLogin = new Date().toISOString();
        localStorage.setItem(`codeflux_user_${user.uid}`, JSON.stringify(userInfo));
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Sign out current user
   */
  async signOutUser() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Get user-friendly error messages
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/popup-closed-by-user': 'Sign-in popup was closed',
      'auth/cancelled-popup-request': 'Sign-in was cancelled'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again';
  }
}

export default new AuthService();
