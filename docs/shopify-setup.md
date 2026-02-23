# Shopify Partner & Dev Store Setup

Follow these steps to get your Admin API credentials.

## 1. Create a Shopify Partner Account

1. Go to [partners.shopify.com](https://partners.shopify.com/) and sign up (free)
2. Complete your profile

## 2. Create a Development Store

1. In the Partner dashboard, go to **Stores** → **Add store**
2. Select **Development store**
3. Choose **Create a store to test and build**
4. Name it something like `biophase-dev`
5. Click **Create development store**

## 3. Add Sample Products

1. Open your new dev store admin (`biophase-dev.myshopify.com/admin`)
2. Go to **Products** → **Add product**
3. Create 4–6 sample biomedical products:
   - **Precision Micropipette Set** — $249.99
   - **Lab-Grade Centrifuge Tubes (500ct)** — $89.99
   - **Digital PCR Thermal Cycler** — $4,799.00
   - **Sterile Cell Culture Flasks (case)** — $124.50
   - **Antibody Detection ELISA Kit** — $349.00
   - **Cryogenic Storage Vials (100ct)** — $67.99
4. Add product images (use royalty-free lab equipment photos from Unsplash)
5. Add variants where appropriate (e.g., sizes, quantities)

## 4. Create Admin API Credentials

1. In your **dev store admin**, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Name: `Biophase Storefront`
4. Under **Configuration**, enable **Admin API access scopes**:
   - `read_products`
   - `read_product_listings`
5. Click **Install app**
6. Go to **API credentials** and note the **Client ID** and **Client secret**
   (used for the OAuth client credentials grant)

## 5. Create Storefront API Access Token (optional)

The Storefront API is used for cart and checkout operations.
Cart works **tokenless** out of the box (1,000 complexity limit).
Add a token for higher limits or access to metafields, customers, and menus.

Shopify offers two token types:

| Type | Prefix | Use case | Safe for browser? |
|------|--------|----------|-------------------|
| **Public** | `shpua_` | Client-side apps, higher rate limits | Yes |
| **Private** | `shpss_` | Server-side only, full API access | **No** |

This project uses the token **server-side only** (Next.js API routes), so either type works.

### Option A: Via the Headless channel (recommended)

1. In Shopify Admin, go to **Sales channels** → **Add** → **Headless**
2. Create a storefront inside the Headless channel
3. Copy the **public** or **private** Storefront token

### Option B: Via a custom app

1. In the same **Develop apps** screen, select your `Biophase Storefront` app
2. Under **Configuration**, enable **Storefront API access scopes**:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
3. Click **Save** and then go to **API credentials**
4. Under **Storefront API access token**, copy the token

> **Security:** Never prefix this env var with `NEXT_PUBLIC_` — it is used only
> in server-side API routes and must not be exposed to the browser.

## 6. Update Environment Variables

Paste your credentials in `.env.local`:

```env
SHOPIFY_STORE_URL=biophase-dev.myshopify.com
SHOPIFY_CLIENT_ID=<paste your client ID here>
SHOPIFY_CLIENT_SECRET=<paste your client secret here>
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<paste your storefront access token here>
```

## 7. Verify

```bash
# Start the dev server
npm run dev

# In another terminal, start the API server
cd api && node server.js

# Visit http://localhost:3000 — you should see your products
# Visit http://localhost:3001/api/docs — interactive Swagger UI
```

If products appear in the grid, the integration is working.
