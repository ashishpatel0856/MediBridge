export default function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'animate-pulse bg-slate-200/80 rounded-xl';
  const variants = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 rounded-md',
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
}

export function DoctorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-6 w-18 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex gap-1.5 mt-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full mb-1.5" />
        <Skeleton className="h-3.5 w-5/6" />
      </div>
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
