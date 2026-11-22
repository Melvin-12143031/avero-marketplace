import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import { formatPrice } from "../../services/orderService";

const ProductCard = ({
  id,
  name,
  description,
  price,
  image,
  category,
  onAddToCart,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/products/${id}`);
  };

  const handleAddToCart = () => {
    onAddToCart?.({
      id,
      name,
      description,
      price,
      image,
      category,
    });
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-[#E4DCCE] bg-white transition-shadow duration-300 hover:shadow-lg">
      <button
        type="button"
        onClick={handleViewDetails}
        className="block w-full overflow-hidden rounded-t-xl bg-[#EDE6D8] text-left"
        aria-label={`View ${name} details`}
      >
        <img
          src={image || "/placeholder.png"}
          alt={name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder.png";
          }}
          className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </button>

      <div className="p-5 sm:p-6">
        {category && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
            {category}
          </p>
        )}

        <h3 className="mt-2 line-clamp-1 font-serif text-xl font-medium text-[#1C1C1C]">
          {name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#6B6258]">
          {description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[#E4DCCE] pt-4">
          <p className="text-lg font-semibold text-[#1C1C1C]">
            {formatPrice(price)}
          </p>

          <Button
            variant="secondary"
            onClick={handleViewDetails}
            className="rounded-md border border-[#E4DCCE] bg-[#FAF8F4] px-4 text-[#1C1C1C] hover:bg-[#EDE6D8]"
          >
            View Details
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          className="mt-3 w-full rounded-md bg-[#B3261E] px-5 text-white hover:bg-[#922019]"
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
