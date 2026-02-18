import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { Tables } from '@/lib/database.types';

interface UsersViewProps {
  associationId: string | null;
  isReisAdmin: boolean;
}

export default function UsersView({ associationId: _associationId, isReisAdmin }: UsersViewProps) {
  const [accounts, setAccounts] = useState<Tables<'spolky_accounts'>[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spolky_accounts')
        .select('*')
        .order('association_name');
      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Chyba načítání účtů');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReisAdmin) fetchAccounts();
  }, [isReisAdmin, fetchAccounts]);

  if (!isReisAdmin) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body items-center text-center py-16">
          <Users className="w-12 h-12 text-error/60 mb-2" />
          <h2 className="card-title text-xl">Přístup odepřen</h2>
          <p className="text-base-content/60 max-w-md">
            Tato stránka je přístupná pouze administrátorům reIS.
          </p>
        </div>
      </div>
    );
  }

  const handleToggleActive = async (account: Tables<'spolky_accounts'>) => {
    const newValue = !account.is_active;
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, is_active: newValue } : a))
    );
    const { error } = await supabase
      .from('spolky_accounts')
      .update({ is_active: newValue })
      .eq('id', account.id);
    if (error) {
      toast.error('Chyba při ukládání');
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, is_active: account.is_active } : a))
      );
    } else {
      toast.success(newValue ? 'Účet aktivován' : 'Účet deaktivován');
    }
  };

  const handleCycleRole = async (account: Tables<'spolky_accounts'>) => {
    const newRole = account.role === 'reis_admin' ? 'association' : 'reis_admin';
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, role: newRole } : a))
    );
    const { error } = await supabase
      .from('spolky_accounts')
      .update({ role: newRole })
      .eq('id', account.id);
    if (error) {
      toast.error('Chyba při ukládání role');
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, role: account.role } : a))
      );
    } else {
      toast.success(`Role změněna na ${newRole}`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-xl px-1 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Všechny účty
      </h3>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
          <div className="skeleton h-20 w-full rounded-box opacity-20"></div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-12">
            <Users className="w-10 h-10 text-base-content/30 mb-2" />
            <p className="text-base-content/60">Žádné účty nenalezeny</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body p-4 flex-row items-center gap-4">
                {/* Avatar */}
                <div className="avatar flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-base-200 border border-base-300 flex items-center justify-center">
                    <img
                      src={`/spolky/${account.association_id}.jpg`}
                      alt={account.association_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerText = account.association_name?.[0] || '?';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{account.association_name}</p>
                  <p className="text-sm text-base-content/60 truncate">{account.email}</p>
                </div>

                {/* Role badge */}
                <button
                  onClick={() => handleCycleRole(account)}
                  className={`badge cursor-pointer select-none ${
                    account.role === 'reis_admin' ? 'badge-primary' : 'badge-ghost'
                  }`}
                  title="Kliknutím změnit roli"
                >
                  {account.role}
                </button>

                {/* is_active toggle */}
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={account.is_active ?? false}
                  onChange={() => handleToggleActive(account)}
                  title={account.is_active ? 'Deaktivovat' : 'Aktivovat'}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
