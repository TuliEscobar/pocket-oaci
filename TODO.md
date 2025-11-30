# 🚀 OACI.ai Implementation Roadmap

## 💳 Payment & Subscription System (Pending)

### 1. Backend Integration
- [ ] **Stripe/LemonSqueezy Setup**:
  - [ ] Create products/prices in the payment provider dashboard.
  - [ ] Implement webhooks to handle:
    - `checkout.session.completed`: Activate Pro plan.
    - `customer.subscription.updated`: Handle upgrades/downgrades.
    - `customer.subscription.deleted`: Revert to Free plan.
  - [ ] Store `stripeCustomerId` or `subscriptionId` in Clerk user metadata.

### 2. Rate Limiting Logic (Refinement)
- [ ] **Current Implementation**:
  - [x] Basic daily counter in Clerk Metadata.
  - [x] Hard limit of 10 queries/day for Free users.
- [ ] **Future Improvements**:
  - [ ] Move rate limiting state to a faster store (Redis/KV) instead of Clerk Metadata to reduce latency and API limits.
  - [ ] Implement "sliding window" or "token bucket" for more robust limiting.

### 3. Pro Features
- [ ] **Chat History**:
  - [ ] Create a database schema (Postgres/Prisma) to store conversation history.
  - [ ] API endpoints to fetch/delete history.
  - [ ] UI sidebar to show past conversations.
- [ ] **Advanced Context**:
  - [ ] Increase `topK` retrieval for Pro users (e.g., from 8 to 20 chunks).
  - [ ] Allow uploading custom PDF documents (Personal Knowledge Base).

## 🛠️ Immediate Next Steps (Current Session)
- [x] **Plan Selection UI**:
  - [x] Modal to select Free vs Pro upon first login.
  - [x] "Free" option sets metadata and allows access.
  - [x] "Pro" option (mock) sets metadata and allows access.
- [x] **Enforce Limits**:
  - [x] Middleware/API check for `daily_queries` < 10 for Free users.
