import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";

interface AuthLeftPanelProps {
  title: string;
  subtitle?: string;
  features: string[];
  imageSrc?: string;
}

export default function AuthLeftPanel({
  title,
  subtitle,
  features,
  imageSrc,
}: AuthLeftPanelProps) {
  const year = new Date().getFullYear();

  return (
    <div className="flex h-full w-full flex-col justify-between bg-gradient-to-b from-blue-500 to-blue-900 px-10 py-10 text-white">
      <div className="space-y-8">
        <Link href="/" className="inline-flex items-center gap-3 text-white hover:text-blue-100">
          <Logo variant="light" size="lg" />
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">{title}</h1>
          {subtitle ? <p className="max-w-lg text-sm leading-7 text-blue-100/90">{subtitle}</p> : null}
        </div>

        {imageSrc ? (
          <div className="mx-auto w-full max-w-[360px]">
            <Image src={imageSrc} alt="Ilustración" width={360} height={260} className="mx-auto h-auto w-full object-contain" style={{ width: 'auto', height: 'auto' }} priority />
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm ring-1 ring-white/10">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm leading-6 text-blue-100/90">{feature}</p>
            </div>
          ))}
        </div>

        <div className="text-sm text-blue-100/70">© {year} InnovSystem. Todos los derechos reservados.</div>
      </div>
    </div>
  );
}
