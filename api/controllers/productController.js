import { 
    getAllProducts, 
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct, 
} from '../services/productService.js'

const getProductsController  = async (req, res) => {
    try {
        const products = await getAllProducts()

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products,
            },
        })
    } catch (error) {
        console.error('Error fetching products:', error.message)

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch products.',
        })
        
    }
}

const getProductController  = async (req, res) => {
    try {
        const { id } = req.params

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid product ID.',
            })
        }

        const product = await getProductById(id)

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found',
            })
        }

        res.status(200).json({
            status: 'success',
            data: {
                product,
            },
        })


    } catch (error) {
        console.error('Error fetching product:', error.message)

        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch product',
        })
    }
}

const createProductController = async (req, res) => {
    try {
        const {
            category_id,
            name,
            description,
            price,
            stock_quantity,
            image_url,
        } = req.body

        // Required field validation

        if(
            typeof name !== 'string' || 
            !name.trim() ||
            name.trim().length > 200 ||
            price === undefined ||
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price <= 0 ||
            stock_quantity === undefined ||
            typeof stock_quantity !== 'number' ||
            !Number.isInteger(stock_quantity) ||
            stock_quantity < 0
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid product information.',
            })
        }

        const product = await createProduct({
            category_id: category_id || null,
            name,
            description: description || null,
            price,
            stock_quantity,
            image_url: image_url || null,
        })

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully',
            data: {
                product,
            }, 
        })
        
    } catch (error) {
        console.error('Error creating product:', error.message)

        res.status(500).json({
            status: 'error',
            message: 'Failed to create product.',
        })
    }
}

const updateProductController = async (req,res) => {
    try {
        const { id } = req.params

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) { 
            return res.status(400).json({
                status: 'error',
                message: 'Invalid product ID.',
            })
        }

        const {

            category_id,
            name,
            description,
            price,
            stock_quantity,
            image_url,

        } = req.body

        if (
            typeof name !== 'string' ||
            !name.trim() ||
            name.trim().length > 200 ||
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price <= 0 ||
            typeof stock_quantity !== 'number' ||
            !Number.isInteger(stock_quantity) ||
            stock_quantity < 0
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid product information.',
            })
        }

        const product = await updateProduct(id, {
            category_id: category_id || null,
            name: name.trim(),
            description: description || null,
            price,
            stock_quantity,
            image_url: image_url || null,
        })

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found.',
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully.',
            data: {
                product,
            },
        })

    } catch (error) {
        console.error('Error updating product:', error.message)

        res.status(500).json({
            status: 'error',
            message: 'Failed to update product.',
        })
        
    }
}

const deleteProductController = async (req, res) => {
    try {
        
        const { id } = req.params

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid product ID.',
            })
        }

        const product = await deleteProduct(id)

        if(!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found.',
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'Product deactivated successfully.',
            data: {
                product,
            },
        })

    } catch (error) {
        console.error('Error deleting product:', error.message)

        res.status(500).json({
            status: 'error',
            message: 'Failed to delete product.',
        })
        
    }
}

export {
    getProductsController,
    getProductController,
    createProductController,
    updateProductController,
    deleteProductController
}
