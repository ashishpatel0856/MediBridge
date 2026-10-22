export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          className={`w-full px-3.5 py-2.5 ${
            Icon ? 'pl-10' : ''
          } border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
            error
              ? 'border-rose-400 bg-rose-50/30 text-rose-950 placeholder-rose-300'
              : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 hover:border-slate-400'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium mt-0.5">{error}</p>}
    </div>
  );
}
