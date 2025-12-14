import { Link } from 'react-router-dom';
import { Trophy, Users, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to MODEX Academy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Compete, Learn, and Excel in Financial Modeling
          </p>
          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="btn-secondary text-lg px-8 py-4">
                Get Started
              </Link>
              <Link to="/competition" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-modex-dark">
                Learn More
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="btn-secondary text-lg px-8 py-4 inline-block">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-modex-dark">
            Why MODEX Academy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="bg-modex-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Competitive Excellence</h3>
              <p className="text-gray-600">
                Test your skills against the best in financial modeling and analysis.
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-modex-teal rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Team Collaboration</h3>
              <p className="text-gray-600">
                Work with talented peers in teams of up to 5 members.
              </p>
            </div>
            <div className="card text-center">
              <div className="bg-modex-dark rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Real-World Skills</h3>
              <p className="text-gray-600">
                Develop practical financial modeling expertise through hands-on challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-modex-light text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Compete?</h2>
          <p className="text-xl mb-8 text-gray-200">
            Join hundreds of participants in this exciting competition
          </p>
          {!user ? (
            <Link to="/register" className="btn-secondary bg-white text-modex-light hover:bg-gray-100 inline-flex items-center gap-2">
              Register Now <ArrowRight size={20} />
            </Link>
          ) : (
            <Link to="/dashboard" className="btn-secondary bg-white text-modex-light hover:bg-gray-100 inline-flex items-center gap-2">
              View Dashboard <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

