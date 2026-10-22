const variants = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
  blue: 'bg-sky-50 text-sky-800 border-sky-200/80',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
  rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  forest: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  gold: 'bg-amber-50 text-amber-800 border-amber-200/80',
};

const dotColors = {
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  blue: 'bg-sky-500',
  indigo: 'bg-indigo-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  gray: 'bg-slate-400',
  slate: 'bg-slate-400',
  forest: 'bg-emerald-500',
  green: 'bg-emerald-500',
  gold: 'bg-amber-500',
};

export default function Badge({
  children,
  variant = 'emerald',
  withDot = false,
  dot = false,
  className = '',
}) {
  const chosenVariant = variants[variant] || variants.emerald;
  const chosenDot = dotColors[variant] || dotColors.emerald;
  const showDot = withDot || dot;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${chosenVariant} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${chosenDot} animate-pulse`} />}
      {children}
    </span>
  );
}
