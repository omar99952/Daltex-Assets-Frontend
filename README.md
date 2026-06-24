# DALTEX HQ — IT Asset Management

A fully connected, multi-page React app for IT asset management: login, home
launcher, dashboard, inventory, employee directory, branches, and an
end-to-end hardware checkout (assignment) flow that generates a printable
delivery contract.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed in your terminal (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

To lint:

```bash
npm run lint
```

## Project structure

```
src/
  assets/                    # Static assets (images, etc.) — empty by default
  context/
    AppContext.jsx           # Global state: assets, employees, branches, navigation, auth
  data/
    seedData.js               # Mock seed data (employees, assets, branches, activity)
  components/                 # Reusable UI building blocks
    Card.jsx
    BackButton.jsx
    CategoryIcon.jsx
    Misc.jsx                   # Dot, Row, Field
    StatusPill.jsx
    StatCard.jsx
    Modal.jsx
    FormField.jsx              # Shared form field + input style for modals
    AddDeviceModal.jsx
    EmployeeFormModal.jsx      # Handles both "add employee" and "edit employee"
    ConfirmDialog.jsx
    HelpGuideModal.jsx
    CsvPreviewModal.jsx
    exportUtils.js             # CSV/PDF/print generation helpers
    Sidebar.jsx                # Collapsible sidebar navigation
    TopBar.jsx
    TopBarPopovers.jsx         # Notifications, Settings, Help popovers
  pages/                       # One file per screen (or closely related screens)
    Login.jsx
    HomePage.jsx               # Big-button launcher for each major section
    Dashboard.jsx
    Inventory.jsx              # Category picker, status view, category view, asset detail
    EmployeeDirectory.jsx
    EmployeeDetail.jsx
    Branches.jsx
    BranchDetail.jsx
    AssignmentsLog.jsx
    NewAssignment.jsx          # 3-step hardware checkout wizard (also handles edits)
    ContractPreview.jsx
  App.css                      # Small cross-cutting styles: focus rings, scrollbars, resets
  App.jsx                      # App shell: sidebar + topbar + page router + top-level routes
  index.css                    # Global reset + font import
  main.jsx                     # React entry point
  theme.js                     # Shared color constants (NAVY, ORANGE)
index.html
package.json
eslint.config.js
vite.config.js
```

## Features

- **Login** — sign-in screen with two demo accounts (clickable to autofill).
- **Home** — a launcher page with one big button per section (Dashboard,
  Inventory, Employees, Branches, Assignments), each showing a live count.
- **Real back navigation** — every "Back" button returns to whatever page you
  actually came from (a history stack), not a hardcoded page.
- **Collapsible sidebar** — toggle between full and icon-only widths.
- **Inventory** — a category picker (PCs, Monitors, Printers, Networking,
  Peripherals) leads into per-category tables; clicking any row opens a full
  asset detail page. Add Device, search, and CSV/PDF export are wired in.
- **Employees** — full CRUD: add, edit in place, delete (with confirmation
  and automatic asset return), search, sort, and filter by status/department.
- **Assignments** — a 3-step checkout wizard supporting both individual
  employees and branch/department recipients. Editing an existing assignment
  re-opens the wizard pre-filled with its current details instead of
  resetting it.
- **Delivery contracts** — auto-generated after a successful assignment, with
  a working "Print Contract" button that opens a real print dialog.
- **Notifications / Settings / Help** — functional popovers in the top bar:
  a live activity feed with unread indicators, toggleable preferences, and a
  quick-reference help guide.
- **Export everywhere** — every "Export" action opens a preview modal with a
  table/raw-CSV toggle, a real CSV download, and a "Save as PDF" option.

## How the data flows

All state lives in `AppContext` and is shared across every page:

- **Assigning** an asset (via the New Assignment wizard) moves it from
  `In Stock` to `Assigned`, links it to the recipient, logs an activity entry,
  and generates a delivery contract.
- **Returning** an asset puts it back into `In Stock` and logs the event.
- **Adding a device** creates a new asset with status `Unregistered`.
- **Employee CRUD** keeps assets consistent — deleting an employee returns
  any of their assigned assets to stock automatically.
- Dashboard, Inventory, and Assignments counts all derive from the same
  `assets` array, so they stay in sync automatically.

## Notes

- Icons are from [lucide-react](https://lucide.dev/).
- No router library is used — navigation is handled by a `page` string plus
  a history stack in context (`navigateTo` / `goBack`), with a simple switch
  inside `Shell`. Swap in `react-router` if you need deep-linkable URLs.
- Login is a front-end-only demo (no real backend/auth). Credentials are
  listed directly on the login screen.
- Dashboard headline stats add fixed offsets on top of the live mock data so
  they match the original design's numbers; the live portion still reacts
  correctly to assign/return/add actions.
