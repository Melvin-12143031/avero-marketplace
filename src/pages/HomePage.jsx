import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import ProductList from "@/components/products/ProductList";
import Button from "@/components/ui/Button";
import useProductCatalog from "../features/catalog/useProductCatalog";

const HomePage = ({ onAddToCart }) => {
  const { products, allProducts, categories } = useProductCatalog();

  const featuredProducts = products.slice(0, 6);
  const displayCategories = categories.filter((category) => category !== "All");

  const categoryCarouselRef = useRef(null);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  const [isDragging, setIsDragging] = useState(false);

  const scrollCategories = (direction) => {
    const carousel = categoryCarouselRef.current;

    if (!carousel) return;

    carousel.scrollBy({
      left: carousel.clientWidth * 0.8 * direction,
      behavior: "smooth",
    });
  };

  const handleDragStart = (event) => {
    if (event.button !== 0) return;

    const carousel = categoryCarouselRef.current;

    if (!carousel) return;

    hasDragged.current = false;
    dragStartX.current = event.clientX;
    scrollStartX.current = carousel.scrollLeft;

    setIsDragging(true);
  };

  const handleDragMove = (event) => {
    const carousel = categoryCarouselRef.current;

    if (!isDragging || !carousel) return;

    const distance = event.clientX - dragStartX.current;

    if (Math.abs(distance) > 5) {
      hasDragged.current = true;
    }

    if (hasDragged.current) {
      event.preventDefault();
      carousel.scrollLeft = scrollStartX.current - distance;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCategoryClick = (event) => {
    if (!hasDragged.current) return;

    event.preventDefault();
    event.stopPropagation();
    hasDragged.current = false;
  };

  return (
    <div className="overflow-hidden bg-[#FAF8F4] text-[#1C1C1C]">
      {/* Hero */}
      <section className="relative bg-[#EDE6D8]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-10 md:py-24 lg:gap-16 lg:py-28">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B3261E]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B3261E]">
                The AVÉRO Collection
              </p>
            </div>

            <h1 className="mt-7 max-w-xl text-[2.8rem] font-medium leading-[1.08] tracking-[-0.045em] text-[#1C1C1C] sm:text-6xl lg:text-[4.5rem]">
              Everyday living,
              <span className="mt-2 block font-normal italic">
                thoughtfully refined.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-sm leading-8 text-[#6B6258] sm:text-base">
              Discover a considered collection of everyday finds. Simple pieces,
              thoughtful choices, and little details worth discovering.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                to="/shop"
                className="group inline-flex h-12 items-center justify-center gap-4 rounded-md bg-[#B3261E] px-7 text-sm font-semibold text-[#FAF8F4] transition-all duration-300 hover:bg-[#922018] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B3261E]"
              >
                Explore the Collection
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1C1C1C] transition-colors hover:text-[#B3261E]"
              >
                Discover more
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-14 hidden items-center gap-4 border-t border-[#D8CDBB] pt-6 sm:flex">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B3261E]">
                AVÉRO
              </span>
              <span className="h-3 w-px bg-[#C9BDAA]" />
              <p className="text-xs tracking-wide text-[#6B6258]">
                Less noise. Better choices.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-[#B3261E]/20 sm:-right-6 sm:-top-6 sm:h-32 sm:w-32" />

            <div className="relative overflow-hidden rounded-sm bg-[#E4DCCE]">
              <img
                src="/images/avero-hero.jpg"
                alt="A curated arrangement of everyday lifestyle products"
                className="h-85 w-full object-cover sm:h-110 lg:h-135"
              />

              <div className="pointer-events-none absolute inset-0 bg-black/4" />
            </div>

            <div className="absolute -bottom-5 left-5 max-w-57.5 bg-[#FAF8F4] px-5 py-4 shadow-sm sm:bottom-7 sm:-left-8 sm:px-6 sm:py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
                A thoughtful approach
              </p>
              <p className="mt-2 text-sm leading-6 text-[#1C1C1C]">
                Discover things that make everyday living feel a little more
                considered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Strip */}
      <section className="border-b border-[#E4DCCE] bg-[#FAF8F4]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#E4DCCE] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
          <div className="flex items-center gap-4 py-5 sm:justify-center sm:py-7">
            <span className="text-lg text-[#B3261E]">01</span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Thoughtfully selected
            </p>
          </div>

          <div className="flex items-center gap-4 py-5 sm:justify-center sm:py-7 sm:px-4">
            <span className="text-lg text-[#B3261E]">02</span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Everyday discoveries
            </p>
          </div>

          <div className="flex items-center gap-4 py-5 sm:justify-center sm:py-7">
            <span className="text-lg text-[#B3261E]">03</span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              A simpler way to shop
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="mb-9 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B3261E]">
              Find something you love
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Explore by category
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#6B6258]">
              A collection of different finds, brought together for you to
              explore.
            </p>
          </div>

          {displayCategories.length > 3 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollCategories(-1)}
                aria-label="Scroll categories left"
                className="rounded-full border-[#D8CDBB] bg-transparent text-[#1C1C1C] hover:border-[#B3261E] hover:bg-[#EDE6D8]"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollCategories(1)}
                aria-label="Scroll categories right"
                className="rounded-full border-[#D8CDBB] bg-transparent text-[#1C1C1C] hover:border-[#B3261E] hover:bg-[#EDE6D8]"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {displayCategories.length > 0 ? (
          <div
            ref={categoryCarouselRef}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onClickCapture={handleCategoryClick}
            className={`flex gap-4 overflow-x-auto overscroll-x-contain pb-5 select-none scrollbar-none [&::-webkit-scrollbar]:hidden ${
              isDragging
                ? "cursor-grabbing snap-none"
                : "cursor-grab snap-x snap-mandatory"
            }`}
          >
            {displayCategories.map((category, index) => {
              const normalizedCategory = category.trim().toLowerCase();

              const categoryProduct = allProducts.find(
                (product) =>
                  product.category?.trim().toLowerCase() ===
                    normalizedCategory && product.image_url?.trim(),
              );

              return (
                <Link
                  key={category}
                  to="/shop"
                  state={{ category }}
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="group relative aspect-4/5 w-[78%] shrink-0 snap-start overflow-hidden rounded-sm bg-[#EDE6D8] sm:w-[46%] lg:w-[31.5%]"
                >
                  {categoryProduct?.image_url ? (
                    <img
                      src={categoryProduct.image_url}
                      alt={category}
                      draggable={false}
                      className="pointer-events-none h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#EDE6D8]">
                      <span className="text-5xl font-light text-[#B3261E]/30">
                        0{index + 1}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/80" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      Discover the collection
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                        {category}
                      </h3>

                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/60 text-white transition-all duration-300 group-hover:border-[#B3261E] group-hover:bg-[#B3261E]">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-[#D8CDBB] bg-[#EDE6D8]/40 px-6 py-12 text-center">
            <p className="text-sm text-[#6B6258]">
              Categories will appear here when they become available.
            </p>
          </div>
        )}
      </section>

      {/* Featured Collection */}
      <section className="bg-[#EDE6D8]/55">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B3261E]">
                Selected for discovery
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                A few things to discover.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-[#6B6258]">
                Take a closer look at a selection from our current collection.
              </p>
            </div>

            <Link
              to="/shop"
              className="group inline-flex h-11 w-fit items-center gap-3 border-b border-[#B3261E]/40 text-sm font-semibold text-[#B3261E] transition-colors hover:border-[#B3261E] hover:text-[#922018]"
            >
              View all products
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <ProductList
              products={featuredProducts}
              onAddToCart={onAddToCart}
            />
          ) : (
            <div className="border border-dashed border-[#D8CDBB] bg-[#FAF8F4] px-6 py-14 text-center">
              <p className="text-sm text-[#6B6258]">
                Our collection is being updated. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Brand Story */}
      <section className="relative overflow-hidden bg-[#1C1C1C] px-5 py-24 sm:px-6 sm:py-32">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full border border-white/[0.07] sm:size-110" />
        <div className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full border border-white/[0.07] sm:size-80" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D78B7F]">
            The AVÉRO Philosophy
          </p>

          <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-medium leading-[1.12] tracking-[-0.04em] text-[#FAF8F4] sm:text-5xl lg:text-6xl">
            Less noise.
            <span className="block font-normal italic text-[#D78B7F]">
              Better choices.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-[#C9C0B5] sm:text-base">
            Shopping should feel simple and enjoyable. AVÉRO brings together
            thoughtfully selected finds that make discovering something you love
            a little easier.
          </p>

          <Link
            to="/shop"
            className="group mt-10 inline-flex h-12 items-center justify-center gap-4 border border-[#EDE6D8]/60 px-7 text-sm font-semibold text-[#FAF8F4] transition-all duration-300 hover:border-[#EDE6D8] hover:bg-[#EDE6D8] hover:text-[#1C1C1C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF8F4]"
          >
            Discover AVÉRO
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl border-t border-white/10 pt-7">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.3em] text-[#8A8176]">
            AVÉRO — Thoughtfully chosen
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
