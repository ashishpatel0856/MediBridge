export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-white border-slate-200/90 text-slate-900',
    flat: 'bg-slate-50 border-slate-200/80 text-slate-900',
    soft: 'bg-emerald-50/50 border-emerald-100 text-slate-900',
    highlight: 'bg-gradient-to-br from-emerald-50/60 to-sky-50/40 border-emerald-100/80',
    outline: 'bg-transparent border-slate-200 text-slate-900',
  };

  const hoverStyle = hover
    ? 'hover:shadow-card-hover hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200'
    : 'transition-shadow duration-150';

  return (
    <div
      className={`rounded-2xl border shadow-card ${variants[variant] || variants.default} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
