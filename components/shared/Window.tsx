export interface WindowProps {
  title: string;
  icon?: "red" | "green" | "blue" | "yellow" | "purple" | "orange";
  children: React.ReactNode;
  className?: string;
  submenu?: { label: string; onClick?: () => void }[];
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function Window({
  title,
  icon = "blue",
  children,
  className = "",
  submenu,
  onClose,
  onMinimize,
  onMaximize,
}: WindowProps) {
  return (
    <div className={`window win-window ${className}`}>
      <div className="title-bar">
        <div className="title-bar-text">
          <span className={`win-icon win-icon--${icon}`} />
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Maximize" onClick={onMaximize} />
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      {submenu && submenu.length > 0 && (
        <div className="win-submenu">
          {submenu.map((item) => (
            <button
              key={item.label}
              className="win-submenu-btn"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="window-body">{children}</div>
    </div>
  );
}
