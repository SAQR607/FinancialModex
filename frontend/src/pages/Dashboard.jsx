import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { competitionService, teamService } from '../services/api';
import { Trophy, Users, FileText, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compData, teamData] = await Promise.all([
        competitionService.getActive().catch(() => null),
        teamService.getMyTeam().catch(() => null)
      ]);
      setCompetition(compData);
      setTeam(teamData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-modex-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-modex-dark">Dashboard</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Qualification Status</p>
                {user.is_qualified && user.is_approved ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Qualified & Approved</span>
                  </div>
                ) : user.is_qualified ? (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <XCircle size={20} />
                    <span className="font-semibold">Pending Approval</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <XCircle size={20} />
                    <span className="font-semibold">Not Qualified</span>
                  </div>
                )}
              </div>
              <FileText className="text-modex-light" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Team Status</p>
                {team ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-semibold">{team.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <XCircle size={20} />
                    <span className="font-semibold">No Team</span>
                  </div>
                )}
              </div>
              <Users className="text-modex-teal" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Role</p>
                <p className="font-semibold text-modex-dark">{user.role.replace('_', ' ')}</p>
              </div>
              <Trophy className="text-modex-light" size={32} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {!user.is_qualified && (
            <Link to="/qualification" className="card hover:shadow-xl transition-shadow cursor-pointer">
              <FileText className="text-modex-light mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Qualification</h3>
              <p className="text-gray-600">Complete qualification questions</p>
            </Link>
          )}

          {user.is_qualified && user.is_approved && !team && (
            <Link to="/teams" className="card hover:shadow-xl transition-shadow cursor-pointer">
              <Users className="text-modex-teal mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Create Team</h3>
              <p className="text-gray-600">Form or join a team</p>
            </Link>
          )}

          {team && (
            <Link to={`/team/${team.id}/room`} className="card hover:shadow-xl transition-shadow cursor-pointer">
              <MessageSquare className="text-modex-light mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Team Room</h3>
              <p className="text-gray-600">Collaborate with your team</p>
            </Link>
          )}

          <Link to="/chat" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <MessageSquare className="text-modex-teal mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Global Chat</h3>
            <p className="text-gray-600">Chat with all participants</p>
          </Link>

          <Link to="/competition" className="card hover:shadow-xl transition-shadow cursor-pointer">
            <Trophy className="text-modex-light mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Competition</h3>
            <p className="text-gray-600">View competition details</p>
          </Link>
        </div>

        {/* Competition Info */}
        {competition && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-modex-dark">Active Competition</h2>
            <h3 className="text-xl font-semibold mb-2">{competition.title}</h3>
            <p className="text-gray-600 mb-4">{competition.description}</p>
            <Link to="/competition" className="btn-primary inline-block">
              View Details
            </Link>
          </div>
        )}

        {/* Team Info */}
        {team && (
          <div className="card mt-6">
            <h2 className="text-2xl font-bold mb-4 text-modex-dark">My Team</h2>
            <div className="mb-4">
              <p className="text-lg font-semibold">{team.name}</p>
              <p className="text-gray-600">Invite Code: <span className="font-mono font-bold">{team.invite_code}</span></p>
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-2">Members ({team.members?.length || 0}/5):</p>
              <div className="space-y-2">
                {team.members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-modex-light rounded-full flex items-center justify-center text-white">
                      {member.user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{member.user?.full_name}</span>
                    {member.user_id === team.leader_id && (
                      <span className="text-xs bg-modex-teal text-white px-2 py-1 rounded">Leader</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Link to={`/team/${team.id}/room`} className="btn-primary inline-block">
              Go to Team Room
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

