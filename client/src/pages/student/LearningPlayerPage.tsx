import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ICourse, IModule, ILesson, IEnrollment, IQuiz } from '../../types/index.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { Modal } from '../../components/common/Modal.js';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  FileCheck,
} from 'lucide-react';

export const LearningPlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [curriculum, setCurriculum] = useState<IModule[]>([]);
  const [enrollment, setEnrollment] = useState<IEnrollment | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<ILesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'quiz' | 'notes'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Quiz state
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);

  // Notes state
  const [personalNotes, setPersonalNotes] = useState<string>('');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  // Completion modal state
  const [certModalOpen, setCertModalOpen] = useState<boolean>(false);
  const [claimedCert, setClaimedCert] = useState<any>(null);

  // Fetch full player state
  const fetchPlayerData = async () => {
    try {
      const res = await api.get(`/progress/player/${courseId}`);
      if (res.data.success) {
        setCourse(res.data.course);
        setCurriculum(res.data.curriculum);
        setEnrollment(res.data.enrollment);
        setProgressMap(res.data.progressMap || {});

        // Set initial active lesson to last accessed or first available
        if (!activeLesson && res.data.curriculum.length > 0) {
          const allLessons = res.data.curriculum.flatMap((m: any) => m.lessons);
          const lastAccId = res.data.enrollment?.lastAccessedLesson;
          const matched = allLessons.find(
            (l: any) => l._id.toString() === (typeof lastAccId === 'string' ? lastAccId : lastAccId?._id)
          );
          setActiveLesson(matched || allLessons[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load learning player:', err);
      if (err.response?.status === 403) {
        alert('Access restricted: Please enroll in this course first.');
        navigate(`/courses/${courseId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [courseId]);

  // When active lesson changes, fetch associated quiz if exists
  useEffect(() => {
    if (activeLesson && courseId) {
      // Update last accessed lesson on server
      api.post(`/progress/access/${courseId}/${activeLesson._id}`).catch(() => {});

      // Load quiz for course
      api.get(`/assessments/courses/${courseId}/quizzes`).then((res) => {
        if (res.data.success && res.data.quizzes.length > 0) {
          // Find quiz matching lesson, or final course quiz
          const lessonQuiz = res.data.quizzes.find(
            (q: any) => q.lessonId === activeLesson._id || (q.isFinalQuiz && activeTab === 'quiz')
          );
          setQuiz(lessonQuiz || res.data.quizzes[0]);
        }
      });

      // Load saved notes from localStorage
      const savedNote = localStorage.getItem(`note_${courseId}_${activeLesson._id}`);
      setPersonalNotes(savedNote || '');
    }
  }, [activeLesson, courseId]);

  const allLessons = curriculum.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const isLessonCompleted = activeLesson ? !!progressMap[activeLesson._id] : false;

  const handleMarkComplete = async () => {
    if (!activeLesson || !courseId) return;

    try {
      const endpoint = isLessonCompleted ? 'incomplete' : 'complete';
      const res = await api.post(`/progress/${endpoint}/${courseId}/${activeLesson._id}`);
      if (res.data.success) {
        setProgressMap((prev) => ({
          ...prev,
          [activeLesson._id]: !isLessonCompleted,
        }));
        setEnrollment(res.data.enrollment);

        // If newly reached 100%, fire celebratory confetti!
        if (res.data.enrollment?.progressPercentage >= 100 && !isLessonCompleted) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          setCertModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    }
  };

  const handleNavigateLesson = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentLessonIndex > 0) {
      setActiveLesson(allLessons[currentLessonIndex - 1]);
    } else if (direction === 'next' && currentLessonIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentLessonIndex + 1]);
    }
  };

  const handleSaveNotes = () => {
    if (activeLesson && courseId) {
      localStorage.setItem(`note_${courseId}_${activeLesson._id}`, personalNotes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmittingQuiz(true);

    try {
      // Build selectedAnswers array matching questions order
      const answersArray = quiz.questions.map((_, i) => selectedAnswers[i] ?? -1);

      const res = await api.post(`/assessments/quizzes/${quiz._id}/submit`, {
        selectedAnswers: answersArray,
      });

      if (res.data.success) {
        setQuizResult(res.data);
        if (res.data.attempt?.passed) {
          confetti({ particleCount: 80, spread: 60 });
          // Re-fetch player data to sync progress
          fetchPlayerData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Quiz submission failed.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleClaimCertificate = async () => {
    if (!courseId) return;
    try {
      const res = await api.post(`/certificates/claim/${courseId}`);
      if (res.data.success) {
        setClaimedCert(res.data.certificate);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not claim certificate.');
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Loading your learning workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Learning Navigation Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            to="/student/my-courses"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Courses</span>
          </Link>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <h2 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md lg:max-w-lg">
            {course.title}
          </h2>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 w-48">
            <ProgressBar
              percentage={enrollment?.progressPercentage || 0}
              size="sm"
              showLabel={false}
              color="emerald"
            />
            <span className="text-xs font-bold text-emerald-400 shrink-0">
              {enrollment?.progressPercentage || 0}%
            </span>
          </div>

          {/* Certificate Claim Button */}
          {enrollment && enrollment.progressPercentage >= 100 && (
            <button
              onClick={() => setCertModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">Certificate Ready</span>
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Lesson Viewer */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Media Player Area */}
          <div className="bg-black aspect-video max-h-[60vh] w-full flex items-center justify-center relative">
            {activeLesson?.videoUrl && activeLesson.videoUrl.includes('youtube') ? (
              <iframe
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : activeLesson?.videoUrl ? (
              <video
                src={activeLesson.videoUrl}
                controls
                className="w-full h-full object-contain"
                poster={course.thumbnail}
              />
            ) : (
              <div className="p-8 text-center max-w-lg space-y-3">
                <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">{activeLesson?.title}</h3>
                <p className="text-xs text-slate-400">
                  This lesson is an interactive reading and assessment unit. Read the materials below to master the core concepts.
                </p>
              </div>
            )}
          </div>

          {/* Lesson Action Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-900">
                  Lesson {currentLessonIndex + 1} of {allLessons.length}
                </span>
                <span className="text-xs text-slate-400">• {activeLesson?.duration} mins</span>
              </div>
              <h1 className="text-xl font-extrabold text-white mt-1">
                {activeLesson?.title}
              </h1>
            </div>

            {/* Navigation & Mark Complete Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigateLesson('prev')}
                disabled={currentLessonIndex === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleMarkComplete}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm ${
                  isLessonCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isLessonCompleted ? 'Completed' : 'Mark as Complete'}
              </button>

              <button
                onClick={() => handleNavigateLesson('next')}
                disabled={currentLessonIndex === allLessons.length - 1}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Supplementary Tabs */}
          <div className="p-6 max-w-4xl space-y-6">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Assessments & Quiz
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'resources'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Attachments & Notes
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Personal Notes
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
                <h3 className="font-bold text-white text-base">Key Concepts & Instructions</h3>
                <p>{activeLesson?.content || activeLesson?.description || 'No additional content provided.'}</p>
              </div>
            )}

            {/* Tab 2: Quiz */}
            {activeTab === 'quiz' && (
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6">
                {quiz ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{quiz.description}</p>
                      </div>
                      <span className="text-xs font-bold bg-amber-950 text-amber-400 border border-amber-900 px-3 py-1 rounded-full">
                        Passing Score: {quiz.passingScore}%
                      </span>
                    </div>

                    {/* Quiz Questions */}
                    <div className="space-y-6">
                      {quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="space-y-3">
                          <p className="text-sm font-bold text-white">
                            {qIndex + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, optIndex) => {
                              const isSelected = selectedAnswers[qIndex] === optIndex;
                              return (
                                <button
                                  key={optIndex}
                                  onClick={() =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [qIndex]: optIndex,
                                    }))
                                  }
                                  className={`w-full text-left p-3.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-3 ${
                                    isSelected
                                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'border-blue-400 bg-blue-500'
                                        : 'border-slate-500'
                                    }`}
                                  >
                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                  </div>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Results Banner if submitted */}
                    {quizResult && (
                      <div
                        className={`p-4 rounded-2xl border text-sm space-y-2 ${
                          quizResult.attempt?.passed
                            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                            : 'bg-rose-950/60 border-rose-800 text-rose-200'
                        }`}
                      >
                        <p className="font-bold text-base">
                          {quizResult.attempt?.passed ? '🎉 Congratulations, You Passed!' : 'Needs Improvement'}
                        </p>
                        <p className="text-xs">
                          Your Score: {quizResult.attempt?.score}% ({quizResult.attempt?.correctAnswersCount} of{' '}
                          {quizResult.attempt?.totalQuestions} correct)
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submittingQuiz || Object.keys(selectedAnswers).length < quiz.questions.length}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submittingQuiz ? 'Grading on Server...' : 'Submit Answers'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No quiz associated with this course unit.</p>
                )}
              </div>
            )}

            {/* Tab 3: Resources */}
            {activeTab === 'resources' && (
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-base">Downloadable Lesson Resources</h3>
                <div className="divide-y divide-slate-800">
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-rose-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Full-Stack Curriculum Notes (PDF)</p>
                        <p className="text-[10px] text-slate-400">1.8 MB • PDF Document</p>
                      </div>
                    </div>
                    <a
                      href="/uploads/sample_resource.pdf"
                      download
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Notes */}
            {activeTab === 'notes' && (
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Personal Lesson Notes</h3>
                  {notesSaved && <span className="text-xs text-emerald-400 font-bold">Saved!</span>}
                </div>
                <textarea
                  rows={6}
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Type notes, code snippets, or thoughts as you learn..."
                  className="w-full bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Curriculum Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-80 sm:w-96' : 'w-0'
          } bg-slate-900 border-l border-slate-800 shrink-0 transition-all duration-300 flex flex-col overflow-hidden z-20`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white">Course Curriculum</h3>
              <p className="text-[11px] text-slate-400">
                {enrollment?.completedLessonsCount || 0} of {allLessons.length} lessons completed
              </p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2">
            {curriculum.map((mod, modIdx) => (
              <div key={mod._id} className="py-2 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  {mod.title}
                </p>

                <div className="space-y-1">
                  {mod.lessons?.map((lesson) => {
                    const isCompleted = !!progressMap[lesson._id];
                    const isActive = activeLesson?._id === lesson._id;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate font-medium">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {lesson.duration}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Course Completion & Certificate Claim Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Congratulations! Course Completed 🎉"
        maxWidth="lg"
      >
        <div className="text-center space-y-5 text-slate-900 py-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black">You Did It!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You have completed 100% of the curriculum for{' '}
              <span className="font-bold text-slate-900">"{course.title}"</span>. Your official completion certificate is ready to issue.
            </p>
          </div>

          {claimedCert ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2">
              <p className="text-xs font-bold uppercase text-emerald-700">Official Certificate Issued</p>
              <p className="font-mono text-sm font-bold text-slate-900">{claimedCert.certificateId}</p>
              <div className="pt-2 flex gap-3">
                <Link
                  to={`/certificates/verify/${claimedCert.certificateId}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  View & Verify Certificate →
                </Link>
              </div>
            </div>
          ) : (
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleClaimCertificate}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Claim Verified Certificate Now
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
