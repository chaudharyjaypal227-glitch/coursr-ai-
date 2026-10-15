import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

export const isSystemAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'chaudharyjaypal227@gmail.com' || clean === 'admin@courseai.com';
};

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        console.log("CURRENT USER:", {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified
        });

        const isAdmin = isSystemAdminEmail(firebaseUser.email);
        console.log("ADMIN CHECK (AuthContext):", {
          email: firebaseUser.email,
          isAdminEmail: isAdmin
        });

        try {
          // Fetch or create user profile in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            // If the user email is a system admin, ensure the Firestore document role reflects 'admin'
            if (isAdmin && data.role !== 'admin') {
              try {
                await updateDoc(userRef, { role: 'admin', email: firebaseUser.email || '' });
                data.role = 'admin';
                console.log("ADMIN RECORD UPDATED: users/" + firebaseUser.uid + " set to role: 'admin'");
              } catch (updateErr) {
                console.warn('Could not update role to admin in Firestore users/' + firebaseUser.uid + ':', updateErr);
              }
            } else if (isAdmin) {
              console.log("ADMIN RECORD VERIFIED: users/" + firebaseUser.uid + " is admin");
            }
            setProfile({ id: userSnap.id, ...data } as User);
          } else {
            // Create basic profile if it doesn't exist
            const newProfile: Partial<User> = {
              name: firebaseUser.displayName || (isAdmin ? 'Admin' : 'User'),
              email: firebaseUser.email || '',
              role: isAdmin ? 'admin' : 'student',
              photoURL: firebaseUser.photoURL || '',
              createdAt: new Date().toISOString(),
              status: 'active',
              purchasedCourses: 0,
            };
            try {
              await setDoc(userRef, newProfile);
              console.log("ADMIN RECORD CREATED: users/" + firebaseUser.uid, newProfile);
            } catch (err) {
              console.warn('Could not save user profile to Firestore users/' + firebaseUser.uid + ':', err);
            }
            setProfile({ id: firebaseUser.uid, ...newProfile } as User);
          }
        } catch (err) {
          console.warn('Error reading user profile from Firestore:', err);
          // Fallback profile from firebaseUser auth token so UI doesn't break
          setProfile({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: isAdmin ? 'admin' : 'student',
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
            status: 'active',
            purchasedCourses: 0,
          } as User);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
