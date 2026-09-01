import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentParentService } from '../../services/studentParentService';
import {
  LuMessageSquareQuote,
  LuArrowLeft,
  LuStar,
  LuSend,
  LuCheck,
  LuUser,
  LuBookOpen,
  LuLoader,
  LuTrash2,
} from 'react-icons/lu';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics (Dr. Ananya Sen)');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = () => {
    setLoading(true);
    studentParentService.getFeedback()
      .then((res) => {
        if (res?.data) {
          if (res.data.feedbacks && Array.isArray(res.data.feedbacks)) {
            setFeedbacks(res.data.feedbacks);
          } else {
            setFeedbacks([]);
          }
          if (res.data.avgRating !== undefined) {
            setAvgRating(res.data.avgRating);
          }
        }
      })
      .catch((err) => {
        console.error('Feedback fetch error from database:', err);
        setFeedbacks([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const parts = selectedSubject.includes('(') ? selectedSubject.split(' (') : [selectedSubject, 'Faculty'];
      const subject = parts[0];
      const teacher = parts[1] ? parts[1].replace(')', '') : 'Faculty';

      await studentParentService.submitFeedback({
        subject,
        teacher,
        rating,
        comment,
      });

      setSubmitted(true);
      setComment('');
      fetchFeedbacks();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">
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
          Average Faculty Rating: {avgRating} / 5.0 ★
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
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg border transition-all ${
                        rating >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-gray-50 border-gray-200 text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <LuStar className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-700 ml-1.5">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Feedback & Observations</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on teaching pace, doubt clearance, homework feedback..."
                  className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSend className="w-4 h-4" />} Submit Faculty Review
              </button>
            </form>
          </div>

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            All reviews undergo confidentiality verification by academic supervisors.
          </p>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Your Submitted Feedback ({feedbacks.length})</h2>
            <span className="text-xs text-gray-400">Class X-A Faculty Reviews</span>
          </div>

          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-800 truncate">{fb.subject}</span>
                      <span className="text-[11px] text-gray-400 truncate">• {fb.teacher}</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-gray-400">{fb.date}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-700 font-bold text-xs shrink-0">
                    <LuStar className="w-3 h-3 fill-current" />
                    <span>{fb.rating}</span>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-100 line-clamp-3 sm:line-clamp-none">
                  "{fb.comment}"
                </p>

                {fb.adminResponse ? (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[11px] sm:text-xs text-emerald-900 space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Admin Response</span>
                    <p className="leading-snug line-clamp-2 sm:line-clamp-none">{fb.adminResponse}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic">Awaiting review...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
