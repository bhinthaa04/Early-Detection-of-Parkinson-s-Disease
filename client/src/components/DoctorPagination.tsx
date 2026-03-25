import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  dataLength: number;
  children: React.ReactNode;
  pageSize?: number;
}

export function DoctorPagination({ dataLength, children, pageSize = 5 }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(dataLength / pageSize);

  if (totalPages <= 1) return <>{children}</>;

  const startIndex = (currentPage - 1) * pageSize;
  const visibleChildren = Array.isArray(children) 
    ? children.slice(startIndex, startIndex + pageSize)
    : children;

  return (
    <>
      {visibleChildren}
      <div className="mt-8 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="h-10 px-4 border-white/30 hover:bg-white/20 shadow-md"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 shadow-md ${page === currentPage ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25' : 'border-white/30 hover:bg-white/20 hover:shadow-md'}`}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-10 px-4 border-white/30 hover:bg-white/20 shadow-md"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        
        <div className="text-sm text-white/80 ml-4 font-medium">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </>
  );
}
