import Image from "next/image";

export function PromiseSection() {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <div className="relative min-h-[22rem] md:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80"
            alt="Elegant Indian bedroom with warm tones and soft textiles"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-20 md:px-14 md:py-28 lg:px-16">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
            Kya milega
          </p>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-ink md:text-5xl">
            Poora room vision
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Sirf Pinterest moodboard nahi — aapke room ke liye socha hua plan:
            design direction, materials, Bangalore se milne wale items, aur aapke
            budget band ke andar estimate.
          </p>
          <ul className="mt-10 space-y-4 text-[0.95rem] text-ink">
            {[
              "Aapke room ke hisaab se design direction",
              "₹25K se ₹1.5L tak clear budget bands",
              "IKEA, Home Centre, local markets — sourced for Bangalore",
              "Under 4 hours execution, no room vacation",
            ].map((item) => (
              <li key={item} className="flex gap-3 border-b border-line pb-4">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-saffron" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
