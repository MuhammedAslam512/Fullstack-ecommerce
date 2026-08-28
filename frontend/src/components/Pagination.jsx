import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '30px 0' }}>
      <button
        className="btn btn-outline"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.currentPage - 1)}
      >
        <ChevronLeft size={16} /> Prev
      </button>

      <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>

      <button
        className="btn btn-outline"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

