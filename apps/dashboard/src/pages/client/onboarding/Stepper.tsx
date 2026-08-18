import { useState, useEffect } from 'react';
import { CalendarCheck2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';
import { decodeIntentPayload } from '../../../lib/utils';
import { useAuthStore } from '../../../lib/authStore';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Dummy key for dev

interface IntentPayload {
  date: string;
  city: string;
  guests: string;
  grill: string;
  notes: string;
}

export function ClientStepper() {
  const [step, setStep] = useState(1);
  const [correlationId] = useState(() => crypto.randomUUID());
  
  const [formData, setFormData] = useState({
    service_type: 'Premium Churrasco',
    intent: { date: '', city: '', guests: '', grill: '', notes: '' } as IntentPayload,
    identity: { full_name: '', email: '', whatsapp_phone: '' },
    turnstileToken: null as string | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydration
  useEffect(() => {
    const payload = decodeIntentPayload(window.location.hash);
    if (payload) {
      setFormData(prev => ({ ...prev, intent: { ...prev.intent, ...payload } }));
    }
  }, []);

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async () => {
    if (!formData.turnstileToken) {
      alert("Por favor, verifique que você é humano.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${apiUrl}/v1/client/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, correlationId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao processar solicitação');
      }

      const result = await response.json();
      
      // JWT Handshake Success -> AuthGuard bypass
      setAuth(result.token, 'customer');
      // The router in index.tsx will automatically navigate seamlessly
    } catch (e: any) {
      console.error(e);
      alert(`Erro: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  // State to track animation direction
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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 glass p-6 sm:p-10 rounded-3xl max-w-lg w-full border border-zinc-800/50 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/30 shrink-0">
            <CalendarCheck2 size={24} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Solicitar Orçamento</h1>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${i <= step ? 'bg-blue-500' : 'bg-zinc-800'}`} />
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
              
              {/* STEP 1: PACKAGE */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Qual pacote você deseja?</h2>
                    <p className="text-zinc-400 text-sm mt-1">Escolha o formato que melhor atende o seu evento.</p>
                  </div>
                  <div className="grid gap-3">
                    {['Premium Churrasco', 'Full Churrasco', 'The Churrasqueiro'].map((pkg) => (
                      <label key={pkg} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.service_type === pkg ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}>
                        <input 
                          type="radio" 
                          name="service_type" 
                          value={pkg}
                          checked={formData.service_type === pkg}
                          onChange={e => setFormData(p => ({ ...p, service_type: e.target.value }))}
                          className="w-4 h-4 text-blue-500 bg-transparent border-zinc-700 focus:ring-blue-500" 
                        />
                        <span className="font-medium text-zinc-200">{pkg}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: LOGISTICS */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Detalhes do Evento</h2>
                    <p className="text-zinc-400 text-sm mt-1">Verifique ou preencha as informações do local.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-400 font-medium">Data</label>
                      <input type="text" value={formData.intent.date} onChange={e => setFormData(p => ({ ...p, intent: { ...p.intent, date: e.target.value } }))} placeholder="Ex: Sábado, 15 Out" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-400 font-medium">Convidados</label>
                      <input type="text" value={formData.intent.guests} onChange={e => setFormData(p => ({ ...p, intent: { ...p.intent, guests: e.target.value } }))} placeholder="Ex: 25" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Cidade / Zip Code</label>
                    <input type="text" value={formData.intent.city} onChange={e => setFormData(p => ({ ...p, intent: { ...p.intent, city: e.target.value } }))} placeholder="Ex: Boca Raton, FL" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Observações</label>
                    <textarea value={formData.intent.notes} onChange={e => setFormData(p => ({ ...p, intent: { ...p.intent, notes: e.target.value } }))} placeholder="Alguma restrição alimentar ou detalhe importante?" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none h-20" />
                  </div>
                </div>
              )}

              {/* STEP 3: IDENTITY */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Seus Dados Pessoais</h2>
                    <p className="text-zinc-400 text-sm mt-1">Como devemos te chamar e onde enviaremos o orçamento.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Nome Completo *</label>
                    <input type="text" required value={formData.identity.full_name} onChange={e => setFormData(p => ({ ...p, identity: { ...p.identity, full_name: e.target.value } }))} placeholder="João Silva" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">Email *</label>
                    <input type="email" required value={formData.identity.email} onChange={e => setFormData(p => ({ ...p, identity: { ...p.identity, email: e.target.value } }))} placeholder="joao@email.com" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium">WhatsApp / Telefone *</label>
                    <input type="tel" required value={formData.identity.whatsapp_phone} onChange={e => setFormData(p => ({ ...p, identity: { ...p.identity, whatsapp_phone: e.target.value } }))} placeholder="+1 (555) 000-0000" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              )}

              {/* STEP 4: CHECKOUT & TURNSTILE */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Quase lá!</h2>
                    <p className="text-zinc-400 text-sm mt-2">Revise os detalhes e confirme sua solicitação.</p>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-zinc-400">Pacote:</span> <span className="font-medium text-white">{formData.service_type}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Data:</span> <span className="font-medium text-white">{formData.intent.date || 'A definir'}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Local:</span> <span className="font-medium text-white">{formData.intent.city || 'A definir'}</span></div>
                  </div>

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
              disabled={isSubmitting || !formData.turnstileToken}
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar Solicitação'}
              {!isSubmitting && <CheckCircle2 size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
