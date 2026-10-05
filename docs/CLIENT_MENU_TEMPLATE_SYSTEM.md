# CLIENT MENU TEMPLATE SYSTEM ARCHITECTURE

## 1. Overview
The MENUQR Menu Template System decouples restaurant data from visual presentation. Restaurant owners create their menu content once (categories, dishes, prices, descriptions, images), and can seamlessly switch between 20 architecturally distinct menu designs without losing any data or altering their permanent QR code.

## 2. Core Architecture
- **Data Model:** `src/data/menuTemplates.ts` defines `MenuTemplate` interfaces, template configurations, filter categories, and demo restaurant datasets.
- **Rendering Engine:** `src/components/menu-builder/MenuTemplateRenderer.tsx` takes a template ID and restaurant dataset to render a structurally distinct layout (centered, two-column, card-grid, editorial, etc.).
- **Marketplace Gallery:** `src/components/menu-builder/TemplateGallery.tsx` provides search, 12 category filter chips, live rendered mini-menu previews, and modal preview triggers.
- **Modal Preview:** `src/components/menu-builder/TemplatePreviewModal.tsx` provides high-resolution phone frame previews and architectural breakdown before applying.

## 3. Data Injection Protocol
When a template is selected:
1. `updateSettings({ activeTemplate: templateId })` persists the template ID.
2. Restaurant name, categories, dishes, prices, and diet types are dynamically injected into `{restaurant.name}`, `{item.name}`, `{item.price}`, etc.
3. No hardcoded text exists in template layouts.
