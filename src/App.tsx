/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { PdfCourses } from './pages/PdfCourses';
import { PdfCourseDetail } from './pages/PdfCourseDetail';
import { ContactUs } from './pages/ContactUs';
import { HelpCenter } from './pages/HelpCenter';
import { FAQ } from './pages/FAQ';
import { RefundPolicy } from './pages/RefundPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AboutUs } from './pages/AboutUs';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Student Pages
import { Dashboard } from './pages/Dashboard';
import { MyCourses } from './pages/MyCourses';
import { MyPdfCourses } from './pages/MyPdfCourses';
import { CoursePlayer } from './pages/CoursePlayer';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminAddCourse } from './pages/admin/AdminAddCourse';
import { AdminPdfCourses } from './pages/admin/AdminPdfCourses';
import { AdminAddPdfCourse } from './pages/admin/AdminAddPdfCourse';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminOrders } from './pages/admin/AdminOrders';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookOpen } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
    <BookOpen className="h-12 w-12 text-indigo-600 animate-pulse mb-4" />
    <div className="text-white">Loading...</div>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !profile) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
  }

  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="pdf-courses" element={<PdfCourses />} />
            <Route path="pdf-courses/:id" element={<PdfCourseDetail />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="help-center" element={<HelpCenter />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="refund" element={<RefundPolicy />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="pricing" element={<Pricing />} />
          </Route>

          {/* Auth Routes (No layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Course Player (Custom layout built-in) */}
          <Route 
            path="/learn/:courseId" 
            element={
              <ProtectedRoute>
                <CoursePlayer />
              </ProtectedRoute>
            } 
          />

          {/* Student Dashboard Routes */}
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/my-pdf-courses" element={<MyPdfCourses />} />
            <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
            <Route path="/orders" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route 
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/new" element={<AdminAddCourse />} />
            <Route path="pdf-courses" element={<AdminPdfCourses />} />
            <Route path="pdf-courses/new" element={<AdminAddPdfCourse />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<Navigate to="/admin" replace />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
