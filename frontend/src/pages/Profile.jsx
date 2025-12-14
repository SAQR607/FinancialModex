import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamService, fileService } from '../services/api';
import { User, Trophy, Users, FileText } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamData, filesData] = await Promise.all([
        teamService.getMyTeam().catch(() => null),
        fileService.getTeamFiles(user?.team?.id || 0).catch(() => [])
      ]);
      setTeam(teamData);
      if (teamData) {
        const teamFiles = await fileService.getTeamFiles(teamData.id).catch(() => []);
        setFiles(teamFiles);
      }
    } catch (error) {
      // Ignore errors
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
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-modex-dark">My Profile</h1>

        {/* Personal Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-modex-light rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.full_name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Role</p>
              <p className="font-semibold">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Status</p>
              <p className="font-semibold">
                {user?.is_approved ? (
                  <span className="text-green-600">Approved</span>
                ) : user?.is_qualified ? (
                  <span className="text-yellow-600">Pending Approval</span>
                ) : (
                  <span className="text-gray-600">Not Qualified</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Team Info */}
        {team && (
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-modex-teal" size={24} />
              <h2 className="text-2xl font-semibold">Team Information</h2>
            </div>
            <div className="mb-4">
              <p className="text-lg font-semibold">{team.name}</p>
              <p className="text-gray-600">Invite Code: <span className="font-mono">{team.invite_code}</span></p>
            </div>
            <div>
              <p className="font-semibold mb-2">Members:</p>
              <div className="space-y-2">
                {team.members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-modex-light rounded-full flex items-center justify-center text-white text-sm">
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
          </div>
        )}

        {/* Uploaded Files */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-modex-light" size={24} />
            <h2 className="text-2xl font-semibold">My Uploaded Files</h2>
          </div>
          {files.length === 0 ? (
            <p className="text-gray-600">No files uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {files.filter(f => f.user_id === user.id).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{file.file_name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.file_size / 1024).toFixed(2)} KB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
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

export default Profile;

