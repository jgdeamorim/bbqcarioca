import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, DollarSign } from 'lucide-react';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass md:h-screen sticky top-0 z-50 flex flex-col">
        <div className="p-6 border-b border-zinc-800/50">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">BBQ do Carioca</h1>
          <p className="text-xs text-primary font-medium mt-1 uppercase tracking-wider">Control Plane</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/admin/customers" icon={<Users size={20} />} label="Customers" disabled />
          <NavItem to="/admin/events" icon={<CalendarDays size={20} />} label="Events" disabled />
          <NavItem to="/admin/financial" icon={<DollarSign size={20} />} label="Financial" disabled />
        </nav>
        
        <div className="p-4 border-t border-zinc-800/50 text-xs text-zinc-500 text-center">
          v7.16 Sovereign
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-8 thumb-zone">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, disabled }: { to: string; icon: React.ReactNode; label: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-600 cursor-not-allowed">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive 
            ? 'bg-primary/10 text-primary border border-primary/20' 
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
        }`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
