import React from 'react';

interface ProgressBarProps {
  percentage: number;
  completedLessons?: number;
  totalLessons?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'blue' | 'emerald' | 'amber';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  completedLessons,
  totalLessons,
  size = 'md',
  showLabel = true,
  color = 'blue',
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  const isComplete = clampedPercentage >= 100;
  const activeColor = isComplete ? 'bg-emerald-500' : colorClasses[color];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
          <span>
            {completedLessons !== undefined && totalLessons !== undefined
              ? `${completedLessons} of ${totalLessons} lessons completed`
              : 'Course Progress'}
          </span>
          <span className="font-semibold text-slate-900">{clampedPercentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} ${activeColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
