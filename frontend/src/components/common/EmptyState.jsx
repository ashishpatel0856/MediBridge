export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-700 mb-4 shadow-xs">
          <Icon className="h-8 w-8 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      {description && <p className="text-sm text-stone-500 max-w-sm mt-1.5 leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
