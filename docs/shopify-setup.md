# Shopify Partner & Dev Store Setup

Follow these steps to get your Storefront API credentials.

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

## 4. Create a Storefront API Access Token

1. In your **dev store admin**, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Name: `Biophase Storefront`
4. Under **Configuration**, enable **Storefront API access scopes**:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
5. Click **Install app**
6. Go to **API credentials** and copy the **Storefront API access token**

## 5. Update Environment Variables

Paste your credentials in `.env`:

```env
SHOPIFY_STORE_URL=biophase-dev.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<paste your token here>
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 6. Verify

```bash
# Start the dev server
npm run dev

# In another terminal, start the API server
cd api && node server.js

# Visit http://localhost:3000 — you should see your products
# Visit http://localhost:3001/api/docs — interactive Swagger UI
```

If products appear in the grid, the integration is working.
