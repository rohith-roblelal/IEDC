import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'danger' | 'secondary';
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText = 'Processing...',
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseClasses = "flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  if (variant === 'primary') {
    variantClasses = "bg-purple-600 hover:bg-purple-700 text-white";
  } else if (variant === 'danger') {
    variantClasses = "text-red-400 hover:text-red-300";
  } else if (variant === 'secondary') {
    variantClasses = "bg-white/10 hover:bg-white/20 text-white";
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
