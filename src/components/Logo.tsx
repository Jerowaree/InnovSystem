interface LogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const titleClass = variant === "light" ? "text-white" : "text-slate-950";
  const subtitleClass = variant === "light" ? "text-white/80" : "text-[#2563EB]";

  const sizeClasses = {
    sm: { container: "h-10 w-10", title: "text-sm", subtitle: "text-[9px]" },
    md: { container: "h-11 w-11", title: "text-base", subtitle: "text-[10px]" },
    lg: { container: "h-12 w-12", title: "text-lg", subtitle: "text-[11px]" },
  }[size];

  const barClasses = variant === "light"
    ? ["bg-white/90", "bg-slate-200", "bg-slate-300", "bg-slate-100"]
    : ["bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600"];

  return (
    <div className="inline-flex items-center gap-3">
      <div className={`inline-flex ${sizeClasses.container} items-center justify-center rounded-2xl bg-transparent`}>
        <div className="flex items-end gap-1">
          <span className={`inline-block h-2 w-2 rounded-sm ${barClasses[0]}`} />
          <span className={`inline-block h-4 w-2 rounded-sm ${barClasses[1]}`} />
          <span className={`inline-block h-6 w-2 rounded-sm ${barClasses[2]}`} />
          <span className={`inline-block h-8 w-2 rounded-sm ${barClasses[3]}`} />
        </div>
      </div>
      <div className="leading-[1.05]">
        <p className={`font-semibold tracking-[-0.02em] ${titleClass} ${sizeClasses.title}`}>InnovSystem</p>
        <p className={`uppercase tracking-[0.3em] ${subtitleClass} ${sizeClasses.subtitle}`}>Transporte</p>
      </div>
    </div>
  );
}
