import { useEffect, useState } from 'react';
import { LogOut, CalendarCheck2, Loader2, Package } from 'lucide-react';
import { useAuthStore } from '../../../lib/authStore';
import { useNavigate } from 'react-router-dom';

export function ClientDashboard() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        const response = await fetch(`${apiUrl}/v1/client/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/client');
  };

  const requests = data?.requests || [];

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-zinc-100 flex flex-col items-center p-6 relative overflow-x-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mt-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/30">
              <CalendarCheck2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Customer Portal</h1>
              <p className="text-zinc-400 text-sm">Welcome back, {data?.person?.full_name || 'Client'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium py-2 px-4 rounded-xl transition-all"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
        
        <div className="glass p-6 sm:p-8 rounded-3xl border border-zinc-800/50">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="text-zinc-400" size={20} />
            Seus Orçamentos
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8 text-zinc-500"><Loader2 className="animate-spin" /></div>
          ) : requests.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">Você ainda não possui orçamentos solicitados.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req: any) => (
                <div key={req.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="font-medium text-white mb-1">Pacote: {req.service_type || 'Custom'}</div>
                    <div className="text-sm text-zinc-400">Data: {req.event_date}</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
