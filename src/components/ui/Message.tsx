type MessageProps = {
  variant?: "info" | "success" | "error";
  children: React.ReactNode;
  className?: string;
};

export function Message({ variant = "info", children, className }: MessageProps) {
  return (
    <p className={className} data-variant={variant}>
      {children}
    </p>
  );
}
