export const isValidCart = (cartItems) => {
    if (!Array.isArray(cartItems)) {
        return false
    }

    return cartItems.every((item) => {
        return (
            item &&
            (typeof item.id === 'string' || typeof item.id === 'number') &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        )
    })
}

export const isValidProduct = (product) => {
    return (
        product &&
        (typeof product.id === 'string' && product.id.trim() !== '') ||
        (typeof product.id === 'number' && Number.isFinite(product.id)) &&
        typeof product.name === 'string' &&
        product.name.trim() !== '' &&
        typeof product.description === 'string' &&
        typeof product.price === 'number' &&
        Number.isFinite(product.price) &&
        product.price >= 0 &&
        typeof product.category === 'string' &&
        typeof product.image === 'string'
    )
}