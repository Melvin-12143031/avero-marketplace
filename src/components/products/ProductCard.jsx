import Button from "../ui/Button";
import { formatPrice } from "../../services/orderService";

const ProductCard = ({
  id,
  name,
  description,
  price,
  image,
  category,
  onViewDetails,
  onAddToCart,
}) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <img
        src={image || "/placeholder.png"}
        alt={name}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.png";
        }}
        className="h-52 w-full object-cover"
      />

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-5 flex flex-col gap-3">
          <p className="text-lg font-bold text-slate-900">
            {formatPrice(price)}
          </p>

          <Button
            variant="secondary"
            onClick={() =>
              onViewDetails?.({
                id,
                name,
                description,
                price,
                image,
                category,
              })
            }
          >
            View Details
          </Button>

          <Button
            onClick={() =>
              onAddToCart?.({
                id,
                name,
                description,
                price,
                image,
                category,
              })
            }
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
