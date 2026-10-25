import React from 'react';
import { Link } from 'react-router-dom';
import { ICourse } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { Star, Clock, Users, Bookmark, Play } from 'lucide-react';

interface CourseCardProps {
  course: ICourse;
  isEnrolled?: boolean;
  progressPercentage?: number;
  continueLessonId?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled,
  progressPercentage,
  continueLessonId,
}) => {
  const { user, toggleBookmark, isAuthenticated } = useAuth();

  const isBookmarked =
    user?.bookmarks?.courses &&
    user.bookmarks.courses.some((id: any) =>
      typeof id === 'string' ? id === course._id : id._id === course._id
    );

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleBookmark('course', course._id);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-blue-400/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      {/* Thumbnail Header */}
      <Link to={`/courses/${course.slug || course._id}`} className="relative aspect-video overflow-hidden bg-slate-100 block">
        <img
          src={
            course.thumbnail ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Play className="w-3.5 h-3.5 fill-current" />
            View Curriculum
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
            {course.category}
          </span>
        </div>

        {/* Bookmark Button */}
        {isAuthenticated && (
          <button
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Course'}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isBookmarked
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-blue-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">
              {course.difficulty}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {course.estimatedDuration}
            </span>
          </div>

          {/* Title */}
          <Link to={`/courses/${course.slug || course._id}`}>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>

          {/* Instructor */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            By <span className="font-medium text-slate-700">{course.instructor?.name || 'Instructor'}</span>
          </p>
        </div>

        {/* Rating and Enrolled Count */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-900">
                {course.averageRating ? course.averageRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-slate-400">({course.totalReviews || 12})</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{course.totalEnrolled || 24} students</span>
            </div>
          </div>

          {/* Bottom Bar: Price or Continue Learning */}
          {isEnrolled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-blue-600">{progressPercentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage || 0}%` }}
                />
              </div>
              <Link
                to={`/learning/${course._id}`}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Continue Learning
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                {course.isFree || course.price === 0 ? (
                  <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Free
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">
                      ${course.price}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {course.currency || 'USD'}
                    </span>
                  </div>
                )}
              </div>

              <Link
                to={`/courses/${course.slug || course._id}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:underline flex items-center gap-1"
              >
                Enroll Now →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
