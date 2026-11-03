import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag } from 'lucide-react'
import Button from '../ui/Button'


const Cart = ({ cartItems, onClose, onUpdateQuantity, onRemoveFromCart }) => {

    const navigate = useNavigate()
    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity, 0,)

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/40">
            <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
                {/* Cart Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-indigo-600" size={22} />

                        <h2 className="text-xl font-bold text-slate-900">
                            Shopping Cart
                        </h2>

                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            {cartItems.reduce(
                                (total, item) => total + item.quantity,
                                0,
                            )}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close shopping cart"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <ShoppingBag
                                size={48}
                                className="text-slate-300"
                            />

                            <h3 className="mt-5 text-lg font-semibold text-slate-900">
                                Your cart is empty
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Add some products to get started.
                            </p>

                            <Button
                                variant="secondary"
                                onClick={onClose}
                                className="mt-6"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-20 w-20 rounded-xl object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-semibold text-slate-900">
                                            {item.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            ₱{item.price.toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>

                                        <div className="mt-3 flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdateQuantity(item.id, item.quantity - 1)
                                                }
                                                aria-label={`Decrease ${item.name} quantity`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                                            >
                                                -
                                            </button>

                                            <span className="min-w-5 text-center text-sm font-semibold text-slate-900">
                                                {item.quantity}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdateQuantity(item.id, item.quantity + 1)
                                                }
                                                aria-label={`Increase ${item.name} quantity`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                                            >
                                                +
                                            </button>


                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemoveFromCart(item.id)}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Footer */}
                <div className="border-t border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-slate-900">
                            Subtotal
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                            ₱{subtotal.toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        Shipping and taxes calculated at checkout.
                    </p>

                    <Button
                        fullWidth
                        disabled={cartItems.length === 0}
                        onClick={() => {
                            onClose()
                            navigate('/checkout')
                        }}
                        className="mt-5"
                    >
                        Proceed to Checkout
                    </Button>
                </div>


            </aside>
        </div>
    )
}

export default Cart