# BioPhase Storefront

A custom Shopify storefront with a headless React frontend, responsive Bootstrap layout, and an Express API proxy — built for a biomedical products company.

## Tech Stack

- **Frontend:** Next.js (Pages Router) · React 19 · Bootstrap 5 · Sass
- **E-Commerce:** Shopify Storefront API (products + cart/checkout)
- **API Layer:** Next.js API routes (production) · Express proxy (local dev) · Swagger/OpenAPI docs
- **Theme:** Custom Shopify Liquid section
- **Deployment:** Vercel

## Project Structure

```
├── components/           # React components (Layout, Navbar, ProductCard, etc.)
├── pages/                # Next.js pages (index, product detail, cart)
├── lib/                  # Shopify Storefront API client & cart context
├── styles/               # Bootstrap overrides (SCSS) & global CSS
├── shopify-theme/        # Custom Liquid theme sections
│   └── sections/         # Featured Products carousel
├── api/                  # Express proxy server
│   ├── routes/           # Product & cart API routes
│   └── lib/              # Shopify API client (server-side)
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Shopify Partner](https://partners.shopify.com/) account with a development store
- Shopify Storefront API access (unlock Online Store channel for tokenless access, or create a Storefront Access Token)

### 1. Install dependencies

```bash
# Frontend
npm install

# API server
cd api && npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your Shopify credentials:

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token  # optional — tokenless works
```

### 3. Run development servers

```bash
# Terminal 1 — Next.js frontend (http://localhost:3000)
npm run dev

# Terminal 2 — Express API proxy (http://localhost:3001)
cd api && node server.js
```

### 4. API Documentation

With the Express server running, visit [http://localhost:3001/api/docs](http://localhost:3001/api/docs) for the interactive Swagger UI.

## Features

| Feature             | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| **Product Listing** | SSG grid with ISR (60s revalidation), responsive 1/2/3 column layout      |
| **Product Detail**  | Image gallery, variant selector, add-to-cart, mobile sticky bar           |
| **Cart**            | Shopify Cart API integration, real checkout, desktop table + mobile cards |
| **Liquid Theme**    | Featured Products carousel section for Shopify Theme Editor               |
| **API Routes**      | Next.js API routes (products + cart), Express dev server, Swagger docs    |
| **Responsive**      | Mobile-first Bootstrap grid, collapsible nav, breakpoint behavior         |

## Git Conventions

```
feat: add product listing page with Bootstrap grid
fix: correct cart item quantity update logic
chore: connect Shopify Storefront API client
style: apply mobile-first responsive breakpoints
```

## Branching Strategy

- `main` — production-ready code
- `dev` — integration branch
- `feat/*` — feature branches

## Deployment

Deploy the Next.js frontend to [Vercel](https://vercel.com). Set the same environment variables in the Vercel dashboard.

## License

Private — built as a portfolio project for BioPhase Solutions.
