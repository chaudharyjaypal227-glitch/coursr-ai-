import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { isSystemAdminEmail } from '../../contexts/AuthContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const isSystemAdmin = isSystemAdminEmail(userCredential.user.email || email);
      
      // Check if user is admin in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      const hasAdminRole = userDoc.exists() && userDoc.data().role === 'admin';

      if (isSystemAdmin || hasAdminRole) {
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          try {
            await setDoc(userRef, {
              name: userCredential.user.displayName || 'Administrator',
              email: userCredential.user.email || email.trim(),
              role: 'admin',
              createdAt: new Date().toISOString(),
              status: 'active',
              purchasedCourses: 0,
            }, { merge: true });
          } catch (profileErr) {
            console.warn('Could not sync admin role to Firestore:', profileErr);
          }
        }
        navigate('/admin');
      } else {
        await auth.signOut();
        setError('Access denied: You are not an administrator.');
      }
    } catch (error: any) {
      console.error("FIREBASE AUTH ERROR:", error);
      console.error("AUTH ERROR CODE:", error?.code);
      console.error("AUTH ERROR MESSAGE:", error?.message);

      if (error?.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not allowed for this Firebase project (auth/operation-not-allowed).');
      } else if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
        setError('Invalid admin email or password.');
      } else if (error?.code === 'auth/user-not-found') {
        setError('No administrator account found with this email.');
      } else {
        setError(error?.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-2xl">
            <ShieldCheck className="h-7 w-7 text-indigo-500" />
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to manage CourseAI platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg">{error}</div>}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Admin Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in to Admin Dashboard'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
