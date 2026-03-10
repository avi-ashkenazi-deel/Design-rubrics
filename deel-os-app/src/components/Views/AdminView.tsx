import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { fetchAllUserPermissions, upsertUserPermissions, deleteUserPermissions } from '../../utils/supabaseApi';
import type { UserPermissions, VisibleView } from '../../types';

const ALL_VIEWS: { value: VisibleView; label: string }[] = [
  { value: 'competencies', label: 'Competencies' },
  { value: 'rubrics', label: 'Rubrics' },
  { value: 'ladders', label: 'Ladders' },
  { value: 'admin', label: 'Admin' },
];

const ALL_TRACKS = ['IC', 'Manager'];
const ALL_DISCIPLINES = ['Design', 'Engineering'];
const ALL_LEVELS = ['Junior Designer', 'Mid Designer', 'Senior Designer', 'Staff Designer', 'Principal Designer', 'Director'];

const ROLE_OPTIONS: { value: UserPermissions['role']; label: string }[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'super_viewer', label: 'Super Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

function PermissionEditor({
  perm,
  onSave,
  onDelete,
  onCancel,
}: {
  perm: UserPermissions;
  onSave: (p: UserPermissions) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<UserPermissions>(perm);

  const toggleView = (v: VisibleView) => {
    setDraft(d => ({
      ...d,
      visibleViews: d.visibleViews.includes(v)
        ? d.visibleViews.filter(x => x !== v)
        : [...d.visibleViews, v],
    }));
  };

  const toggleTrack = (t: string) => {
    setDraft(d => ({
      ...d,
      visibleTracks: d.visibleTracks.includes(t)
        ? d.visibleTracks.filter(x => x !== t)
        : [...d.visibleTracks, t],
    }));
  };

  const toggleDiscipline = (d: string) => {
    setDraft(prev => {
      const current = prev.allowedDisciplines ?? [];
      const updated = current.includes(d) ? current.filter(x => x !== d) : [...current, d];
      return { ...prev, allowedDisciplines: updated.length > 0 ? updated : null };
    });
  };

  return (
    <div className="admin-perm-editor">
      <div className="admin-field">
        <label>Email</label>
        <input
          type="email"
          value={draft.email}
          onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
          placeholder="user@deel.com"
          disabled={!!perm.email}
        />
      </div>

      <div className="admin-field">
        <label>Role</label>
        <div className="admin-pills">
          {ROLE_OPTIONS.map(r => (
            <button
              key={r.value}
              className={`admin-pill ${draft.role === r.value ? 'active' : ''}`}
              onClick={() => setDraft(d => {
                const base = { ...d, role: r.value };
                if (r.value === 'super_viewer') {
                  return {
                    ...base,
                    canEdit: false,
                    visibleViews: ALL_VIEWS.filter(v => v.value !== 'admin').map(v => v.value),
                    visibleTracks: [...ALL_TRACKS],
                    allowedDisciplines: null,
                  };
                }
                return { ...base, canEdit: r.value === 'editor' || r.value === 'admin' };
              })}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-field">
        <label>Visible Views</label>
        <div className="admin-pills">
          {ALL_VIEWS.map(v => (
            <button
              key={v.value}
              className={`admin-pill ${draft.visibleViews.includes(v.value) ? 'active' : ''}`}
              onClick={() => toggleView(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-field">
        <label>Visible Tracks</label>
        <div className="admin-pills">
          {ALL_TRACKS.map(t => (
            <button
              key={t}
              className={`admin-pill ${draft.visibleTracks.includes(t) ? 'active' : ''}`}
              onClick={() => toggleTrack(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-field">
        <label>Allowed Disciplines</label>
        <div className="admin-pills">
          <button
            className={`admin-pill ${!draft.allowedDisciplines ? 'active' : ''}`}
            onClick={() => setDraft(d => ({ ...d, allowedDisciplines: null }))}
          >
            All
          </button>
          {ALL_DISCIPLINES.map(d => (
            <button
              key={d}
              className={`admin-pill ${draft.allowedDisciplines?.includes(d) ? 'active' : ''}`}
              onClick={() => toggleDiscipline(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-field">
        <label>Designer Level</label>
        <select
          value={draft.designerLevel ?? ''}
          onChange={e => setDraft(d => ({ ...d, designerLevel: e.target.value || null }))}
        >
          <option value="">Not set</option>
          {ALL_LEVELS.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="admin-editor-actions">
        <button className="admin-btn admin-btn-save" onClick={() => onSave(draft)}>
          Save
        </button>
        <button className="admin-btn admin-btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        {onDelete && (
          <button className="admin-btn admin-btn-delete" onClick={onDelete}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminView() {
  const { permissions: myPerms } = useSupabaseAuth();
  const [allPerms, setAllPerms] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllUserPermissions();
    setAllPerms(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (myPerms.role !== 'admin') {
    return <div className="empty-state"><h3>Access denied</h3></div>;
  }

  const handleSave = async (p: UserPermissions) => {
    if (!p.email.toLowerCase().endsWith('@deel.com')) {
      showToast('Only @deel.com email addresses are allowed');
      return;
    }
    try {
      await upsertUserPermissions(p);
      showToast(`Saved permissions for ${p.email}`);
      setEditingEmail(null);
      setAddingNew(false);
      await load();
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove permissions for ${email}?`)) return;
    try {
      await deleteUserPermissions(email);
      showToast(`Removed ${email}`);
      setEditingEmail(null);
      await load();
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const newPerm: UserPermissions = {
    email: '',
    role: 'viewer',
    canEdit: false,
    visibleViews: ['competencies', 'ladders'],
    visibleTracks: ['IC'],
    allowedDisciplines: null,
    designerLevel: null,
  };

  return (
    <div className="admin-view">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-header">
        <div>
          <h2 className="admin-title">User Permissions</h2>
          <p className="admin-subtitle">Manage who can see and edit what across the platform</p>
        </div>
        <button
          className="admin-btn admin-btn-add"
          onClick={() => { setAddingNew(true); setEditingEmail(null); }}
          disabled={addingNew}
        >
          + Add User
        </button>
      </div>

      {addingNew && (
        <div className="admin-card admin-card-new">
          <div className="admin-card-header">
            <span className="admin-card-title">New User</span>
          </div>
          <PermissionEditor
            perm={newPerm}
            onSave={handleSave}
            onCancel={() => setAddingNew(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading permissions...</div>
      ) : allPerms.length === 0 ? (
        <div className="empty-state">
          <h3>No permissions configured</h3>
          <p>Add your first user above.</p>
        </div>
      ) : (
        <div className="admin-list">
          {allPerms.map(p => (
            <div key={p.email} className="admin-card">
              <div
                className="admin-card-header"
                onClick={() => setEditingEmail(editingEmail === p.email ? null : p.email)}
              >
                <div className="admin-card-info">
                  <span className="admin-card-email">{p.email}</span>
                  <span className={`admin-role-badge admin-role-${p.role}`}>{p.role}</span>
                </div>
                <div className="admin-card-meta">
                  <span className="admin-meta-item">
                    {p.visibleViews.length} view{p.visibleViews.length !== 1 ? 's' : ''}
                  </span>
                  <span className="admin-meta-item">
                    {p.visibleTracks.join(', ')}
                  </span>
                  <span className="admin-chevron">{editingEmail === p.email ? '▾' : '›'}</span>
                </div>
              </div>
              {editingEmail === p.email && (
                <PermissionEditor
                  perm={p}
                  onSave={handleSave}
                  onDelete={p.email !== myPerms.email ? () => handleDelete(p.email) : undefined}
                  onCancel={() => setEditingEmail(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
