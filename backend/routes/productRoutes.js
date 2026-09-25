const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cacheMiddleware} = require('../middleware/cache')
const { uploadProductCloud } = require('../middleware/cloudUpload');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Fetch product catalog with pagination, search & filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword search (e.g. iphone, apple)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get('/',cacheMiddleware(60), getAllProducts);
router.get('/:id', getProduct);
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin Only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: MacBook Pro M3
 *               description:
 *                 type: string
 *                 example: Ultra-fast Apple Silicon laptop
 *               price:
 *                 type: number
 *                 example: 199999
 *               stock:
 *                 type: integer
 *                 example: 25
 *               brand:
 *                 type: string
 *                 example: Apple
 *               category:
 *                 type: string
 *                 example: 65ab1234567890abcdef1234
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Upload images (up to 5)
// router.post(
//   '/:id/images',
//   protect,
//   authorize('admin'),
//   upload.array('images', 5),
//   uploadProductImages
// );

router.post(
  '/:id/images',
  protect,
  authorize('admin'),
  uploadProductCloud.array('images', 5), // ← Uploads up to 5 images to Cloudinary!
  uploadProductImages
);

module.exports = router;

