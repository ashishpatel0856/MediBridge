const variants = {
  info: 'bg-sky-50 border-sky-200 text-sky-900',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
  warning: 'bg-amber-50 border-amber-200 text-amber-950',
  error: 'bg-rose-50 border-rose-200 text-rose-950',
};

export default function Alert({ children, variant = 'info', className = '' }) {
  return (
    <div
      role="alert"
      className={`px-4 py-3 rounded-xl border text-sm font-medium leading-relaxed ${
        variants[variant] || variants.info
      } ${className}`}
    >
      {children}
    </div>
  );
}
