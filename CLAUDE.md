# BioPhase Solutions — Jr. Front-End Developer Portfolio Project

## Project Overview

A custom Shopify storefront with a React-powered frontend, responsive design, and RESTful API integration. Built to directly mirror the target job's tech stack and demonstrate immediate productivity on day one.

## Stack

- **Frontend:** React (Next.js), HTML5, CSS3, Bootstrap 5
- **E-Commerce:** Shopify Storefront API + Liquid theme customization
- **APIs:** Shopify REST/GraphQL Storefront API, Node.js/Express proxy layer
- **Tooling:** Git (GitHub), Figma, Vercel

## Project Structure

```
/
├── components/         # Reusable React components
├── pages/              # Next.js pages (product listing, detail, cart)
├── lib/                # API utilities and Shopify client
├── styles/             # Global CSS and Bootstrap overrides
├── shopify-theme/      # Custom Liquid theme sections
│   └── sections/       # Featured products, custom filters
├── api/                # Express proxy server
│   └── routes/         # Product and cart route handlers
├── public/             # Static assets
└── docs/               # API documentation (Postman collection or Swagger)
```

## Core Features

### 1. Custom Shopify Liquid Theme Section

- Build a custom Liquid section (e.g. Featured Products carousel or product filter)
- Demonstrates direct understanding of Shopify's templating system

### 2. React Storefront UI

- Headless React layer consuming Shopify Storefront API via GraphQL
- Pages: product listing, product detail, cart
- Fully responsive using Bootstrap grid and utility classes

### 3. RESTful API Integration

- Small Express API proxying Shopify product/inventory data
- Returns clean JSON responses
- Documented with a Postman collection or Swagger spec

### 4. Responsive Design

- Mobile-first layout throughout
- At least one breakpoint-specific behavior (e.g. collapsible nav on mobile, reflowing product grid)
- Demonstrates responsive design best practices directly

### 5. Agile Workflow Simulation

- Branching strategy: `main`, `dev`, feature branches
- Meaningful, scoped commit messages
- GitHub Projects Kanban board
- Concise README with setup instructions

## Development Timeline

| Days | Tasks                                                                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1–2  | Set up Shopify Partner account, scaffold Next.js app, connect Storefront API, push initial repo with branching strategy |
| 3–5  | Build product listing and detail pages with Bootstrap responsive layout; build custom Liquid theme section in parallel  |
| 6–7  | Build Express API proxy layer, add cart functionality, polish UX (spacing, typography, hover states, loading states)    |
| 8    | Deploy to Vercel, write README, record Loom walkthrough demonstrating Shopify integration and responsive behavior       |

## UX Standards

Pay close attention to:

- Consistent spacing and typography
- Hover and focus states on interactive elements
- Loading and empty states
- Accessible color contrast and semantic HTML
- Smooth layout reflow across breakpoints

These details directly reflect the job posting's emphasis on "passion for high quality UX and attention to detail."

## Git Conventions

```
feat: add product listing page with Bootstrap grid
fix: correct cart item quantity update logic
chore: connect Shopify Storefront API client
style: apply mobile-first responsive breakpoints
```

## Environment Variables

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Getting Started

```bash
# Install dependencies
npm install

# Run Next.js dev server
npm run dev

# Run Express API server (separate terminal)
cd api && node server.js
```

## Application Context

This project is built for a contract-to-hire role at an Orange County biomedical products company sourced through BioPhase Solutions. The primary goal is to eliminate ramp-up doubt by matching the exact stack (Shopify, Liquid, React, Bootstrap, RESTful APIs, Git) and demonstrating readiness to contribute in an agile environment from week one.

In the cover letter, briefly acknowledge comfort working in a detail-oriented, regulated product environment — relevant given the biomedical industry context.
