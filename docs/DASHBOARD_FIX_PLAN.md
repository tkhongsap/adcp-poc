# Dashboard Fix Implementation Plan

**Issue Date:** February 1, 2026
**Branch:** `fix/dashboard`
**Status:** Planning

---

## Issues Identified

### Issue 1: NYT Data Not Displaying in Dashboard
**User Report:** NYT data exists in `data/adcp_demo_complete_data.json` but doesn't appear in the dashboard.

**Root Cause:** The dashboard currently only displays **Media Buys** data. NYT is a **Product**, not a Media Buy. The Products page doesn't exist yet - clicking "Products" in the sidebar navigates to `/dashboard/products` but no route handler exists for that path.

**Evidence:**
- NYT Premium exists in `products` array (ID: `prod_nyt_premium`)
- Dashboard only renders `MediaBuysTable` component
- No `/dashboard/products/page.tsx` route file exists

### Issue 2: All Dashboard Pages Look Identical
**User Report:** Media Buys, Products, and Formats pages all display the same content.

**Root Cause:** Only the Media Buys route is implemented. The other routes fall back to showing the same layout.

**Evidence from code exploration:**

| Route | Page File | Status |
|-------|-----------|--------|
| `/dashboard/media-buys` | Exists | Working |
| `/dashboard/products` | Missing | Shows default layout |
| `/dashboard/formats` | Missing | Shows default layout |

---

## Architecture Analysis

### Current Data Flow

```
WebSocket Server (Backend)
    │
    │ Emits: { products, media_buys, delivery_metrics, ... }
    │
    ▼
useWebSocket.ts (Frontend Hook)
    │
    │ Stores: mediaBuys, deliveryMetrics
    │ IGNORES: products  ← Problem!
    │
    ▼
DashboardLayout.tsx
    │
    │ Always renders: <MediaBuysTable />
    │ No conditional rendering for Products/Formats
    │
    ▼
MediaBuysTable.tsx (Only table component)
```

### Target Data Flow

```
WebSocket Server (Backend)
    │
    │ Emits: { products, media_buys, delivery_metrics, formats, ... }
    │
    ▼
useWebSocket.ts (Frontend Hook)
    │
    │ Stores: mediaBuys, products, deliveryMetrics, formats
    │
    ▼
Route-Based Page Rendering
    │
    ├── /dashboard/media-buys → <MediaBuysTable />
    ├── /dashboard/products   → <ProductsTable />
    └── /dashboard/formats    → <FormatsTable />
```

---

## Implementation Tasks

### Task 1: Update useWebSocket Hook to Expose Products
**File:** `/src/frontend/src/hooks/useWebSocket.ts`

**Changes:**
1. Add `products` to the state interface
2. Store products from `initial_state` payload
3. Return products in the hook's return value

```typescript
// Add to state
const [products, setProducts] = useState<Product[]>([]);

// In initial_state handler
setProducts(data.products || []);

// Return products
return { mediaBuys, products, deliveryMetrics, ... };
```

### Task 2: Create Products Route Page
**File:** `/src/frontend/src/app/dashboard/products/page.tsx`

**Implementation:**
- Create new page component
- Use `useWebSocket` hook to get products
- Render `ProductsTable` component

### Task 3: Create ProductsTable Component
**File:** `/src/frontend/src/components/dashboard/ProductsTable.tsx`

**Columns to display:**
- Product Name
- Publisher
- Category
- CPM Price
- Targeting Options
- Deal Type

**Data source:** `products` array from mock data

### Task 4: Create Formats Route Page
**File:** `/src/frontend/src/app/dashboard/formats/page.tsx`

**Implementation:**
- Create new page component
- Fetch formats data (from API or WebSocket)
- Render `FormatsTable` component

### Task 5: Create FormatsTable Component
**File:** `/src/frontend/src/components/dashboard/FormatsTable.tsx`

**Columns to display:**
- Format Name
- Type (Display/Video/Native/Audio)
- Dimensions
- Max File Size
- Supported Platforms

**Data source:** `creative_formats` from mock data

### Task 6: Add Formats to WebSocket/API
**Files:**
- `/src/backend/src/websocket/socket.ts`
- `/src/backend/src/data/loader.ts`

**Changes:**
- Include `creative_formats` in `initial_state` payload
- Add formats to loaded data

---

## File Changes Summary

| File | Action | Priority |
|------|--------|----------|
| `src/frontend/src/hooks/useWebSocket.ts` | Modify | High |
| `src/frontend/src/app/dashboard/products/page.tsx` | Create | High |
| `src/frontend/src/components/dashboard/ProductsTable.tsx` | Create | High |
| `src/frontend/src/app/dashboard/formats/page.tsx` | Create | High |
| `src/frontend/src/components/dashboard/FormatsTable.tsx` | Create | High |
| `src/backend/src/websocket/socket.ts` | Modify | Medium |
| `src/backend/src/data/loader.ts` | Modify | Medium |

---

## Testing Checklist

- [ ] Products page displays all 10 products including NYT
- [ ] Formats page displays all 14 creative formats
- [ ] Media Buys page continues to work correctly
- [ ] Sidebar navigation highlights correct active item
- [ ] WebSocket connection maintains stability
- [ ] Theme consistency across all pages
- [ ] Responsive layout works on all pages

---

## Expected Outcome

After implementation:
1. **Products Page** will show all 10 products including NYT Premium and Spotify Audio Ads
2. **Formats Page** will show all 14 creative formats
3. **Media Buys Page** will continue showing the 5 active campaigns
4. Each page will have distinct, relevant content
5. Sidebar navigation will correctly indicate the active page

---

*Plan created: February 1, 2026*
