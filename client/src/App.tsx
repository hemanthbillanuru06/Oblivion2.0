import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';

// Common Components
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

// Public Pages
import { HomePage } from './pages/public/HomePage.js';
import { MarketplacePage } from './pages/public/MarketplacePage.js';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage.js';
import { ResourcesPage } from './pages/public/ResourcesPage.js';
import { VerifyCertificatePage } from './pages/public/VerifyCertificatePage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { ContactPage } from './pages/public/ContactPage.js';
import { BecomeInstructorPage } from './pages/public/BecomeInstructorPage.js';
import { TermsPage, PrivacyPage } from './pages/public/TermsPrivacyPages.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { MyCoursesPage } from './pages/student/MyCoursesPage.js';
import { LearningPlayerPage } from './pages/student/LearningPlayerPage.js';
import { StudentCertificatesPage } from './pages/student/StudentCertificatesPage.js';
import { PurchaseHistoryPage } from './pages/student/PurchaseHistoryPage.js';
import { ProfilePage } from './pages/student/ProfilePage.js';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard.js';
import { InstructorCoursesPage } from './pages/instructor/InstructorCoursesPage.js';
import { CreateCoursePage } from './pages/instructor/CreateCoursePage.js';
import { StudentManagementPage } from './pages/instructor/StudentManagementPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { UserManagementPage } from './pages/admin/UserManagementPage.js';
import { CourseModerationPage } from './pages/admin/CourseModerationPage.js';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.js';

// Fallbacks
import { NotFoundPage, UnauthorizedPage } from './pages/shared/NotFoundPage.js';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide Navbar/Footer inside the fullscreen learning player
  const isLearningPlayer = location.pathname.startsWith('/learning/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!isLearningPlayer && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isLearningPlayer && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<MarketplacePage />} />
            <Route path="/courses/:slug" element={<CourseDetailsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/certificates/verify" element={<VerifyCertificatePage />} />
            <Route path="/certificates/verify/:certificateId" element={<VerifyCertificatePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/become-instructor" element={<BecomeInstructorPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<LoginPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-courses"
              element={
                <ProtectedRoute>
                  <MyCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning/:courseId"
              element={
                <ProtectedRoute>
                  <LearningPlayerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificates"
              element={
                <ProtectedRoute>
                  <StudentCertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/purchases"
              element={
                <ProtectedRoute>
                  <PurchaseHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Instructor Protected Routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/create"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CreateCoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/students"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <StudentManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseModerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallbacks */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
