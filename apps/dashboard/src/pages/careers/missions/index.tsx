import { LogOut, Flame } from 'lucide-react';

export function MissionsDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full text-center border border-zinc-800/50">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/30">
          <Flame size={32} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4">Talent Missions</h1>
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
          <p className="text-amber-400 font-medium text-sm">
            STATUS: Candidatura em Análise
          </p>
          <p className="text-amber-400/80 text-xs mt-1">
            Seu perfil está aguardando a aprovação do Superadmin. Assim que liberado, você receberá missões de acordo com seu raio de distância.
          </p>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium py-3 px-6 rounded-xl transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
