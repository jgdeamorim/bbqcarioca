import { Users, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Overview</h2>
        <p className="text-zinc-400 mt-2">Real-time operational metrics and field-service status.</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="tech-bento-grid">
        
        {/* KPI: Upcoming Events */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-sm font-medium uppercase tracking-wider">Upcoming Events</span>
            <CalendarDays size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-4xl font-bold text-zinc-100">12</div>
            <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-emerald-500 font-medium">+2</span> since last week
            </p>
          </div>
        </div>

        {/* KPI: Pending Quotes */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-sm font-medium uppercase tracking-wider">Pending Quotes</span>
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-4xl font-bold text-zinc-100">5</div>
            <p className="text-sm text-zinc-500 mt-2">Requires Regional Manager action</p>
          </div>
        </div>

        {/* KPI: Available Staff */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-sm font-medium uppercase tracking-wider">Staff Availability</span>
            <Users size={20} className="text-blue-500" />
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-4xl font-bold text-zinc-100">24</div>
              <p className="text-sm text-zinc-500 mt-2">Total active talent profiles</p>
            </div>
            <div className="flex-1">
              {/* Fake Bar Chart */}
              <div className="h-12 flex items-end gap-2">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-zinc-800 rounded-t-sm relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-primary/60 rounded-t-sm transition-all duration-500"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Scheduling Preview */}
        <div className="glass p-6 rounded-2xl md:col-span-2 lg:col-span-4 min-h-[300px]">
          <h3 className="text-lg font-bold text-zinc-100 mb-6">Upcoming Schedule (Next 7 Days)</h3>
          
          <div className="space-y-4">
            {/* Display Card Skew Placeholder */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
                  <span className="text-xs text-zinc-500 font-bold uppercase">Aug</span>
                  <span className="text-lg font-bold text-zinc-100">24</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100">Corporate BBQ Catering</h4>
                  <p className="text-sm text-zinc-400">Miami, FL • 150 Guests • Requires 3 Pitmasters</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold tracking-wider">FULLY STAFFED</span>
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
                  <span className="text-xs text-amber-500 font-bold uppercase">Aug</span>
                  <span className="text-lg font-bold text-amber-500">26</span>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100">Wedding Rehearsal Dinner</h4>
                  <p className="text-sm text-zinc-400">Orlando, FL • 50 Guests • Requires 1 Pitmaster</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold tracking-wider">STAFFING PENDING</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
