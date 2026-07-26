import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-6 text-[#C4C4D4] text-sm">
      <div>
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
