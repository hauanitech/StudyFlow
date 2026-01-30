export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface-900/60 backdrop-blur-sm rounded-xl border border-surface-700/50 p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export default Card;
