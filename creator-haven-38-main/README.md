# Creator Canvas

Gumroad Clone - Digital Product Marketplace
Build a full-stack Gumroad-like digital product marketplace as a BTech final year project. The platform allows creators to sell digital products (ebooks, courses, software, etc.) and buyers to discover and purchase them.

User Review Required
IMPORTANT

Tech Stack: Next.js 14 (App Router) + Prisma ORM + SQLite + NextAuth.js + Stripe (mock for demo). This is a full-stack project suitable for a BTech final year project with proper database, authentication, and payment flow.

NOTE

Design: We'll faithfully recreate Gumroad's neo-brutalist design — bold black borders, hard shadows, pink (#ff90e8) and yellow (#ffc900) accents, heavy sans-serif typography (Inter/Outfit from Google Fonts).

WARNING

Payments: Stripe will be integrated in test mode for the demo. No real payments will be processed. For your final presentation, you can showcase the complete flow using Stripe's test card numbers.

Proposed Changes
1. Project Initialization
[NEW] Project at C:\Users\riyan\.gemini\antigravity\scratch\gumroad-clone
Initialize Next.js 14 project with App Router, TypeScript, ESLint
Install dependencies: prisma, @prisma/client, next-auth, bcryptjs, stripe, react-icons, react-hot-toast
Configure Google Fonts (Inter + Outfit)
2. Database Schema (Prisma + SQLite)
[NEW] 
schema.prisma
Models:

User — id, name, email, password, avatar, bio, createdAt
Product — id, name, description, price, currency, coverImage, fileUrl, category, tags, sellerId, createdAt
Purchase — id, buyerId, productId, amount, status, createdAt
Review — id, rating, comment, userId, productId, createdAt
3. Authentication
[NEW] 
auth config
NextAuth.js with Credentials provider (email + password)
Session strategy: JWT
Login, Register, and Session management
[NEW] 
login page
[NEW] 
signup page
4. Public Pages (Frontend)
[NEW] 
landing page
Hero section: "Go from 0 to ₹1" with Start Selling CTA
Feature sections: Sell Anything, Sell Anywhere, Sell to Anyone
Categories ticker/carousel
Testimonial quotes
Footer with links
[NEW] 
features page
"Built for new beginnings" headline
Feature cards: Create storefront, Payments, Memberships, Subscriptions, Analytics, License keys, Multi-format
Creator testimonial quotes
[NEW] 
pricing page
Simple pricing: 10% + ₹50 per transaction
30% marketplace fee
Merchant of Record section
FAQ accordion
[NEW] 
discover page
Product grid with cards (image, title, creator, price, rating)
Category sidebar filter
Search bar with filters
Pagination
[NEW] 
product detail page
Product image, description, price
Creator info card
Buy now / Add to cart buttons
Reviews section with star ratings
[NEW] 
creator profile page
Creator bio, avatar, social links
Product grid from this creator
5. Creator Dashboard (Protected)
[NEW] 
dashboard page
Revenue overview: total earnings, sales count, this month
Recent sales table
Quick action buttons
[NEW] 
products management page
List of creator's products with edit/delete actions
Stats per product (views, sales, revenue)
[NEW] 
new product page
Product creation form: name, description, price, category, cover image upload, file upload
Preview before publish
[NEW] 
analytics page
Sales charts (bar/line charts)
Top products
Revenue breakdown
6. Shared Components
[NEW] Component files in components/ directory
Navbar — sticky header with Discover, Pricing, Features, Login, Start Selling
Footer — multi-column footer with links
ProductCard — neo-brutalist card with border, hard shadow, hover effect
CategorySidebar — collapsible category list
StarRating — star display and input component
PriceTag — Gumroad-style pennant price display
Button — multiple variants (primary pink, secondary, outline)
Modal — checkout/purchase modal
Toast — notification system
7. API Routes
[NEW] API routes in app/api/ directory
POST /api/auth/register — Create account
GET/POST /api/products — List all / Create product
GET/PUT/DELETE /api/products/[id] — Product CRUD
POST /api/purchases — Create purchase (mock payment)
GET /api/purchases — User's purchases
GET/POST /api/reviews — Product reviews
GET /api/dashboard/stats — Creator analytics
POST /api/upload — File upload handler
8. Design System (CSS)
[NEW] 
globals.css
Neo-brutalist design tokens:

Colors: --black: #000, --white: #fff, --pink: #ff90e8, --yellow: #ffc900, --bg: #f4f4f0
Borders: 2px solid #000 on most containers
Shadows: 4px 4px 0 #000 (hard/offset style)
Typography: Inter (body) + Outfit (headings), large bold headings
Buttons: pink fill with offset shadow, transforms on hover
Cards: white bg, thick border, hover grows shadow
Verification Plan
Browser Testing
Start dev server: cd C:\Users\riyan\.gemini\antigravity\scratch\gumroad-clone && npm run dev
Open http://localhost:3000 — verify landing page loads with hero, features, footer
Navigate to /features — verify all feature cards display
Navigate to /pricing — verify pricing info and FAQ
Navigate to /discover — verify product grid with sample data
Navigate to /signup — test account creation
Navigate to /login — test login flow
Navigate to /dashboard — verify protected route and dashboard content
Test product creation at /dashboard/products/new
Test purchasing a product on a product detail page
Manual Verification
User can register, login, and see their session
User can create and manage digital products
Discover page shows all public products with filtering
Products display correct info on detail pages
Purchase flow works with mock payment
Creator dashboard shows sales data
All pages are responsive (desktop + mobile)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5eca048a-f88e-4d01-8f2f-852afb88dc15).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
