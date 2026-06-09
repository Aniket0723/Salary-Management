import { Link, useLocation } from 'react-router-dom';
import { Building2, Database, LayoutDashboard, Users } from 'lucide-react';
import { preloadRoute, type AppRoutePath } from '../lib/routePreloaders';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const nav: Array<{ path: AppRoutePath; label: string; icon: typeof LayoutDashboard }> = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', label: 'Employees', icon: Users },
  ];

  return (
    <div className="min-h-screen text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col border-r border-slate-200 bg-white/95 shadow-[6px_0_24px_rgba(15,23,42,0.04)] backdrop-blur md:flex">
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-950">ACME HR</h1>
              <p className="text-xs font-medium text-slate-500">Salary Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          {nav.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => preloadRoute(item.path)}
                onFocus={() => preloadRoute(item.path)}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-md ${
                  active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 group-hover:bg-white group-hover:text-slate-700'
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Building2 className="h-4 w-4 text-emerald-700" />
            ACME Org
          </div>
          <p className="text-xs leading-5 text-slate-500">Compensation records and payroll analytics for HR managers.</p>
        </div>
      </aside>

      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
        <div className="mb-3 flex items-center gap-2 font-bold text-slate-950">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-white">
            <Database className="h-4 w-4" />
          </span>
          ACME HR
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => preloadRoute(item.path)}
                onFocus={() => preloadRoute(item.path)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-semibold ${
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="px-4 py-6 md:ml-72 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
