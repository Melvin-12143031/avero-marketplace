# AVÉRO — Project Documentation

## 1. Introduction

AVÉRO is a full-stack e-commerce marketplace application developed with React, Express, and PostgreSQL.

The system provides two primary application experiences:

1. **Customer storefront:** Supports product discovery, shopping cart management, checkout, order history, and other customer-facing features.
2. **Administrative dashboard:** Supports operational management of products, inventory, orders, payments, customers, and contact inquiries.

The application uses a separate frontend and backend, with PostgreSQL as its primary relational database.

## 2. System Architecture

### 2.1 Frontend Architecture

The frontend is built with React and Vite.

Its source code is organized into the following areas:

| Directory        | Responsibility                            |
| ---------------- | ----------------------------------------- |
| `src/app`        | Application-level context and providers   |
| `src/assets`     | Static assets                             |
| `src/components` | Reusable interface and feature components |
| `src/features`   | Feature-specific application logic        |
| `src/hooks`      | Reusable React hooks                      |
| `src/lib`        | Shared libraries and UI utilities         |
| `src/pages`      | Customer and administrator pages          |
| `src/services`   | API communication and service functions   |
| `src/utils`      | General-purpose utilities                 |

The frontend uses service modules to communicate with backend endpoints rather than placing API communication directly throughout the page components.

### 2.2 Backend Architecture

The backend uses Express 5 with ES modules.

The backend follows a layered organization:

| Layer       | Responsibility                                                         |
| ----------- | ---------------------------------------------------------------------- |
| Routes      | Define API endpoints and attach middleware                             |
| Middleware  | Authentication, authorization, validation, uploads, and error handling |
| Controllers | Handle HTTP requests and responses                                     |
| Services    | Implement business logic and database operations                       |
| Validators  | Define request validation schemas                                      |
| Config      | Initialize database, Cloudinary, and environment configuration         |

General request lifecycle:

```text
HTTP Request
    |
    v
Express Route
    |
    v
Middleware
    |
    v
Controller
    |
    v
Service
    |
    v
Database / External Service
    |
    v
Controller Response
    |
    v
HTTP Response
```

### 2.3 External Services

| Service    | Purpose                         |
| ---------- | ------------------------------- |
| Neon       | Managed PostgreSQL database     |
| Cloudinary | Image storage and delivery      |
| Vercel     | Frontend and backend deployment |

## 3. Backend Module Organization

### Configuration

`api/config/`

- `database.js` — PostgreSQL connection pool
- `cloudinary.js` — Cloudinary configuration
- `validateEnv.js` — Environment variable validation

### Controllers

`api/controllers/`

- `authController.js`
- `cartController.js`
- `categoryController.js`
- `contactController.js`
- `customerController.js`
- `dashboardController.js`
- `imageController.js`
- `inventoryController.js`
- `orderController.js`
- `paymentController.js`
- `productController.js`

Controllers handle incoming requests and coordinate with the appropriate service functions.

### Middleware

`api/middleware/`

- `authMiddleware.js`
- `authorizeRoles.js`
- `contactRateLimitMiddleware.js`
- `errorMiddleware.js`
- `processImageMiddleware.js`
- `rateLimitMiddleware.js`
- `uploadMiddleware.js`
- `validateImageMiddleware.js`
- `validateRequest.js`

Middleware provides reusable request-processing functionality, including access control, input validation, file handling, rate limiting, and error responses.

### Routes

`api/routes/`

- `authRoutes.js`
- `cartRoutes.js`
- `categoryRoutes.js`
- `contactRoutes.js`
- `customerRoutes.js`
- `dashboardRoutes.js`
- `inventoryRoutes.js`
- `orderRoutes.js`
- `paymentRoutes.js`
- `productRoutes.js`

### Services

`api/services/`

- `authService.js`
- `cartService.js`
- `categoryService.js`
- `contactService.js`
- `customerService.js`
- `dashboardService.js`
- `inventoryService.js`
- `orderService.js`
- `paymentService.js`
- `productService.js`

Services contain the application's core business logic and database operations.

### Validators

`api/validators/`

- `categoryValidator.js`
- `contactValidator.js`
- `inventoryValidator.js`
- `productValidator.js`

## 4. API Organization

All backend routes are mounted under `/api`.

| API Group      | Base Path         | Main Responsibility                                 |
| -------------- | ----------------- | --------------------------------------------------- |
| Authentication | `/api/auth`       | Registration, login, current-user retrieval, logout |
| Products       | `/api/products`   | Product catalog and administration                  |
| Categories     | `/api/categories` | Category retrieval and management                   |
| Cart           | `/api/cart`       | Shopping cart operations                            |
| Orders         | `/api/orders`     | Order creation, retrieval, and management           |
| Payments       | `/api/payments`   | Payment records and status operations               |
| Inventory      | `/api/inventory`  | Inventory and stock adjustments                     |
| Dashboard      | `/api/dashboard`  | Administrative dashboard information                |
| Customers      | `/api/customers`  | Customer information and administration             |
| Contact        | `/api/contact`    | Contact inquiry submission and management           |

### Health Endpoints

| Method | Endpoint         | Purpose                     |
| ------ | ---------------- | --------------------------- |
| GET    | `/api/health`    | API health check            |
| GET    | `/api/health/db` | Database connectivity check |

The exact route methods, parameters, and access requirements are defined in their corresponding files under `api/routes/`.

## 5. Database Design

AVÉRO uses PostgreSQL hosted on Neon.

The database includes the following core entities:

| Entity        | Purpose                             |
| ------------- | ----------------------------------- |
| `users`       | Customer and administrator accounts |
| `addresses`   | Customer address records            |
| `categories`  | Product categories                  |
| `products`    | Product information and stock       |
| `cart_items`  | Customer shopping cart items        |
| `orders`      | Customer orders                     |
| `order_items` | Products belonging to orders        |
| `payments`    | Payment records and statuses        |
| `reviews`     | Customer product reviews            |
| `wishlists`   | Customer wishlist entries           |

### Database Configuration

The backend uses the `pg` package to connect to PostgreSQL.

The connection string is supplied through:

```env
DATABASE_URL=your_database_connection_string
```

Database initialization and refinement SQL scripts are maintained in the repository's `quiries/` directory.

These scripts cover table creation and subsequent schema improvements, including relationships, indexes, and database triggers.

Execute the schema scripts in their intended order when preparing a new database.

## 6. Authentication and Authorization

AVÉRO uses JSON Web Tokens for authentication.

### Authentication Flow

1. A customer submits registration or login credentials.
2. The backend validates the request.
3. Passwords are handled using bcrypt.
4. After successful authentication, the backend issues a JWT.
5. The token is stored in an HTTP-only cookie.
6. The frontend includes credentials when communicating with the backend.
7. Protected backend endpoints verify the authentication token.

### Authorization

The application distinguishes between customer and administrator access.

- Customer-only operations require an authenticated customer.
- Administrative operations require an authenticated administrator.
- Frontend route guards help control access to protected pages.
- Backend middleware enforces access restrictions independently of frontend navigation.

Frontend route protection is not a replacement for backend authorization.

## 7. Business Workflows

### 7.1 Product Management

Administrators can manage product information and product availability.

Product operations include creating, updating, retrieving, activating, and deactivating products.

### 7.2 Shopping Cart

Authenticated customers can manage their cart by adding products, updating quantities, and removing items.

### 7.3 Checkout and Order Creation

The checkout workflow validates the submitted order information and processes order creation through the backend.

Inventory availability is considered during order processing.

### 7.4 Order Management

Administrators can manage order fulfillment through defined status transitions.

The supported workflow includes:

```text
Pending
   |
   v
Processing
   |
   v
Shipped
   |
   v
Delivered
```

Eligible pending or processing orders can also be cancelled according to the application's business rules.

Order fulfillment is restricted by payment status.

### 7.5 Payment Management

The application records payment methods, payment statuses, and payment history.

Payment methods include:

- Cash on Delivery
- GCash
- Card

**Important:** These payment options are simulated. The application does not currently process transactions through a live payment gateway.

### 7.6 Inventory Management

Administrators can perform stock adjustments and monitor inventory levels.

Inventory operations include:

- Stock In
- Stock Out
- Insufficient-stock validation
- Low-stock monitoring
- Out-of-stock monitoring

Refund-related inventory restoration is handled through the application's order and payment business logic.

### 7.7 Customer Management

Administrators can retrieve customer information, inspect customer order history, and manage account activation status.

Deactivated accounts are prevented from continuing normal authenticated access.

### 7.8 Contact Inquiry Management

Customers and visitors can submit contact inquiries.

New inquiries begin with a pending status and can be managed through the administrative interface.

The current implementation is database-backed. Gmail integration, automatic email acknowledgments, and two-way email communication are not included.

### 7.9 Wishlist and Reviews

Wishlist functionality is available to registered customers.

Product reviews are restricted to customers who have completed a delivered order for the relevant product.

## 8. Image Management

Cloudinary is used for image storage and delivery.

The backend uses:

- Multer for handling uploaded files
- File-type validation for checking uploaded file formats
- Sharp for image processing
- Cloudinary for remote image storage

Cloudinary credentials are configured through environment variables.

## 9. Security Measures

The backend includes several security-related controls:

| Mechanism                  | Purpose                                                     |
| -------------------------- | ----------------------------------------------------------- |
| bcrypt                     | Password hashing                                            |
| JWT                        | Authentication                                              |
| HTTP-only cookies          | Protect authentication tokens from direct JavaScript access |
| Role authorization         | Restrict administrative operations                          |
| Zod                        | Request validation                                          |
| Express Rate Limit         | Limit selected request activity                             |
| Helmet                     | Apply security-related HTTP headers                         |
| CORS                       | Restrict permitted cross-origin requests                    |
| Environment validation     | Check required configuration                                |
| Image validation           | Restrict unsupported uploads                                |
| Centralized error handling | Standardize backend error responses                         |

Production secrets must be configured through the deployment platform's environment variable settings.

## 10. Environment Configuration

### Frontend Environment

File: `.env`

```env
VITE_API_BASE_URL=/api
```

### Backend Environment

File: `api/.env`

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=your_database_url_here

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

Do not commit actual `.env` files.

## 11. Dependency Inventory

The project maintains separate package manifests for the frontend and backend.

### Frontend Dependencies

| Package                      | Purpose                       |
| ---------------------------- | ----------------------------- |
| `react`                      | UI framework                  |
| `react-dom`                  | React DOM rendering           |
| `react-router-dom`           | Client-side routing           |
| `@base-ui/react`             | Accessible UI primitives      |
| `lucide-react`               | Icon library                  |
| `sonner`                     | Toast notifications           |
| `recharts`                   | Charts and data visualization |
| `pdfmake`                    | PDF generation                |
| `class-variance-authority`   | Component variant management  |
| `cn`                         | Class-name utility            |
| `@fontsource-variable/geist` | Geist font family             |
| `tailwindcss`                | Utility-first CSS framework   |
| `tw-animate-css`             | CSS animation utilities       |
| `shadcn`                     | UI component tooling          |
| `@tailwindcss/vite`          | Tailwind CSS Vite integration |

### Frontend Development Dependencies

| Package                       | Purpose                           |
| ----------------------------- | --------------------------------- |
| `vite`                        | Development server and build tool |
| `@vitejs/plugin-react`        | React integration for Vite        |
| `eslint`                      | Code linting                      |
| `@eslint/js`                  | ESLint JavaScript configuration   |
| `eslint-plugin-react-hooks`   | React Hooks lint rules            |
| `eslint-plugin-react-refresh` | React Refresh lint rules          |
| `globals`                     | Global variable definitions       |
| `@types/react`                | React type definitions            |
| `@types/react-dom`            | React DOM type definitions        |
| `nodemon`                     | Development process utility       |

### Backend Runtime Dependencies

| Package              | Purpose                                |
| -------------------- | -------------------------------------- |
| `express`            | HTTP server and routing                |
| `pg`                 | PostgreSQL driver                      |
| `bcrypt`             | Password hashing                       |
| `jsonwebtoken`       | JWT creation and verification          |
| `cloudinary`         | Image storage integration              |
| `multer`             | File upload handling                   |
| `sharp`              | Image processing                       |
| `file-type`          | File format detection                  |
| `zod`                | Data validation                        |
| `cors`               | Cross-origin resource sharing          |
| `cookie-parser`      | Cookie parsing                         |
| `dotenv`             | Environment configuration              |
| `helmet`             | Security headers                       |
| `express-rate-limit` | Request rate limiting                  |
| `@vercel/functions`  | Vercel serverless function integration |

### Backend Development Dependencies

| Package   | Purpose                                       |
| --------- | --------------------------------------------- |
| `nodemon` | Automatically restarts the development server |
| `globals` | Global variable definitions for tooling       |

### Additional Declared Packages

The root package manifest also declares `cors` and `dotenv`. These are listed in the manifest, but the frontend source import scan did not identify active frontend imports for them. Review whether they are still needed before removing them.

The project also includes a `minimatch` dependency override in both manifests.

## 12. Deployment Architecture

The application is deployed as two separate Vercel projects.

### Frontend

- Repository root: `./`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

### Backend

- Repository root: `api/`
- Entry point: `server.js`
- Runtime: Node.js

### API Rewriting

The root `vercel.json` file forwards frontend API requests to the backend deployment.

```text
Browser
   |
   v
AVÉRO Frontend
   |
   v
/api/*
   |
   v
Vercel Rewrite
   |
   v
AVÉRO Backend
   |
   v
Neon PostgreSQL
```

The backend uses `@vercel/functions` to support database connection pool handling in the Vercel environment.

### Production URLs

| Component       | URL                                                    |
| --------------- | ------------------------------------------------------ |
| Frontend        | https://avero-marketplace.vercel.app                   |
| Backend         | https://avero-marketplace-api.vercel.app               |
| API Health      | https://avero-marketplace-api.vercel.app/api/health    |
| Database Health | https://avero-marketplace-api.vercel.app/api/health/db |

## 13. Verification and Testing

The application has undergone manual functional verification covering key customer and administrative workflows.

Verified areas include:

- Customer registration and login
- Authentication and logout
- Protected routes
- Customer order history
- Shopping cart and checkout
- Order creation
- Product and inventory operations
- Administrative functionality
- Payment simulation and payment history
- Customer account management
- Contact inquiry management
- Production deployment
- Database connectivity
- Responsive layout checks

The project includes ESLint for static code analysis.

No dedicated automated test framework or automated test suite is currently documented for this project.

## 14. Known Limitations and Future Improvements

### Current Limitations

- No live payment gateway integration.
- No Gmail API integration for contact inquiries.
- No automatic inquiry acknowledgment emails.
- No two-way email communication.
- No documented automated test suite.

### Potential Future Improvements

- Integrate a payment gateway.
- Introduce automated frontend and backend testing.
- Add audit logging for important administrative actions.
- Improve monitoring and error reporting.
- Expand reporting and analytics capabilities.
- Add additional customer account management features.

These are potential future improvements, not claims about existing functionality.

## 15. Project Maintenance

When maintaining or extending AVÉRO:

1. Keep frontend API communication inside the service layer.
2. Keep backend business logic inside service modules.
3. Validate incoming request data.
4. Enforce authorization on the backend.
5. Keep sensitive configuration in environment variables.
6. Preserve database relationships and constraints.
7. Test affected customer and administrative workflows after changes.
8. Verify production configuration before deployment.

---

**End of Project Documentation**
