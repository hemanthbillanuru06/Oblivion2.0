import React from 'react';
import { IResource } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import {
  FileText,
  FileCode,
  FileCheck,
  Presentation,
  BookMarked,
  Download,
  Bookmark,
  Share2,
} from 'lucide-react';

interface ResourceCardProps {
  resource: IResource;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { user, toggleBookmark, isAuthenticated } = useAuth();

  const isBookmarked =
    user?.bookmarks?.resources &&
    user.bookmarks.resources.some((id: any) =>
      typeof id === 'string' ? id === resource._id : id._id === resource._id
    );

  const getIcon = () => {
    switch (resource.fileType) {
      case 'pdf':
      case 'doc':
      case 'notes':
        return <FileText className="w-6 h-6 text-rose-500" />;
      case 'code':
        return <FileCode className="w-6 h-6 text-blue-500" />;
      case 'presentation':
        return <Presentation className="w-6 h-6 text-amber-500" />;
      case 'exercise':
        return <FileCheck className="w-6 h-6 text-emerald-500" />;
      case 'ebook':
        return <BookMarked className="w-6 h-6 text-purple-500" />;
      default:
        return <FileText className="w-6 h-6 text-slate-500" />;
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/resources/${resource._id}/download`);
      if (res.data.success && res.data.downloadUrl) {
        // Trigger download
        const a = document.createElement('a');
        a.href = res.data.downloadUrl;
        a.download = res.data.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Download failed. Please log in.');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {getIcon()}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {resource.fileType}
            </span>
            {isAuthenticated && (
              <button
                onClick={() => toggleBookmark('resource', resource._id)}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isBookmarked
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Download Action */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          <span>{resource.fileSize}</span>
          <span className="mx-1.5">•</span>
          <span>{resource.downloadCount} downloads</span>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
};
