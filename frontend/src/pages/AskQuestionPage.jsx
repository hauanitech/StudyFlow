import { useNavigate } from 'react-router-dom';
import { QuestionForm } from '../components/qna';
import { qnaApi } from '../services/qnaApi';

export default function AskQuestionPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const response = await qnaApi.createQuestion(data);
    navigate(`/qa/${response.data._id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
          <p className="text-gray-400">
            Get help from the community by asking a clear, specific question
          </p>
        </div>

        {/* Tips */}
        <div className="card bg-blue-900/20 border-blue-700/50 mb-8">
          <h2 className="font-semibold text-blue-400 mb-2">
            Tips for a great question
          </h2>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Search first to see if your question has already been answered</li>
            <li>• Be specific and include details about what you've tried</li>
            <li>• Use relevant tags to help others find your question</li>
            <li>• Proofread before posting for clarity</li>
          </ul>
        </div>

        {/* Form */}
        <div className="card">
          <QuestionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
