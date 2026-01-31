# Multi-Tenant Database - Quick Summary

## ✅ What's Been Implemented

Your backend now **automatically switches databases** based on the frontend URL making the request!

### Current Setup

| Frontend URL | Database Name |
|-------------|---------------|
| `https://bestbuy4ubd.com` | `SparkTek` |
| `https://www.bestbuy4ubd.com` | `SparkTek` |
| `http://localhost:5173` | `SparkTek` (default) |
| `http://localhost:5174` | `SparkTek` (default) |
| `https://topdealsbd.com` | `TopDealsBd` |
| `https://www.topdealsbd.com` | `TopDealsBd` |

### How It Works

1. **Request comes in** from your frontend (e.g., `https://topdealsbd.com`)
2. **Tenant Resolver middleware** reads the `Origin` header
3. **Database connection** is automatically switched to `TopDealsBd`
4. **All queries** in that request use the `TopDealsBd` database
5. **Next request** from `https://bestbuy4ubd.com` automatically uses `SparkTek` database

### What's Migrated

- ✅ **User Module** - Fully migrated and working
- ⬜ **Product Module** - Needs migration
- ⬜ **Orders Module** - Needs migration
- ⬜ **Cart Module** - Needs migration
- ⬜ **Other Modules** - Need migration

## 🚀 How to Use

### Running the Server

Just run **ONE** server instance:
```bash
npm run dev
```

That's it! The server will handle both BestBuy and TopDeals requests automatically.

### Frontend Configuration

Both frontends point to the **same backend URL**:

**BestBuy Frontend (.env):**
```env
VITE_API_URL=http://localhost:2000
```

**TopDeals Frontend (.env):**
```env
VITE_API_URL=http://localhost:2000
```

The backend automatically knows which database to use based on the request origin!

## 📝 Adding New Tenants

To add a new store (e.g., `https://newstore.com`):

1. **Update `src/app/middleware/tenantResolver.ts`:**
```typescript
const TENANT_MAP: Record<string, string> = {
  'https://bestbuy4ubd.com': 'SparkTek',
  'https://topdealsbd.com': 'TopDealsBd',
  'https://newstore.com': 'NewStoreDb',  // Add this
};
```

2. **Update CORS in `src/app.ts`:**
```typescript
const allowedOrigins = [
  // ... existing
  "https://newstore.com",
  "https://www.newstore.com",
];
```

That's it! No code changes needed in your services or controllers.

## 🔧 Next Steps

You need to migrate the remaining modules (Product, Orders, Cart, etc.) to use the multi-tenant pattern. See `MULTI_TENANT_GUIDE.md` for detailed instructions.

### Quick Migration Pattern

For each module:

1. **Model:** Export schema separately
2. **Service:** Accept `req` as first parameter, use `getTenantModel()`
3. **Controller:** Pass `req` to service methods

Example in `MULTI_TENANT_GUIDE.md`

## 🧪 Testing

Test with curl:
```bash
# Test BestBuy (SparkTek database)
curl -H "Origin: https://bestbuy4ubd.com" http://localhost:2000/api/v1/users

# Test TopDeals (TopDealsBd database)
curl -H "Origin: https://topdealsbd.com" http://localhost:2000/api/v1/users
```

## 📚 Documentation

- **Full Guide:** `MULTI_TENANT_GUIDE.md`
- **Tenant Resolver:** `src/app/middleware/tenantResolver.ts`
- **Model Helper:** `src/app/utils/getTenantModel.ts`
