interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
}

export default function ProgressBar({ 
  progress, 
  color = 'blue', 
  size = 'md',
  showPercentage = true,
  animated = true
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-green-600 dark:bg-green-500',
    purple: 'bg-purple-600 dark:bg-purple-500',
    orange: 'bg-orange-600 dark:bg-orange-500'
  };

  const backgroundClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30'
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div class={`w-full ${backgroundClasses[color]} rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          class={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}