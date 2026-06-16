const trustPartners = [
  { name: "Transandes", subtitle: "Logística", initials: "TA" },
  { name: "Cargarperú", subtitle: "Transporte", initials: "CP" },
  { name: "Vía Express", subtitle: "", initials: "VE" },
  { name: "Rutas del Sur", subtitle: "Soluciones", initials: "RS" },
  { name: "Logimovil", subtitle: "Soluciones", initials: "LM" },
  { name: "Pacífico Cargo", subtitle: "Transporte", initials: "PC" },
];

export default function TrustSection() {
  return (
    <section className="relative right-1/2 left-1/2 mx-[-50vw] w-[100vw] bg-slate-100 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 sm:px-8">
        <p className="text-center text-xs font-semibold tracking-[0.32em] text-slate-500 uppercase">
          Empresas de transporte que confían en InnovSystem
        </p>
        <div className="mt-8 grid justify-items-center gap-6 text-slate-900 sm:grid-cols-2 xl:grid-cols-6">
          {trustPartners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center gap-3 text-center text-sm font-semibold"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-300 text-base font-bold tracking-[0.12em] text-slate-800 uppercase">
                {partner.initials}
              </div>
              <div className="space-y-1">
                <p
                  className={`text-sm font-semibold text-slate-900 ${partner.subtitle ? "" : "text-lg"}`}
                >
                  {partner.name}
                </p>
                {partner.subtitle ? (
                  <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                    {partner.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
