import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, Plus, Pencil } from 'lucide-react';
import { Tables } from '@/lib/database.types';

const tempSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

interface UsersViewProps {
  associationId: string | null;
  isReisAdmin: boolean;
}

export default function UsersView({ associationId: _associationId, isReisAdmin }: UsersViewProps) {
  const [accounts, setAccounts] = useState<Tables<'spolky_accounts'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editAccount, setEditAccount] = useState<Tables<'spolky_accounts'> | null>(null);
  const createModalRef = useRef<HTMLDialogElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    association_name: '',
    association_id: '',
    email: '',
    password: '',
    role: 'association',
    is_active: true,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    association_name: '',
    association_id: '',
    email: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    showCreate ? createModalRef.current?.showModal() : createModalRef.current?.close();
  }, [showCreate]);

  useEffect(() => {
    if (editAccount) {
      setEditForm({
        association_name: editAccount.association_name ?? '',
        association_id: editAccount.association_id ?? '',
        email: editAccount.email ?? '',
      });
      editModalRef.current?.showModal();
    } else {
      editModalRef.current?.close();
    }
  }, [editAccount]);

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



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error: authErr } = await tempSupabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
      });
      if (authErr) { toast.error(authErr.message); return; }

      const { error: dbErr } = await supabase.from('spolky_accounts').insert({
        email: createForm.email,
        association_id: createForm.association_id,
        association_name: createForm.association_name,
        role: createForm.role,
        is_active: createForm.is_active,
      });
      if (dbErr) { toast.error(dbErr.message); return; }

      toast.success('Účet vytvořen – potvrzovací e-mail byl odeslán');
      setShowCreate(false);
      setCreateForm({ association_name: '', association_id: '', email: '', password: '', role: 'association', is_active: true });
      fetchAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('spolky_accounts')
        .update({
          association_name: editForm.association_name,
          association_id: editForm.association_id,
          email: editForm.email,
        })
        .eq('id', editAccount.id);
      if (error) { toast.error('Chyba při ukládání'); return; }
      toast.success('Účet upraven');
      setEditAccount(null);
      fetchAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl px-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Všechny účty
        </h3>
        <button className="btn btn-primary btn-sm gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Přidat účet
        </button>
      </div>

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

                {/* Edit button */}
                <button
                  onClick={() => setEditAccount(account)}
                  className="btn btn-ghost btn-xs"
                  title="Upravit"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Role badge */}
                <span
                  className={`badge ${
                    account.role === 'reis_admin' ? 'badge-primary' : 'badge-ghost'
                  }`}
                >
                  {account.role}
                </span>

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

      {/* Create modal */}
      <dialog ref={createModalRef} className="modal bg-base-300/50 backdrop-blur-sm">
        <div className="modal-box p-0 overflow-hidden border border-base-content/10">
          <div className="flex items-center justify-between p-6 border-b border-base-content/10 bg-base-100">
            <h3 className="font-bold text-lg">Přidat účet</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowCreate(false)}>✕</button>
            </form>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">Název spolku</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={createForm.association_name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, association_name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">ID spolku</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="např. mendelu (použito pro /spolky/mendelu.jpg)"
                  value={createForm.association_id}
                  onChange={(e) => setCreateForm((f) => ({ ...f, association_id: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">E-mail</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">Heslo</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                  <span className="label-text">Aktivní účet</span>
                </label>
              </div>
              <p className="text-xs text-base-content/50">
                Na zadaný e-mail bude odeslán potvrzovací e-mail Supabase.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreate(false)}
                >
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : 'Vytvořit'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowCreate(false)}>close</button>
        </form>
      </dialog>

      {/* Edit modal */}
      <dialog ref={editModalRef} className="modal bg-base-300/50 backdrop-blur-sm">
        <div className="modal-box p-0 overflow-hidden border border-base-content/10">
          <div className="flex items-center justify-between p-6 border-b border-base-content/10 bg-base-100">
            <h3 className="font-bold text-lg">Upravit účet</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setEditAccount(null)}>✕</button>
            </form>
          </div>
          <div className="p-6">
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">Název spolku</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editForm.association_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, association_name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">ID spolku</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editForm.association_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, association_id: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-semibold">E-mail</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditAccount(null)}
                >
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : 'Uložit'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setEditAccount(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}
