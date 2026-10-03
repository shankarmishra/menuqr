# PostgreSQL Architecture

## Rationale
MenuQR shifted from MongoDB to PostgreSQL to leverage strict relational integrity, enforced schemas, and ACID transaction guarantees. This is critical for multi-tenant SaaS environments where data isolation (Tenant A cannot see Tenant B's data) is paramount and best enforced via Foreign Key constraints.

## Database Schema (Phase 1.5)

```mermaid
erDiagram
    users {
        VARCHAR id PK
        VARCHAR email UK
        VARCHAR role
        VARCHAR tenant_id FK
    }
    clients {
        VARCHAR id PK
        VARCHAR public_id UK
        VARCHAR business_name
    }
    menus {
        VARCHAR id PK
        VARCHAR tenant_id FK
        VARCHAR status
    }
    menu_categories {
        VARCHAR id PK
        VARCHAR menu_id FK
        VARCHAR tenant_id FK
        VARCHAR name
    }
    menu_items {
        VARCHAR id PK
        VARCHAR menu_id FK
        VARCHAR category_id FK
        VARCHAR name
        DECIMAL price
    }

    clients ||--o{ users : "owns"
    clients ||--o{ menus : "owns"
    menus ||--o{ menu_categories : "contains"
    menu_categories ||--o{ menu_items : "contains"
```

## Setup & Environment
The application uses the `pg` adapter.
Configuration is read exclusively from `DATABASE_URL` in the `.env`.

Example:
`DATABASE_URL=postgres://postgres:password@localhost:5432/menuqr`

The application automatically executes `schema.sql` on boot to initialize missing tables, ensuring deterministic infrastructure deployment.
