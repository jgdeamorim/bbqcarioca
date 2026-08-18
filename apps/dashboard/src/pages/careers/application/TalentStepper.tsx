import { UserPlus, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function TalentStepper() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full border border-zinc-800/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/30">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Talent Application</h1>
            <p className="text-sm text-zinc-400">Step {step} of 4</p>
          </div>
        </div>

        {/* Stepper Content Placeholder */}
        <div className="min-h-[200px] mb-8">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-semibold">What is your expertise?</h2>
              <p className="text-zinc-400 text-sm">Select the roles you are applying for (Dynamic fetch from D1 later).</p>
              
              <div className="grid gap-3 mt-6">
                {['Master Pitmaster', 'Assistant / Server', 'Bartender'].map((role) => (
                  <label key={role} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 text-amber-500 bg-transparent border-zinc-700 rounded" />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {step > 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-semibold">More details...</h2>
              <p className="text-zinc-400 text-sm">We will add zipcode matching, distance radius, and legal rules here.</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-zinc-800/50">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className="text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          
          <button 
            onClick={() => setStep(s => Math.min(4, s + 1))}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            {step === 4 ? 'Submit Application' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
