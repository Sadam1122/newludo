import Image from "next/image";

const layoutGroups = [
  {
    title: "Table VIP",
    items: ["Table 1-9 (9 Pax)", "Table 29 (9 Pax)"],
  },
  {
    title: "Table Sofa Reguler",
    items: [
      "Table 10-11 (4 Pax)",
      "Table 12-15 (6 Pax)",
      "Table 16-18 (4 Pax)",
    ],
  },
  {
    title: "Table Reguler",
    items: [
      "Table 19-21, 23-25 (4 Pax)",
      "Table 30 (6 Pax)",
      "Table 22a (4 Pax)",
      "Table 22b (4 Pax)",
    ],
  },
  {
    title: "Barstool",
    items: ["A-G (1 Pax)"],
  },
  {
    title: "Outdoor",
    items: ["Table 31 (4 Pax)", "Table 32-35 (2 Pax)", "Table 36-46 (4 Pax)"],
  },
];

export function EventMiceVenueLayout() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050505] py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(247,198,0,0.1),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(239,31,40,0.16),transparent_28%)]" />
      <div className="ludo-section-shell relative z-10">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F7C600]">
            Reservation Map
          </p>
          <h2 className="font-display mt-3 text-[clamp(3rem,10vw,6rem)] uppercase leading-[0.86] text-[#F8EDE7]">
            LAYOUT <span className="text-[#EF1F28]">TABLE</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0B0B] p-3 shadow-[0_28px_100px_rgba(0,0,0,0.36)] sm:p-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white">
              <Image
                src="/layout-seat.png"
                alt="LUDO table layout"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-contain"
                priority={false}
              />
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F7C600]">
              Table Information
            </p>
            <div className="mt-5 grid gap-4">
              {layoutGroups.map((group) => (
                <article
                  key={group.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <h3 className="text-base font-black uppercase text-[#F8EDE7]">
                    {group.title}
                  </h3>
                  <ul className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm font-semibold leading-6 text-[#A3A3A3]"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF1F28]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
