import { NavLink } from 'react-router-dom';

export default function Sidebar({ links }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="mb-3 px-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
      </div>
      <nav className="flex flex-col gap-1.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`
            }
          >
            {Icon && (
              <Icon className="h-4.5 w-4.5 shrink-0 transition-colors text-inherit" />
            )}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
