import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Competition from './pages/Competition';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import Qualification from './pages/Qualification';
import Teams from './pages/Teams';
import TeamRoom from './pages/TeamRoom';
import Profile from './pages/Profile';
import GlobalChat from './pages/GlobalChat';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-modex-light"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="competition" element={<Competition />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="judge"
            element={
              <ProtectedRoute roles={['JUDGE']}>
                <JudgeDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="qualification"
            element={
              <ProtectedRoute>
                <Qualification />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="team/:teamId/room"
            element={
              <ProtectedRoute>
                <TeamRoom />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="chat"
            element={
              <ProtectedRoute>
                <GlobalChat />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

