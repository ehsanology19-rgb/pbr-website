export default function DeleteConfirm({ open, title = 'Delete this item?', message = 'This action cannot be undone.', onConfirm, onCancel, loading = false }) {
  if (!open) return null;

  return (
    <div className="dashboard-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <h2 className="dashboard-modal__title">{title}</h2>
        <p style={{ color: 'var(--color-text-medium)', marginBottom: 24 }}>{message}</p>
        <div className="dashboard-modal__actions">
          <button type="button" className="dashboard-btn dashboard-btn--secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="dashboard-btn dashboard-btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
