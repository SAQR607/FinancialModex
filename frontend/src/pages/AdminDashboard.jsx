import { useEffect, useState } from 'react';
import { adminService, competitionService } from '../services/api';
import { Users, FileText, Trophy, MessageSquare, CheckCircle, XCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, competitionsData] = await Promise.all([
        adminService.getAllUsers(),
        competitionService.getAll()
      ]);
      setUsers(usersData);
      setCompetitions(competitionsData);
      setApprovedCount(usersData.filter(u => u.is_approved).length);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      toast.success('User approved');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      await adminService.rejectUser(userId);
      toast.success('User rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject user');
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
        <h1 className="text-4xl font-bold mb-8 text-modex-dark">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-modex-dark">{users.length}</p>
              </div>
              <Users className="text-modex-light" size={32} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Approved Users</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}/100</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {users.filter(u => u.is_qualified && !u.is_approved).length}
                </p>
              </div>
              <XCircle className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Competitions</p>
                <p className="text-3xl font-bold text-modex-dark">{competitions.length}</p>
              </div>
              <Trophy className="text-modex-teal" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              selectedTab === 'users'
                ? 'border-modex-light text-modex-light'
                : 'border-transparent text-gray-600 hover:text-modex-dark'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setSelectedTab('competitions')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              selectedTab === 'competitions'
                ? 'border-modex-light text-modex-light'
                : 'border-transparent text-gray-600 hover:text-modex-dark'
            }`}
          >
            Competitions
          </button>
          <button
            onClick={() => setSelectedTab('questions')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              selectedTab === 'questions'
                ? 'border-modex-light text-modex-light'
                : 'border-transparent text-gray-600 hover:text-modex-dark'
            }`}
          >
            Qualification Questions
          </button>
        </div>

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.full_name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.role}</td>
                      <td className="py-3 px-4">
                        {user.is_approved ? (
                          <span className="text-green-600 font-semibold">Approved</span>
                        ) : user.is_qualified ? (
                          <span className="text-yellow-600 font-semibold">Pending</span>
                        ) : (
                          <span className="text-gray-600">Not Qualified</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {user.is_qualified && !user.is_approved && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={approvedCount >= 100}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Competitions Tab */}
        {selectedTab === 'competitions' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Competitions</h2>
            <div className="space-y-4">
              {competitions.map((comp) => (
                <div key={comp.id} className="border rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{comp.title}</h3>
                  <p className="text-gray-600 mb-2">{comp.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Start: {new Date(comp.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(comp.end_date).toLocaleDateString()}</span>
                    <span className={comp.is_active ? 'text-green-600' : 'text-gray-600'}>
                      {comp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {selectedTab === 'questions' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Qualification Questions</h2>
            <p className="text-gray-600">Select a competition to manage questions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

