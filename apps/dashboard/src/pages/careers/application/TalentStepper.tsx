import { useState } from 'react';
import { UserPlus, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export function TalentStepper() {
  const [step, setStep] = useState(1);
  const [correlationId] = useState(() => crypto.randomUUID());
  
  const [formData, setFormData] = useState({
    identity: { full_name: '', email: '', whatsapp_phone: '' },
    skills: [] as string[],
    logistics: { zip_code: '', max_travel_miles: 35 },
    legal_accepted: false,
    turnstileToken: null as string | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleSubmit = async () => {
    if (!formData.turnstileToken || !formData.legal_accepted) {
      alert("Por favor, aceite os termos e verifique que você é humano.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Submitting B2B Application:", { ...formData, correlationId });
      alert("Candidatura enviada com sucesso! Em análise.");
      // window.location.href = '/careers/missions'
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  const [direction, setDirection] = useState(1);
  
  const goToNextStep = () => {
    setDirection(1);
    handleNext();
  };

  const goToPrevStep = () => {
    setDirection(-1);
    handleBack();
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-6 sm:p-10 rounded-3xl max-w-lg w-full border border-zinc-800/50 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/30 shrink-0">
            <UserPlus size={24} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Join the Team</h1>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${i <= step ? 'bg-amber-500' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[320px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 w-full"
            >
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Dados Pessoais</h2>
                    <p className="text-zinc-400 text-sm mt-1">Como devemos contatar você?</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Nome Completo *</label>
                    <input type="text" required value={formData.identity.full_name} onChange={e => setFormData(p => ({ ...p, identity: { ...p.identity, full_name: e.target.value } }))} placeholder="João Silva" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Email *</label>
                    <input type="email" required value={formData.identity.email} onChange={e => setFormData(p => ({ ...p, identity: { ...p.identity, email: e.target.value } }))} placeholder="joao@email.com" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">WhatsApp / Telefone *</label>
                    <input type="tel" required value={formData.identity.whatsapp_phone} onChange={e => setFormData(p => ({ ...p, identity: { ...p.identity, whatsapp_phone: e.target.value } }))} placeholder="+1 (555) 000-0000" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                </div>
              )}

              {/* STEP 2: SKILLS */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Sua Especialidade</h2>
                    <p className="text-zinc-400 text-sm mt-1">Selecione todas as funções que você domina.</p>
                  </div>
                  <div className="grid gap-3">
                    {['Master Pitmaster', 'Assistant / Server', 'Bartender', 'Event Setup'].map((skill) => {
                      const isSelected = formData.skills.includes(skill);
                      return (
                        <label key={skill} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSkill(skill)}
                            className="w-4 h-4 text-amber-500 bg-zinc-900 border-zinc-700 rounded focus:ring-amber-500" 
                          />
                          <span className="font-medium text-zinc-200">{skill}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: LOGISTICS (ZIP CODE) */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Logística & Deslocamento</h2>
                    <p className="text-zinc-400 text-sm mt-1">Para conectarmos você aos eventos mais próximos.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Seu Zip Code Atual *</label>
                    <input type="text" value={formData.logistics.zip_code} onChange={e => setFormData(p => ({ ...p, logistics: { ...p.logistics, zip_code: e.target.value } }))} placeholder="Ex: 33431" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <label className="text-sm text-zinc-400 font-medium">Raio Máximo de Deslocamento: <span className="text-amber-400">{formData.logistics.max_travel_miles} milhas</span></label>
                    <input 
                      type="range" 
                      min="5" max="100" step="5"
                      value={formData.logistics.max_travel_miles} 
                      onChange={e => setFormData(p => ({ ...p, logistics: { ...p.logistics, max_travel_miles: parseInt(e.target.value) } }))}
                      className="w-full accent-amber-500" 
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>5 mi</span>
                      <span>100 mi</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LEGAL & TURNSTILE */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Último Passo</h2>
                    <p className="text-zinc-400 text-sm mt-1">Concordância legal e segurança anti-spam.</p>
                  </div>
                  
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.legal_accepted}
                      onChange={e => setFormData(p => ({ ...p, legal_accepted: e.target.checked }))}
                      className="w-4 h-4 mt-1 text-amber-500 bg-zinc-900 border-zinc-700 rounded focus:ring-amber-500" 
                    />
                    <span className="text-sm text-zinc-300 leading-relaxed">
                      Eu declaro que sou legalmente autorizado a trabalhar nos Estados Unidos (EEOC Compliance) e concordo com a política de retenção de dados da plataforma.
                    </span>
                  </label>

                  <div className="flex justify-center pt-2">
                    <Turnstile 
                      siteKey={TURNSTILE_SITE_KEY} 
                      onSuccess={(token) => setFormData(p => ({ ...p, turnstileToken: token }))}
                      options={{ theme: 'dark' }}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 mt-4 border-t border-zinc-800/50">
          <button 
            disabled={step === 1 || isSubmitting}
            onClick={goToPrevStep}
            className="flex items-center gap-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors px-2 py-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          
          {step < 4 ? (
            <button 
              onClick={goToNextStep}
              className="bg-white text-black hover:bg-zinc-200 font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-white/10"
            >
              Continuar
              <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              disabled={isSubmitting || !formData.turnstileToken || !formData.legal_accepted}
              onClick={handleSubmit}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Candidatura'}
              {!isSubmitting && <CheckCircle2 size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
