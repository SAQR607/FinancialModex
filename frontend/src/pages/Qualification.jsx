import { useEffect, useState } from 'react';
import { qualificationService, competitionService } from '../services/api';
import { FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Qualification = () => {
  const [competition, setCompetition] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const comp = await competitionService.getActive();
      setCompetition(comp);
      
      if (comp) {
        const [questionsData, answersData] = await Promise.all([
          qualificationService.getQuestions(comp.id).catch(() => []),
          qualificationService.getMyAnswers(comp.id).catch(() => [])
        ]);
        
        setQuestions(questionsData);
        
        if (answersData.length > 0) {
          const answersObj = {};
          answersData.forEach(answer => {
            answersObj[answer.question_id] = answer.answer_text;
          });
          setAnswers(answersObj);
          setSubmitted(true);
        }
      }
    } catch (error) {
      toast.error('Failed to load qualification data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const answersArray = questions.map(q => ({
      question_id: q.id,
      answer_text: answers[q.id] || ''
    }));

    try {
      await qualificationService.submitAnswers(competition.id, answersArray);
      toast.success('Answers submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit answers');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Competition</h2>
          <p className="text-gray-600">There is no active competition at the moment.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="text-gray-600">Qualification questions will be available soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card mb-6">
          <h1 className="text-4xl font-bold mb-4 text-modex-dark">Qualification Questions</h1>
          <p className="text-gray-600 mb-2">
            Competition: <span className="font-semibold">{competition.title}</span>
          </p>
          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              <span>You have already submitted your answers. Waiting for approval.</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="card">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-modex-light text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{question.question_text}</h3>
                  {question.is_required && (
                    <span className="text-red-600 text-sm">* Required</span>
                  )}
                </div>
              </div>

              {question.question_type === 'TEXT' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="input-field"
                  rows="4"
                  required={question.is_required}
                  disabled={submitted}
                  placeholder="Type your answer here..."
                />
              )}

              {question.question_type === 'MULTIPLE_CHOICE' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        required={question.is_required}
                        disabled={submitted}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'NUMBER' && (
                <input
                  type="number"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="input-field"
                  required={question.is_required}
                  disabled={submitted}
                  placeholder="Enter a number"
                />
              )}
            </div>
          ))}

          {!submitted && (
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Submit Answers
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Qualification;

