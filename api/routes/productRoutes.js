import express from 'express'
import { 
    getProductsController,
    getProductController,
    createProductController,
    updateProductController,
    deleteProductController,
} from '../controllers/productController.js'

const router = express.Router()

// Get all active products
router.get('/', getProductsController)

// Get a single active product
router.get('/:id', getProductController)

// Create a product
router.post('/', createProductController)

// Update a product
router.put('/:id', updateProductController)

// Deactivate a product
router.delete('/:id', deleteProductController)

export default router