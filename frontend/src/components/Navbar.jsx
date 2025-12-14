import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Home, Trophy, Users, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-modex-dark text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">MODEX</div>
            <span className="text-modex-teal">Academy</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-modex-teal transition-colors">Home</Link>
            <Link to="/competition" className="hover:text-modex-teal transition-colors">Competition</Link>
            <Link to="/about" className="hover:text-modex-teal transition-colors">About</Link>
            
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="hover:text-modex-teal transition-colors">Admin</Link>
                )}
                {user.role === 'JUDGE' && (
                  <Link to="/judge" className="hover:text-modex-teal transition-colors">Judge</Link>
                )}
                <Link to="/dashboard" className="hover:text-modex-teal transition-colors">Dashboard</Link>
                <Link to="/chat" className="hover:text-modex-teal transition-colors flex items-center gap-1">
                  <MessageSquare size={18} />
                  Chat
                </Link>
                <Link to="/profile" className="hover:text-modex-teal transition-colors flex items-center gap-1">
                  <User size={18} />
                  {user.full_name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-modex-teal transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-modex-teal transition-colors">Login</Link>
                <Link to="/register" className="btn-primary">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

