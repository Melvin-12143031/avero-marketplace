import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "cn";

import Button from "../components/ui/Button";
import { buttonVariants } from "../components/ui/button-variants";
import { getProductById } from "../services/api";
import { formatPrice } from "../services/orderService";

const ProductDetailsPage = ({ onAddToCart }) => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        setError(error.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || Number(product.stock_quantity) <= 0) {
      return;
    }

    onAddToCart?.({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image_url,
      category: product.category,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-center text-[#6B6258]">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#B3261E]">
          Product unavailable
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#1C1C1C]">
          We couldn't find this product.
        </h1>

        <p className="mt-4 text-[#6B6258]">
          {error ||
            "This product may have been removed or is no longer available."}
        </p>

        <Link to="/shop" className="mt-8 inline-block">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const stockQuantity = Number(product.stock_quantity);
  const isInStock = stockQuantity > 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        to="/shop"
        className="text-sm font-medium text-[#6B6258] transition-colors hover:text-[#B3261E]"
      >
        ← Back to Shop
      </Link>

      <section className="mt-8 grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Product Image */}
        <div className="flex items-center justify-center rounded-2xl bg-[#EDE6D8] p-4 sm:p-8">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-xl bg-[#EDE6D8] md:aspect-square">
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.png";
              }}
              className="h-full w-full object-cover object-[50%_65%]"
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center py-4 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B3261E]">
            {product.category || "AVÉRO Collection"}
          </p>

          <h1 className="mt-5 font-serif text-3xl font-medium leading-tight tracking-tight text-[#1C1C1C] sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <p className="mt-6 text-3xl font-semibold tracking-tight text-[#1C1C1C]">
            {formatPrice(product.price)}
          </p>

          {/* Description */}
          <div className="mt-8 border-t border-[#E4DCCE] pt-7">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]">
              Product Description
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#6B6258]">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Availability */}
          <div className="mt-8 border-t border-[#E4DCCE] pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]">
              Availability
            </p>

            <p
              className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                !isInStock
                  ? "text-[#B3261E]"
                  : isLowStock
                    ? "text-amber-700"
                    : "text-green-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  !isInStock
                    ? "bg-[#B3261E]"
                    : isLowStock
                      ? "bg-amber-500"
                      : "bg-green-700"
                }`}
              />

              {!isInStock
                ? "Currently out of stock"
                : isLowStock
                  ? `Only ${stockQuantity} available`
                  : `${stockQuantity} available`}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button fullWidth disabled={!isInStock} onClick={handleAddToCart}>
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </Button>

            <Link
              to="/shop"
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Continue Shopping
            </Link>
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#8A8176]">
            Thoughtfully chosen. Simply yours.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailsPage;
