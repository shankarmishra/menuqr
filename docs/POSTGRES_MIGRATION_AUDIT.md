# PostgreSQL Migration Audit

## MongoDB Usage Scan
The initial audit revealed that the codebase had already undergone a partial refactor to remove the `mongodb` NPM dependency and introduce `pg` within `db.js`.
However, `server.js` was left in a fractured state with dangling references to the legacy MongoDB `collections` architecture, specifically:
- `collections.users.findOne({ email: input.email })` in the login handler.
- Legacy array-embedded document expectations for `menuItems` in the Client REST API.

## Data Source
- **MongoDB Database:** NOT AVAILABLE. (The previous temporary `.local-db` instance was wiped prior to this phase, and no live cluster URI was provided).
- **Migration Path:** Consequently, no legacy MongoDB data migration was performed. We proceeded directly to SQL schema initialization.

## Relational Architecture Transformation
The largest structural change was addressing the flat `menuItems` array stored on the `Client` document.
We introduced the following normalized PostgreSQL tables to meet Phase 2 readiness:
- `menus`
- `menu_categories`
- `menu_items` (Foreign keys to `menus.id` and `menu_categories.id`)

## API Compatibility Preservation
To satisfy the strict requirement of not breaking current frontend React components:
- `POST /admin/clients` dynamically unpacks the JSON array of items, builds a transient `menus` row, extracts distinct `category` strings into `menu_categories`, and inserts the `menu_items`.
- `GET /admin/clients` uses advanced `json_agg` and `json_build_object` functions inside a `LEFT JOIN` tree to collapse the relational structure back into the exact JSON array signature the frontend expects.
