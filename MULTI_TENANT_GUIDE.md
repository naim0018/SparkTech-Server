# Multi-Tenant Database Setup - Implementation Guide

## Overview
Your backend now automatically switches between databases based on the frontend URL that makes the request. This is achieved through runtime multi-tenancy using MongoDB's `useDb()` feature.

## How It Works

### 1. **Tenant Resolver Middleware**
Located at: `src/app/middleware/tenantResolver.ts`

This middleware:
- Reads the `Origin` or `Referer` header from incoming requests
- Maps the URL to a database name using `TENANT_MAP`
- Attaches a tenant-specific database connection to `req.tenantDb`

**Current Mapping:**
```typescript
'https://bestbuy4ubd.com' → 'SparkTek' database
'https://topdealsbd.com' → 'TopDealsBd' database
```

### 2. **Dynamic Model Creation**
Located at: `src/app/utils/getTenantModel.ts`

This utility function creates models on-the-fly for each tenant's database connection.

### 3. **Request Flow**
```
Frontend Request (https://topdealsbd.com)
    ↓
CORS Middleware (validates origin)
    ↓
Tenant Resolver (sets req.tenantDb to 'TopDealsBd')
    ↓
Controller (passes req to service)
    ↓
Service (uses getTenantModel to get TopDealsBd.User model)
    ↓
Database Query (executed on TopDealsBd database)
```

## Adding New Tenants

To add a new frontend URL, edit `src/app/middleware/tenantResolver.ts`:

```typescript
const TENANT_MAP: Record<string, string> = {
  // Existing tenants
  'https://bestbuy4ubd.com': 'SparkTek',
  'https://topdealsbd.com': 'TopDealsBd',
  
  // Add new tenant
  'https://newstore.com': 'NewStoreDb',
};
```

Also update CORS in `src/app.ts`:
```typescript
const allowedOrigins = [
  // ... existing origins
  "https://newstore.com",
  "https://www.newstore.com",
];
```

## Migrating Other Modules to Multi-Tenant

You've already migrated the **User** module. Here's how to migrate the remaining modules:

### Step-by-Step Migration Pattern

#### 1. Update the Model File
**Example:** `src/modules/Product/product.model.ts`

```typescript
// At the bottom of the file, change:
export const ProductModel = model<TProduct>('Product', productSchema);

// To:
export { productSchema as ProductSchema };
export const ProductModel = model<TProduct>('Product', productSchema);
```

#### 2. Update the Service File
**Example:** `src/modules/Product/product.service.ts`

```typescript
// Add imports
import { Request } from "express";
import { ProductSchema } from "./product.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

// Update each function to accept req as first parameter
const getAllProducts = async (req: Request): Promise<TProduct[]> => {
  const ProductModel = getTenantModel(req, 'Product', ProductSchema);
  const result = await ProductModel.find({ isDeleted: { $ne: true } });
  return result;
};

// Repeat for all service functions
```

#### 3. Update the Controller File
**Example:** `src/modules/Product/product.controller.ts`

```typescript
// Pass req as first argument to service calls
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req); // Add req here
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully',
    data: result,
  });
});
```

### Modules to Migrate

Apply the above pattern to these modules:

- ✅ **User** (Already migrated)
- ⬜ **Product** (`src/modules/Product/`)
- ⬜ **Cart** (`src/modules/Cart/`)
- ⬜ **Orders** (`src/modules/Orders/`)
- ⬜ **Categories** (`src/modules/Categories/`)
- ⬜ **Banner** (`src/modules/Banner/`)
- ⬜ **FacebookPixel** (`src/modules/FacebookPixel/`)
- ⬜ **GoogleAnalytics** (`src/modules/GoogleAnalytics/`)
- ⬜ **TrackingIntegrations** (`src/modules/TrackingIntegrations/`)
- ⬜ **Bkash** (`src/modules/bkash/`)

### Special Cases

#### Auth Module
The Auth module uses `UserModel` internally. Update `src/modules/Auth/auth.service.ts`:

```typescript
import { Request } from "express";
import { UserSchema } from "../User/user.model";
import { getTenantModel } from "../../app/utils/getTenantModel";

const loginUser = async (req: Request, payload: TLoginUser) => {
  const UserModel = getTenantModel(req, 'User', UserSchema);
  // ... rest of the logic
};
```

#### Middleware that Uses Models
If you have middleware that queries the database (e.g., auth middleware), you'll need to:

1. Get the tenant connection from `req.tenantDb`
2. Use `getTenantModel()` to get the model

Example:
```typescript
export const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    // ... verify token
    
    const UserModel = getTenantModel(req, 'User', UserSchema);
    const user = await UserModel.findById(decoded.userId);
    // ... rest of logic
  });
};
```

## Testing

### Test with Different Origins

1. **Test BestBuy (SparkTek database):**
```bash
curl -H "Origin: https://bestbuy4ubd.com" http://localhost:2000/api/v1/users
```

2. **Test TopDeals (TopDealsBd database):**
```bash
curl -H "Origin: https://topdealsbd.com" http://localhost:2000/api/v1/users
```

### Frontend Configuration

Your frontend should make API calls to the same backend URL, but the backend will automatically route to the correct database based on the request origin.

**BestBuy Frontend (.env):**
```env
VITE_API_URL=http://localhost:2000
# or in production:
VITE_API_URL=https://spark-tech-server.vercel.app
```

**TopDeals Frontend (.env):**
```env
VITE_API_URL=http://localhost:2000
# or in production:
VITE_API_URL=https://spark-tech-server.vercel.app
```

## Important Notes

1. **Single Server Instance**: You now run ONE backend server that handles ALL tenants
2. **Same MongoDB Cluster**: All databases are in the same MongoDB cluster
3. **Data Isolation**: Each tenant's data is completely isolated in separate databases
4. **Automatic Switching**: No manual configuration needed - it's all based on the request origin

## Rollback Plan

If you need to rollback to the old single-database approach:
1. Remove the `tenantResolver` middleware from `src/app.ts`
2. Revert services to use the static `UserModel` export
3. Remove the `req` parameter from service functions

## Next Steps

1. ✅ User module is migrated
2. Migrate Product module next (most important for your e-commerce)
3. Then migrate Orders and Cart
4. Finally migrate remaining modules
5. Test thoroughly with both frontends
