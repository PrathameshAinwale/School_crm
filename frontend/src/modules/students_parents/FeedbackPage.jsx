import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuMessageSquareQuote,
  LuArrowLeft,
  LuStar,
  LuSend,
  LuCheck,
  LuUser,
  LuBookOpen,
} from 'react-icons/lu';

const initialFeedbackList = [
  {
    id: 1,
    subject: 'Mathematics',
    teacher: 'Dr. Ananya Sen (PGT)',
    date: 'Aug 10, 2026',
    rating: 5,
    categories: { clarity: 5, doubtResolution: 5, homeworkPace: 5 },
    comment: 'Exceptional teaching methodology in Quadratic Equations and board exam problem sets. Regular weekly tests have significantly improved Aarav confidence.',
    adminResponse: 'Thank you for your valuable feedback! Dr. Ananya has been commended for her dedication in senior academic reviews.',
  },
  {
    id: 2,
    subject: 'Science (Physics)',
    teacher: 'Mr. Vikram Rathore (PGT)',
    date: 'Aug 04, 2026',
    rating: 4.5,
    categories: { clarity: 5, doubtResolution: 4, homeworkPace: 4.5 },
    comment: 'Practical sessions in Ray Optics and lab demonstrations are very engaging. Requesting additional practice questions for numericals.',
    adminResponse: 'Noted with thanks. Additional chapterwise numerical question banks have been uploaded to the Study Material tab.',
  },
  {
    id: 3,
    subject: 'English Core',
    teacher: 'Ms. Sunita Rao (TGT)',
    date: 'Jul 28, 2026',
    rating: 4,
    categories: { clarity: 4, doubtResolution: 4, homeworkPace: 4 },
    comment: 'Good grammar explanations and essay writing feedback. Thorough correction of worksheets.',
    adminResponse: null,
  },
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState(initialFeedbackList);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics (Dr. Ananya Sen)');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newFb = {
      id: Date.now(),
      subject: selectedSubject.split(' (')[0],
      teacher: selectedSubject.includes('(') ? selectedSubject.split(' (')[1].replace(')', '') : 'Faculty',
      date: 'Today (Aug 17, 2026)',
      rating,
      categories: { clarity: 5, doubtResolution: 4.5, homeworkPace: 5 },
      comment,
      adminResponse: null,
    };

    setFeedbacks([newFb, ...feedbacks]);
    setSubmitted(true);
    setComment('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Faculty & Academic Feedback</h1>
            <p className="text-xs text-gray-400">Parent feedback, class experience ratings, and administration responses</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-mono">
          Average Faculty Rating: 4.8 / 5.0 ★
        </span>
      </div>

      {/* Grid: Feedback Form & Past Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Form */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <LuMessageSquareQuote className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Submit New Feedback</h2>
                <p className="text-xs text-gray-400">Directly reviewed by Principal & Academic Dean</p>
              </div>
            </div>

            {submitted && (
              <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                <LuCheck className="w-4 h-4 shrink-0" />
                <span>Thank you! Your feedback has been recorded successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Subject & Faculty</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-primary-400"
                >
                  <option>Mathematics (Dr. Ananya Sen)</option>
                  <option>Science - Physics (Mr. Vikram Rathore)</option>
                  <option>Science - Chemistry (Mr. Rajesh Mehra)</option>
                  <option>English Core (Ms. Sunita Rao)</option>
                  <option>Social Science (Mr. Manoj Joshi)</option>
                  <option>Computer Science (Mrs. Deepa K.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Overall Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <LuStar className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Feedback & Comments</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback regarding concept clarity, doubt support, homework pacing..."
                  className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <LuSend className="w-3.5 h-3.5" /> Submit Feedback
              </button>
            </form>
          </div>
        </div>

        {/* Feedback History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-800">Submitted Feedback & School Action Log ({feedbacks.length})</h2>

          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{fb.subject}</h3>
                  <p className="text-xs text-gray-500">Faculty: <strong>{fb.teacher}</strong></p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <LuStar
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(fb.rating) ? 'fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-1.5">{fb.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{fb.date}</span>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                "{fb.comment}"
              </p>

              {fb.adminResponse && (
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
                  <p className="font-bold text-primary-900 mb-0.5">Response from Academic Directorate:</p>
                  <p className="text-primary-800 italic">"{fb.adminResponse}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
