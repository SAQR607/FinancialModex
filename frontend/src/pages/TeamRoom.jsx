import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { messageService, fileService, teamService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Send, Upload, Video, Phone, Monitor, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamRoom = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [teamId]);

  const fetchData = async () => {
    try {
      const teamData = await teamService.getMyTeam();
      if (teamData.id !== parseInt(teamId)) {
        navigate('/teams');
        return;
      }
      setTeam(teamData);
      
      if (teamData.room) {
        const [messagesData, filesData] = await Promise.all([
          messageService.getRoomMessages(teamData.room.id),
          fileService.getTeamFiles(teamData.id)
        ]);
        setMessages(messagesData);
        setFiles(filesData);
      }
    } catch (error) {
      toast.error('Failed to load team room');
      navigate('/teams');
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    socketRef.current = io(socketUrl, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      if (team?.room) {
        socketRef.current.emit('join_room', team.room.id);
      }
    });

    socketRef.current.on('room_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('error', (error) => {
      toast.error(error.message);
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !team?.room) return;

    try {
      await messageService.createMessage({
        room_id: team.room.id,
        message_text: newMessage
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and Excel files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('team_id', team.id);
    formData.append('room_id', team.room?.id || '');

    try {
      await fileService.upload(formData);
      toast.success('File uploaded successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const downloadFile = (file) => {
    // File path is stored as relative path from uploads directory
    const fileName = file.file_path.split(/[/\\]/).pop();
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    window.open(`${baseUrl}/uploads/${fileName}`, '_blank');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-modex-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-modex-dark text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{team.name} - Team Room</h1>
            <p className="text-gray-300">{team.members?.length || 0}/5 members</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowVideoCall(!showVideoCall)}
              className="bg-modex-light hover:bg-opacity-90 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Video size={20} />
              Video Call
            </button>
            <button
              onClick={() => navigate('/teams')}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex container mx-auto">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-3 rounded-lg ${
                    message.user_id === user.id
                      ? 'bg-modex-light text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {message.user?.full_name}
                  </p>
                  <p>{message.message_text}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input-field flex-1"
              placeholder="Type a message..."
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline"
            >
              <Upload size={20} />
            </button>
            <button type="submit" className="btn-primary">
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Files Section */}
        <div className="w-80 bg-gray-50 border-l p-4">
          <h2 className="text-xl font-bold mb-4">Files</h2>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.xls,.xlsx"
            className="hidden"
          />
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => downloadFile(file)}
              >
                <p className="font-semibold truncate">{file.file_name}</p>
                <p className="text-sm text-gray-600">
                  {file.uploader?.full_name} • {(file.file_size / 1024).toFixed(2)} KB
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Video Call</h2>
              <button
                onClick={() => setShowVideoCall(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-8 text-center text-white">
              <p>WebRTC video call functionality</p>
              <p className="text-sm text-gray-400 mt-2">
                Video call implementation would go here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRoom;

