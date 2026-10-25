import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ICourse, IModule, IReview } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { Modal } from '../../components/common/Modal.js';
import {
  Star,
  Clock,
  Users,
  CheckCircle2,
  Play,
  Lock,
  FileText,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const CourseDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [curriculum, setCurriculum] = useState<IModule[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Payment checkout modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${slug}`);
        if (res.data.success) {
          setCourse(res.data.course);
          setCurriculum(res.data.curriculum || []);
          setReviews(res.data.reviews || []);

          // Automatically expand first module
          if (res.data.curriculum && res.data.curriculum.length > 0) {
            setExpandedModules({ [res.data.curriculum[0]._id]: true });
          }

          // Check enrollment if authenticated
          if (isAuthenticated && res.data.course?._id) {
            const enrollRes = await api.get(`/enrollments/check/${res.data.course._id}`);
            setIsEnrolled(enrollRes.data.isEnrolled);
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, isAuthenticated]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleEnrollFree = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }

    if (!course) return;

    try {
      const res = await api.post(`/enrollments/free/${course._id}`);
      if (res.data.success) {
        setIsEnrolled(true);
        navigate(`/learning/${course._id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  const handleStartPaidEnrollment = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleConfirmMockPayment = async () => {
    if (!course) return;
    setProcessingPayment(true);
    setPaymentError('');

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/order', { courseId: course._id });
      if (!orderRes.data.success) {
        throw new Error('Could not create payment order');
      }

      const { orderId } = orderRes.data.order;

      // 2. Complete payment verification on backend
      const verifyRes = await api.post('/payments/verify', {
        orderId,
        paymentId: `pay_sandbox_${Date.now()}`,
      });

      if (verifyRes.data.success) {
        setIsEnrolled(true);
        setPaymentModalOpen(false);
        navigate(`/learning/${course._id}`);
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl" />
          <div className="h-96 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested course does not exist or has been removed.</p>
        <Link to="/courses" className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const totalLessons = curriculum.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                  {course.difficulty}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                  {course.subtitle}
                </p>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{course.averageRating.toFixed(1)}</span>
                  <span className="text-slate-400">({course.totalReviews} ratings)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.totalEnrolled} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.estimatedDuration}</span>
                </div>
              </div>

              {/* Instructor snippet */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <img
                  src={
                    course.instructor?.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=2563eb&color=fff`
                  }
                  alt={course.instructor?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="text-xs text-slate-400">Created by</p>
                  <p className="text-sm font-bold text-white">{course.instructor?.name}</p>
                </div>
              </div>
            </div>

            {/* Desktop Action / Buy Card */}
            <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-2xl border border-slate-100">
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-6 relative">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-500">Tuition</span>
                  {course.isFree || course.price === 0 ? (
                    <span className="text-2xl font-black text-emerald-600">Free</span>
                  ) : (
                    <span className="text-3xl font-black text-slate-900">${course.price}</span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/learning/${course._id}`}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-center block shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Continue Learning
                  </Link>
                ) : course.isFree || course.price === 0 ? (
                  <button
                    onClick={handleEnrollFree}
                    className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enroll for Free
                  </button>
                ) : (
                  <button
                    onClick={handleStartPaidEnrollment}
                    className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Enroll Now - ${course.price}
                  </button>
                )}

                <p className="text-center text-xs text-slate-400">
                  Instant Lifetime Access • Certificate Included
                </p>

                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{totalLessons} in-depth lessons & interactive exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Downloadable learning resources & code starters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Official Verified Certificate of Completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* What you'll learn */}
          {course.learningObjectives && course.learningObjectives.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Course Overview
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {course.description}
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Course Curriculum
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {curriculum.length} modules • {totalLessons} lessons • {course.estimatedDuration} total length
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {curriculum.map((mod, modIdx) => {
                const isOpen = !!expandedModules[mod._id];
                return (
                  <div
                    key={mod._id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <button
                      onClick={() => toggleModule(mod._id)}
                      className="w-full flex items-center justify-between p-5 text-left bg-slate-50/70 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm">
                          {mod.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({mod.lessons?.length || 0} lessons)
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-100 p-2">
                        {mod.lessons?.map((lesson, lIdx) => (
                          <div
                            key={lesson._id}
                            className="flex items-center justify-between p-3.5 text-sm hover:bg-slate-50/80 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isEnrolled ? (
                                <Play className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-300" />
                              )}
                              <span className="text-slate-800 font-medium">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">
                              {lesson.duration} mins
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Prerequisites</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                {course.prerequisites.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructor Bio */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Instructor Profile</h2>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={
                  course.instructor?.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=2563eb&color=fff`
                }
                alt={course.instructor?.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900">{course.instructor?.name}</h3>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {course.instructor?.headline || 'Lead Instructor'}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {course.instructor?.bio || 'Experienced educator and practitioner.'}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Student Reviews ({reviews.length})
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            rev.studentId?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.studentId?.name || 'Student')}&background=6366f1&color=fff`
                          }
                          alt={rev.studentId?.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-900">{rev.studentId?.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No reviews submitted yet for this course.</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Sandbox Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Complete Course Enrollment"
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-600">Course</p>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5 line-clamp-1">{course.title}</h4>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Due</p>
              <p className="text-xl font-black text-slate-900">${course.price}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure Payment Gateway (Development Sandbox Mode)
            </p>
            <p>
              Server-side cryptographic verification will simulate provider settlement and activate lifetime course entitlement immediately.
            </p>
          </div>

          {paymentError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
              {paymentError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmMockPayment}
              disabled={processingPayment}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {processingPayment ? 'Verifying with Gateway...' : `Confirm & Pay $${course.price}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
