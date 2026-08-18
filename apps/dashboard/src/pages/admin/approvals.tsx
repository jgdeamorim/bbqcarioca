import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api-client';
import { Loader2, AlertCircle, CheckCircle, Flame } from 'lucide-react';

export function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quick hack state for quote form
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [price, setPrice] = useState(1000);
  const [staffCost, setStaffCost] = useState(400);

  const loadPending = async () => {
    setLoading(true);
    try {
      const [reqsRes, talentsRes] = await Promise.all([
        fetchWithAuth('/v1/admin/approvals/pending-requests'),
        fetchWithAuth('/v1/admin/approvals/pending-talents')
      ]);
      const reqsData = await reqsRes.json();
      const talentsData = await talentsRes.json();
      setRequests(reqsData.requests || []);
      setTalents(talentsData.talents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApproveRequest = async (id: string) => {
    try {
      const margin = price - staffCost;
      const res = await fetchWithAuth('/v1/admin/approvals/quotes', {
        method: 'POST',
        body: JSON.stringify({
          service_request_id: id,
          total_price: price,
          staff_cost: staffCost,
          margin: margin
        })
      });
      if (res.ok) {
        setActiveRequest(null);
        loadPending();
      } else {
        const data = await res.json();
        alert('Error: ' + JSON.stringify(data.error));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveTalent = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/v1/admin/approvals/talent/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        loadPending();
      } else {
        alert('Error approving talent');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading Pending Approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Approvals</h2>
        <p className="text-zinc-400 mt-2">Manage pending Service Requests and Talent Profiles.</p>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="inline-block mr-2" size={18} />
          {error}
        </div>
      )}

      {/* Pending Service Requests */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-zinc-100">Service Requests (Quotes)</h3>
        {requests.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-zinc-500">
            <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
            <p>No pending service requests.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map(req => (
              <div key={req.id} className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h4 className="font-bold text-white text-lg">{req.service_type} - {req.full_name}</h4>
                  <p className="text-sm text-zinc-400 mt-1">Date: {req.event_date} | Guests: {req.guests}</p>
                  <p className="text-xs text-zinc-500 mt-1">Email: {req.email} | Phone: {req.whatsapp_phone}</p>
                </div>
                
                {activeRequest === req.id ? (
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 w-full md:w-auto">
                    <div className="flex gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Total Price ($)</label>
                        <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 w-24 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Staff Cost ($)</label>
                        <input type="number" value={staffCost} onChange={e => setStaffCost(Number(e.target.value))} className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 w-24 text-white" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveRequest(req.id)} className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary/90">Confirm Quote</button>
                      <button onClick={() => setActiveRequest(null)} className="text-zinc-400 hover:text-white px-3 py-1.5 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveRequest(req.id)}
                    className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Generate Quote
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Talents */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-zinc-100">Talent Profiles</h3>
        {talents.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-zinc-500">
            <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
            <p>No pending talent profiles.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {talents.map(talent => (
              <div key={talent.id} className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    <Flame size={18} className="text-amber-500" />
                    {talent.full_name}
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">Zip Code: {talent.zip_code} | Experience: {talent.experience_years}y</p>
                  <p className="text-xs text-zinc-500 mt-1">Email: {talent.email} | Phone: {talent.whatsapp_phone}</p>
                </div>
                
                <button 
                  onClick={() => handleApproveTalent(talent.id)}
                  className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Approve Talent
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
