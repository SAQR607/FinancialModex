import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService, competitionService } from '../services/api';
import { Users, Plus, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Teams = () => {
  const [team, setTeam] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamData, compData] = await Promise.all([
        teamService.getMyTeam().catch(() => null),
        competitionService.getActive().catch(() => null)
      ]);
      setTeam(teamData);
      setCompetition(compData);
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const newTeam = await teamService.create({
        competition_id: competition.id,
        name: teamName
      });
      toast.success('Team created successfully!');
      setTeam(newTeam);
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      await teamService.join(inviteCode);
      toast.success('Joined team successfully!');
      fetchData();
      setInviteCode('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join team');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(team.invite_code);
    toast.success('Invite code copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-modex-light"></div>
      </div>
    );
  }

  if (team) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="card">
            <h1 className="text-4xl font-bold mb-6 text-modex-dark">My Team</h1>
            
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">{team.name}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-modex-light text-white px-4 py-2 rounded-lg">
                  Invite Code: <span className="font-mono font-bold">{team.invite_code}</span>
                </div>
                <button
                  onClick={copyInviteCode}
                  className="btn-outline flex items-center gap-2"
                >
                  <Copy size={18} />
                  Copy
                </button>
              </div>
              <p className="text-gray-600">
                Status: {team.is_complete ? (
                  <span className="text-green-600 font-semibold">Complete (5/5 members)</span>
                ) : team.is_locked ? (
                  <span className="text-yellow-600 font-semibold">Locked</span>
                ) : (
                  <span className="text-blue-600 font-semibold">Open ({team.members?.length || 0}/5 members)</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Team Members</h3>
              <div className="space-y-3">
                {team.members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-modex-light rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{member.user?.full_name}</p>
                      <p className="text-sm text-gray-600">{member.user?.email}</p>
                    </div>
                    {member.user_id === team.leader_id && (
                      <span className="bg-modex-teal text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate(`/team/${team.id}/room`)}
              className="btn-primary"
            >
              Go to Team Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-modex-dark">Teams</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Team */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="text-modex-light" size={24} />
              <h2 className="text-2xl font-semibold">Create Team</h2>
            </div>
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary w-full"
              >
                Create New Team
              </button>
            ) : (
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input-field"
                    required
                    placeholder="Enter team name"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Join Team */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-modex-teal" size={24} />
              <h2 className="text-2xl font-semibold">Join Team</h2>
            </div>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input-field font-mono"
                  required
                  placeholder="Enter invite code"
                />
              </div>
              <button type="submit" className="btn-secondary w-full">
                Join Team
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;

