import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF8F4] text-[#1C1C1C]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#EDE6D8]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B3261E]">
              The AVÉRO Story
            </p>

            <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              A more thoughtful way to discover.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-[#6B6258]">
              We believe the things we bring into our everyday lives should feel
              considered, useful, and meaningful. AVÉRO is built around the idea
              of choosing with intention and finding beauty in simplicity.
            </p>

            <Link
              to="/shop"
              className="group mt-9 inline-flex items-center gap-3 border-b border-[#B3261E] pb-2 text-sm font-semibold text-[#1C1C1C] transition-colors hover:text-[#B3261E]"
            >
              Explore the collection
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-sm bg-[#D8CCBA]">
              <img
                src="/images/avero-hero-about.jpg"
                alt="AVÉRO editorial collection"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="mt-4 text-right text-[10px] uppercase tracking-[0.2em] text-[#8A8176]">
              Thoughtfully chosen. Simply yours.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-6 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B3261E]">
          Our Philosophy
        </p>

        <h2 className="mx-auto mt-6 max-w-3xl font-serif text-3xl font-medium leading-tight sm:text-5xl">
          Less noise. Better choices.
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-[#6B6258] sm:text-base">
          Everyday living doesn't need to be complicated. We believe in keeping
          things simple, appreciating thoughtful details, and discovering
          products that have a place in the way we live.
        </p>
      </section>

      {/* Brand Values */}
      <section className="border-y border-[#E4DCCE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B3261E]">
              What We Believe In
            </p>

            <h2 className="mt-5 font-serif text-3xl font-medium sm:text-4xl">
              The little things matter.
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            <div className="border-t border-[#B3261E] pt-6">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#B3261E]">
                01
              </span>

              <h3 className="mt-5 font-serif text-2xl">Thoughtful Selection</h3>

              <p className="mt-4 text-sm leading-7 text-[#6B6258]">
                We value products chosen with purpose, bringing together useful
                finds and considered details.
              </p>
            </div>

            <div className="border-t border-[#B3261E] pt-6">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#B3261E]">
                02
              </span>

              <h3 className="mt-5 font-serif text-2xl">Everyday Simplicity</h3>

              <p className="mt-4 text-sm leading-7 text-[#6B6258]">
                We appreciate uncomplicated experiences and products that fit
                naturally into everyday life.
              </p>
            </div>

            <div className="border-t border-[#B3261E] pt-6">
              <span className="text-xs font-semibold tracking-[0.2em] text-[#B3261E]">
                03
              </span>

              <h3 className="mt-5 font-serif text-2xl">Meaningful Living</h3>

              <p className="mt-4 text-sm leading-7 text-[#6B6258]">
                We believe that better everyday experiences often begin with the
                choices we make along the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="bg-[#1C1C1C] px-5 py-20 text-center text-[#FAF8F4] sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D78B7F]">
            The AVÉRO Approach
          </p>

          <h2 className="mt-7 font-serif text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
            Make room for what matters.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-8 text-[#BDB5AA]">
            Discover a collection shaped around thoughtful choices, everyday
            inspiration, and a simpler way to shop.
          </p>

          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-3 bg-[#B3261E] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#922019]"
          >
            Discover AVÉRO
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
