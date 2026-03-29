type LoaderProps = { className?: string; label?: string };

export function Loader({ className, label = "Loading" }: LoaderProps) {
  return (
    <div className={className} role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
    </div>
  );
}
