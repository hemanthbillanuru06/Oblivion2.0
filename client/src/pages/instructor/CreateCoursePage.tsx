import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Plus, Save, Sparkles, BookOpen, Layers } from 'lucide-react';

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState('6 hours');
  const [thumbnail, setThumbnail] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('Master core fundamentals\nBuild full applications');
  const [prerequisites, setPrerequisites] = useState('Basic computer skills');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Initial module & lesson fields
  const [moduleTitle, setModuleTitle] = useState('Module 1: Introduction');
  const [lessonTitle, setLessonTitle] = useState('1.1 Course Overview & Setup');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('https://www.youtube.com/embed/SqcY0GlETPk');
  const [lessonContent, setLessonContent] = useState('Welcome to the course! In this lesson, we establish foundational concepts.');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please provide a course title and description.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. Create course
      const courseRes = await api.post('/courses', {
        title,
        subtitle,
        description,
        category,
        difficulty,
        isFree,
        price: isFree ? 0 : Number(price),
        estimatedDuration,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
        learningObjectives: learningObjectives.split('\n').filter((o) => o.trim()),
        prerequisites: prerequisites.split('\n').filter((p) => p.trim()),
        status,
      });

      if (courseRes.data.success && courseRes.data.course) {
        const newCourseId = courseRes.data.course._id;

        // 2. Create initial module
        const modRes = await api.post(`/courses/${newCourseId}/modules`, {
          title: moduleTitle,
        });

        if (modRes.data.success && modRes.data.module) {
          const newModId = modRes.data.module._id;

          // 3. Create initial lesson
          await api.post(`/courses/${newCourseId}/modules/${newModId}/lessons`, {
            title: lessonTitle,
            type: 'video',
            videoUrl: lessonVideoUrl,
            content: lessonContent,
            duration: 15,
            isRequired: true,
          });
        }

        navigate(`/learning/${newCourseId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Course
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish a comprehensive program with curriculum modules, video lessons, and interactive learning materials.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Basic Course Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Course Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Python Programming & Async Architectures"
                className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A concise, compelling single-sentence summary"
                className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Detailed Course Description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what students will master, why this course matters, and how it is structured..."
                className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Programming">Programming</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Design & UX">Design & UX</option>
                  <option value="Business & Leadership">Business & Leadership</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-50 text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g. 8 hours"
                  className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isFree" className="text-sm font-bold text-slate-800 cursor-pointer">
                  Offer this course for Free
                </label>
              </div>

              {!isFree && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">Price ($ USD):</span>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-24 bg-white text-sm px-3 py-1.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Initial Curriculum Setup */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Layers className="w-5 h-5 text-indigo-600" />
            Initial Module & First Lesson
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Module Title
              </label>
              <input
                type="text"
                required
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  First Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Lesson Video Embed URL
                </label>
                <input
                  type="url"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                First Lesson Notes / Guide Content
              </label>
              <textarea
                rows={3}
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/instructor/dashboard')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Creating Course & Curriculum...' : 'Publish Course'}
          </button>
        </div>
      </form>
    </div>
  );
};
