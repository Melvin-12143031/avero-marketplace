
import ProductCard from './ProductCard'

const ProductList = ({ products, onViewDetails, onAddToCart }) => {
    return (
        <section className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                    Featured Products
                </h2>

                <p
                    className="text-sm text-slate-500"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {products.length}{' '}
                    {products.length === 1 ? 'product' : 'products'} found
                </p>
            </div>

            {products.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
                    No products match your search. Try another search term or category.
                </p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            description={product.description}
                            price={product.price}
                            image={product.image_url}
                            category={product.category}
                            onViewDetails={onViewDetails}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default ProductList
