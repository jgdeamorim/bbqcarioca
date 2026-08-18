import { Flame } from 'lucide-react';

export function CareersPortalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full text-center border border-zinc-800/50">
        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-500/30">
          <Flame size={32} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4">Talent Pool</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          O portal exclusivo para Pitmasters, Auxiliares e Garçons do BBQ do Carioca.
          Em breve você poderá enviar seu portfólio, ver sua agenda e aceitar eventos diretamente por aqui.
        </p>

        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(252,109,38,0.3)] hover:shadow-[0_0_30px_rgba(252,109,38,0.5)]">
          Join the Waiting List
        </button>
      </div>
    </div>
  );
}
