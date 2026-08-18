import { LogOut, CalendarCheck2 } from 'lucide-react';

export function ClientDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full text-center border border-zinc-800/50">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/30">
          <CalendarCheck2 size={32} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4">Customer Portal</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Welcome back! You are securely logged in.
          Here you will manage your invoices, approve event quotes, and review your assigned team.
        </p>

        <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium py-3 px-6 rounded-xl transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
