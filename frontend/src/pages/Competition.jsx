import { useEffect, useState } from 'react';
import { competitionService } from '../services/api';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Competition = () => {
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetition();
  }, []);

  const fetchCompetition = async () => {
    try {
      const data = await competitionService.getActive();
      setCompetition(data);
    } catch (error) {
      toast.error('Failed to load competition');
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

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">No Active Competition</h1>
        <p className="text-gray-600">Check back later for upcoming competitions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sponsor Banner */}
      {competition.sponsor_banner_url && (
        <div className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <img
              src={competition.sponsor_banner_url}
              alt="Sponsor"
              className="max-w-full h-auto mx-auto"
            />
          </div>
        </div>
      )}

      {/* Competition Header */}
      <section className="gradient-bg text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">{competition.title}</h1>
          <p className="text-xl text-gray-200 mb-8">{competition.description}</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>Starts: {new Date(competition.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>Ends: {new Date(competition.end_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stages Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-center text-modex-dark">Competition Stages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competition.stages && competition.stages.length > 0 ? (
              competition.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`card ${stage.is_active ? 'border-modex-light border-2' : 'opacity-75'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-modex-light">Stage {stage.order}</span>
                    {stage.is_active && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{stage.name}</h3>
                  <p className="text-gray-600 mb-4">{stage.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Start: {new Date(stage.start_date).toLocaleDateString()}</p>
                    <p>End: {new Date(stage.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600">
                Stages will be announced soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-center text-modex-dark">Timeline</h2>
          <div className="max-w-3xl mx-auto">
            {competition.stages && competition.stages.length > 0 ? (
              <div className="space-y-8">
                {competition.stages.map((stage, index) => (
                  <div key={stage.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${stage.is_active ? 'bg-modex-light' : 'bg-gray-300'}`}></div>
                      {index < competition.stages.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="text-xl font-semibold mb-2">{stage.name}</h3>
                      <p className="text-gray-600 mb-2">{stage.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(stage.start_date).toLocaleDateString()} - {new Date(stage.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">Timeline will be updated soon.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Competition;

