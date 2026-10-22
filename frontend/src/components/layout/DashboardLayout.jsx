import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ sidebarLinks, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {sidebarLinks && <Sidebar links={sidebarLinks} />}
        <main className="flex-1 p-5 sm:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
