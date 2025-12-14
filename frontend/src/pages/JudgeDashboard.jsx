import { useEffect, useState } from 'react';
import { judgeService, competitionService } from '../services/api';
import { Trophy, Users, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const data = await competitionService.getAll();
      setCompetitions(data);
      if (data.length > 0) {
        setSelectedCompetition(data[0].id);
        fetchTeams(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (competitionId) => {
    try {
      const teamsData = await judgeService.getAssignedTeams(competitionId);
      setTeams(teamsData);
      const scoresData = await judgeService.getScores({ competition_id: competitionId });
      setScores(scoresData);
    } catch (error) {
      toast.error('Failed to load teams');
    }
  };

  const handleScoreSubmit = async (teamId, stageId, score, notes) => {
    try {
      await judgeService.submitScore({
        competition_id: selectedCompetition,
        stage_id: stageId,
        team_id: teamId,
        score,
        notes
      });
      toast.success('Score submitted successfully');
      fetchTeams(selectedCompetition);
    } catch (error) {
      toast.error('Failed to submit score');
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
        <h1 className="text-4xl font-bold mb-8 text-modex-dark">Judge Dashboard</h1>

        {/* Competition Selector */}
        <div className="card mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Competition
          </label>
          <select
            value={selectedCompetition || ''}
            onChange={(e) => {
              setSelectedCompetition(e.target.value);
              fetchTeams(e.target.value);
            }}
            className="input-field"
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.title}
              </option>
            ))}
          </select>
        </div>

        {/* Teams List */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Assigned Teams</h2>
          {teams.length === 0 ? (
            <p className="text-gray-600">No teams assigned</p>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => (
                <div key={team.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{team.name}</h3>
                    <span className="text-sm text-gray-600">
                      {team.members?.length || 0}/5 members
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-semibold mb-2">Members:</p>
                    <div className="space-y-1">
                      {team.members?.map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-modex-light rounded-full flex items-center justify-center text-white text-sm">
                            {member.user?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{member.user?.full_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scoring Form */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Submit Score</h4>
                    <ScoreForm
                      teamId={team.id}
                      competitionId={selectedCompetition}
                      existingScore={scores.find(s => s.team_id === team.id)}
                      onSubmit={handleScoreSubmit}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScoreForm = ({ teamId, competitionId, existingScore, onSubmit }) => {
  const [score, setScore] = useState(existingScore?.score || '');
  const [notes, setNotes] = useState(existingScore?.notes || '');
  const [stageId, setStageId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stageId || !score) {
      toast.error('Please fill all required fields');
      return;
    }
    onSubmit(teamId, stageId, parseFloat(score), notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stage ID
        </label>
        <input
          type="number"
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Score (0-100)
        </label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="input-field"
          min="0"
          max="100"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows="3"
        />
      </div>
      <button type="submit" className="btn-primary">
        {existingScore ? 'Update Score' : 'Submit Score'}
      </button>
    </form>
  );
};

export default JudgeDashboard;

