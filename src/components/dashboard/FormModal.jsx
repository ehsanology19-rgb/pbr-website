export default function FormModal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="dashboard-modal__title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
