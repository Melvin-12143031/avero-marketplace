
import { X } from 'lucide-react'
import Button from '../ui/Button'
import { formatPrice } from '../../services/orderService'

const ProductDetails = ({ product, onClose }) => {
  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-slate-500 shadow-md transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center bg-slate-50 p-6">
            <img
              src={product.image}
              alt={product.name}
              className="h-64 w-full rounded-xl object-cover md:h-80"
            />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              {product.category}
            </p>

            <h2
              id="product-details-title"
              className="mt-3 text-2xl font-bold text-slate-900"
            >
              {product.name}
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {product.description}
            </p>

            <p className="mt-6 text-2xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </p>

            <div className="mt-8">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
