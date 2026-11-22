import { useNavigate } from "react-router-dom";
import {
  X,
  ShoppingBag,
  LoaderCircle,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const Cart = ({
  cartItems,
  isLoading,
  onClose,
  onUpdateQuantity,
  onRemoveFromCart,
}) => {
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const continueShopping = () => {
    onClose();
    navigate("/shop");
  };

  const canCheckout =
    cartItems.length > 0 &&
    cartItems.every(
      (item) => item.is_active && Number(item.stock_quantity) >= item.quantity,
    );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1C1C1C]/55 backdrop-blur-sm">
      <aside className="flex h-full w-full max-w-[480px] flex-col bg-[#FAF8F4] shadow-2xl">
        {/* Header */}
        <header className="relative border-b border-[#E4DCCE] px-7 pb-6 pt-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#B3261E]">
                AVÉRO / YOUR SELECTION
              </p>

              <h2 className="mt-3 font-serif text-[32px] leading-none tracking-tight text-[#1C1C1C]">
                Shopping Bag
              </h2>

              <p className="mt-3 text-xs tracking-wide text-[#6B6258]">
                {cartCount} {cartCount === 1 ? "item" : "items"} selected
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close shopping cart"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DCCE] text-[#6B6258] transition hover:border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white"
            >
              <X size={18} strokeWidth={1.6} />
            </button>
          </div>

          <div className="absolute bottom-0 left-7 h-[2px] w-12 bg-[#B3261E]" />
        </header>

        {/* Cart Body */}
        <main className="flex-1 overflow-y-auto px-6 py-7 sm:px-7">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <LoaderCircle
                size={32}
                className="animate-spin text-[#B3261E]"
                strokeWidth={1.4}
              />

              <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-[#6B6258]">
                Preparing your selection
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-5 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#E4DCCE] bg-[#EDE6D8]">
                <ShoppingBag
                  size={34}
                  strokeWidth={1.2}
                  className="text-[#B3261E]"
                />
              </div>

              <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[#B3261E]">
                A little space for something special
              </p>

              <h3 className="mt-3 font-serif text-2xl text-[#1C1C1C]">
                Your bag is empty.
              </h3>

              <p className="mt-3 max-w-[250px] text-sm leading-6 text-[#6B6258]">
                Explore our collection and discover pieces worth keeping.
              </p>

              <button
                type="button"
                onClick={continueShopping}
                className="mt-8 inline-flex items-center gap-3 border-b border-[#B3261E] pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1C1C1C] transition hover:text-[#B3261E]"
              >
                <ArrowLeft size={14} />
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6B6258]">
                  Your Items
                </p>

                <span className="text-[10px] uppercase tracking-wider text-[#B3261E]">
                  AVÉRO EDIT
                </span>
              </div>

              <div className="space-y-5">
                {cartItems.map((item) => {
                  const stock = Number(item.stock_quantity);
                  const isAvailable = item.is_active;
                  const hasEnoughStock = stock >= item.quantity;

                  return (
                    <article
                      key={item.id}
                      className="group relative grid grid-cols-[116px_minmax(0,1fr)] gap-4 border-b border-[#E4DCCE] pb-5"
                    >
                      {/* Product Photography */}
                      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#EDE6D8]">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag
                              size={28}
                              className="text-[#8A8176]"
                              strokeWidth={1.2}
                            />
                          </div>
                        )}

                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#1C1C1C]/65">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Information */}
                      <div className="flex min-w-0 flex-col py-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {item.category && (
                              <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-[#B3261E]">
                                {item.category}
                              </p>
                            )}

                            <h3 className="line-clamp-2 font-serif text-[17px] leading-snug text-[#1C1C1C]">
                              {item.name}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveFromCart(item.product_id)}
                            aria-label={`Remove ${item.name}`}
                            title="Remove item"
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-[#8A8176] transition hover:text-[#B3261E]"
                          >
                            <Trash2 size={15} strokeWidth={1.5} />
                          </button>
                        </div>

                        <p className="mt-2 text-sm font-medium text-[#6B6258]">
                          ₱{formatPrice(item.price)}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                          {/* Quantity Selector */}
                          <div className="flex h-9 items-center border border-[#E4DCCE] bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product_id,
                                  item.quantity - 1,
                                )
                              }
                              aria-label={`Decrease ${item.name} quantity`}
                              className="flex h-full w-9 items-center justify-center text-[#6B6258] transition hover:bg-[#EDE6D8]"
                            >
                              <Minus size={12} />
                            </button>

                            <span className="min-w-7 text-center text-xs font-medium text-[#1C1C1C]">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={!isAvailable || item.quantity >= stock}
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product_id,
                                  item.quantity + 1,
                                )
                              }
                              aria-label={`Increase ${item.name} quantity`}
                              className="flex h-full w-9 items-center justify-center text-[#6B6258] transition hover:bg-[#EDE6D8] disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <p className="text-sm font-semibold text-[#1C1C1C]">
                            ₱{formatPrice(Number(item.price) * item.quantity)}
                          </p>
                        </div>

                        {!isAvailable ? (
                          <p className="mt-2 text-[10px] font-medium text-[#B3261E]">
                            This product is unavailable.
                          </p>
                        ) : !hasEnoughStock ? (
                          <p className="mt-2 text-[10px] font-medium text-[#B3261E]">
                            Only {stock} available. Adjust your quantity.
                          </p>
                        ) : stock <= 5 ? (
                          <p className="mt-2 text-[10px] text-amber-700">
                            Only {stock} left in stock.
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

              <p className="mt-6 text-center text-[9px] uppercase tracking-[0.2em] text-[#8A8176]">
                End of your selection
              </p>
            </>
          )}
        </main>

        {/* Checkout Summary */}
        <footer className="border-t border-[#1C1C1C] bg-[#1C1C1C] px-7 pb-7 pt-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#EDE6D8]">
                Order Subtotal
              </p>

              <p className="mt-1 text-[10px] text-[#BDB5AA]">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your bag
              </p>
            </div>

            <p className="font-serif text-[25px] tracking-tight text-[#FAF8F4]">
              ₱{formatPrice(subtotal)}
            </p>
          </div>

          <div className="my-5 border-t border-white/10" />

          <p className="text-[10px] leading-5 text-[#BDB5AA]">
            Shipping and applicable taxes are calculated at checkout.
          </p>

          <button
            type="button"
            disabled={isLoading || !canCheckout}
            onClick={() => {
              onClose();
              navigate("/checkout");
            }}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-3 bg-[#B3261E] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#922018] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Proceed to Checkout
            <ArrowRight size={16} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            onClick={continueShopping}
            className="mt-5 flex w-full items-center justify-center gap-2 text-xs font-medium text-[#EDE6D8] transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </button>

          <p className="mt-5 text-center text-[9px] uppercase tracking-[0.24em] text-[#8A8176]">
            AVÉRO · Considered in every detail
          </p>
        </footer>
      </aside>
    </div>
  );
};

export default Cart;
