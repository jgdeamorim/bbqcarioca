import { CalendarCheck2 } from 'lucide-react';

export function ClientPortalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full text-center border border-zinc-800/50">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 border border-blue-500/30">
          <CalendarCheck2 size={32} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4">Customer Portal</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Bem-vindo ao portal do cliente do BBQ do Carioca.
          Aqui você poderá visualizar seus orçamentos (Quotes), aprovar eventos e acompanhar o status da equipe destacada para o seu churrasco.
        </p>

        <button className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Sign In
        </button>
      </div>
    </div>
  );
}
