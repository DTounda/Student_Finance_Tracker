# Student Finance Tracker

An accessible, responsive, single-page web app that helps students record expenses, search and sort them, watch a spending cap, and see where their money goes — built with **vanilla HTML, CSS, and JavaScript** (no frameworks).

**Theme:** Student Finance Tracker (budgets, transactions, search).

## Links

- **Web app:** https://dtounda.github.io/Student_Finance_Tracker/
- **GitHub repository:** https://github.com/DTounda/Student_Finance_Tracker
- **Demo video:** https://youtu.be/MJFHok8AuLQ

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Data Model & Persistence](#data-model--persistence)
- [Currency Conversion](#currency-conversion)
- [Regex Catalog](#regex-catalog)
- [Search](#search)
- [Keyboard Map](#keyboard-map)
- [Accessibility](#accessibility)
- [Running the Tests](#running-the-tests)
- [Author](#author)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Overview

Student Finance Tracker is a client-side expense tracker. Everything runs in the browser and is saved to `localStorage`, so data persists across reloads with no backend.

It is a **single-page application**: there is only one `index.html`, and the navigation toggles one `<section>` at a time (About, Dashboard, Records, Add / Edit, Settings) instead of loading separate pages.

Key design decisions:

- Amounts are stored in a single **base currency (RWF)**. Other currencies are shown by dividing the base amount by a manual rate set in Settings.
- On a phone the records render as **cards**; on a larger screen they render as a **sortable table**.
- Validation and live search are both driven by **regular expressions**, including one advanced back-reference pattern.

## Features

- **About** section with purpose and contact details (GitHub, email).
- **Dashboard** with live stats: total records, total spending (in the chosen currency), top category, and a last-7-days count.
- **Spending-by-category pie chart** drawn in SVG, with a colour-coded legend.
- **Spending cap** with a remaining / overage message announced through an ARIA live region (polite while under, assertive when exceeded).
- **Records table** (cards on mobile) listing description, amount, category, and date.
- **Live regex search** that filters by description and highlights matches with `<mark>`.
- **Sorting** by amount, description (A–Z), or date.
- **Add / Edit form** with four regex-validated fields and inline, per-field error messages.
- **Edit and delete** per row (delete asks for confirmation); state, table, stats, cap, and `updatedAt` all refresh.
- **Settings:** spending cap, display currency (RWF / USD / XAF) with manual exchange rates, JSON **export**, and JSON **import** with structure validation.
- **Persistence:** every change is auto-saved to `localStorage`; corrupt saved data falls back to the seed records instead of crashing.
- **Responsive, mobile-first layout** across three breakpoints (~360px / 768px / 1024px) plus a subtle fade-in animation on section changes.

## Tech Stack

- HTML5 (semantic landmarks)
- CSS3 (Flexbox, CSS Grid, media queries, keyframe animation)
- Vanilla JavaScript (ES2015+), no libraries or frameworks
- Browser `localStorage` for persistence
- SVG for the category chart

## Project Structure

```
student-finance-tracker/
├── index.html            # App shell and all sections
├── tests.html            # Validator assertions (PASS/FAIL output)
├── seed.json             # 11 diverse sample records
├── README.md             # This file
├── PROJECT_DESIGN.md     # Spec, data model, and a11y plan (M1)
├── .gitignore
├── styles/
│   └── style.css         # All styling and responsive breakpoints
└── scripts/
    ├── state.js          # In-memory `records` array + `editingId` flag
    ├── storage.js        # localStorage load/save, JSON import/export, cap & currency persistence
    ├── search.js         # Safe regex compiler + highlight helper
    ├── ui.js             # Renders table, stats, cap message, chart; sort, search, edit/delete, currency
    ├── validator.js      # The five regex validation functions
    ├── form.js           # Add/Edit submit handling and inline error display
    └── navigation.js     # Section switching for the single-page nav
```

The scripts are loaded in dependency order (`state → storage → search → ui → validator → form → navigation`), because later files use values defined in earlier ones (for example, `ui.js` reads `records` from `state.js`, and `navigation.js` uses helpers from `form.js`).

## Usage

- **Add an expense:** go to **Add / Edit**, fill in description, amount, category, and date, then press **Add expense**. Invalid fields show an inline message and the record is not saved.
- **Edit:** press **Edit** on a row; the form fills in and the button changes to **Save**. Submitting updates that record and bumps its `updatedAt`.
- **Delete:** press **Delete** and confirm.
- **Search:** type a pattern into the search box on **Records**; matching descriptions are filtered and highlighted in real time.
- **Sort:** use the **Sort by** dropdown (amount, description, or date).
- **Spending cap:** set it under **Settings → Spending cap**; the Dashboard message updates to show what's remaining, or how far over you are.
- **Currency:** pick the display currency on the Dashboard and set the rates under **Settings → Exchange rates**.
- **Export / Import:** under **Settings → Stored data**, export all records to `records.json`, or import a JSON file (it is validated before loading, and malformed files are rejected with a message). Import the included `seed.json` to load 11 sample records.

## Data Model & Persistence

Each record:

```json
{
  "id": "rec_0001",
  "description": "Lunch at cafeteria",
  "amount": 3500,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T12:03:00.000Z",
  "updatedAt": "2025-09-25T12:03:00.000Z"
}
```

- `id` — auto-generated; new records use `"rec_" + Date.now()`.
- `date` — when the expense happened.
- `createdAt` — set once, when the record is first created.
- `updatedAt` — bumped on every edit.

Data is saved under separate `localStorage` keys:

| Key | Stores |
|---|---|
| `finance:records` | the array of transactions |
| `finance:cap` | spending cap in the base currency (default `1000000`) |
| `finance:currency` | display currency (`RWF`, `USD`, or `XAF`) |
| `finance:rate-usd` | exchange rate, RWF per 1 USD (default `1300`) |
| `finance:rate-xaf` | exchange rate, RWF per 1 XAF (default `2.2`) |

On startup the saved records are parsed inside a `try/catch` and checked for the correct shape; if either fails, the app falls back to the seed records rather than throwing.

## Currency Conversion

The base currency is **RWF**. Rates are stored as *how many RWF equal one unit* of the foreign currency, and the Dashboard total is converted by dividing:

```
displayed = amountInRWF / rate
```

So a USD rate of `1300` means 1 USD = 1300 RWF, and 13,000 RWF is shown as 10.00 USD. (The records table always shows raw RWF; the currency setting affects the Dashboard's total-spending figure.)

## Regex Catalog

All validation patterns live in `scripts/validator.js`. The fields are checked on form submit, with a matching inline error message.

| Field | Rule | Pattern | Valid | Invalid |
|---|---|---|---|---|
| Amount | Non-negative number, up to 2 decimals, no leading zeros | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | `3500`, `25.50`, `0` | `12.500`, `01`, `-5` |
| Description | No leading or trailing whitespace | `^\S(?:.*\S)?$` | `Lunch at cafeteria` | `" lunch"`, `"lunch "` |
| Category | Letters, with single spaces or hyphens between words | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | `Food`, `Public Transport`, `Self-Care` | `Food123`, `" Food"` |
| Date | `YYYY-MM-DD`, month `01`–`12`, day `01`–`31` | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | `2025-09-25` | `2025-13-01`, `2025-9-5` |
| Duplicate word **(advanced — back-reference)** | Catches the same word repeated in a row | `\b(\w+)\s+\1\b` | `fine fine`, `the the` | `fine line` |

The duplicate-word check uses a **back-reference (`\1`)**, satisfying the requirement for at least one advanced pattern.

> Note: the date pattern validates *format*, not the calendar — for example `2025-02-29` passes the pattern even though 2025 is not a leap year. This is intentional for the scope of the assignment and is included as an edge case in `seed.json`.

## Search

The search box on the Records section compiles whatever you type into a case-insensitive regex, using a safe compiler so an unfinished pattern never crashes the app:

```js
function compileRegex(input) {
  try {
    return input ? new RegExp(input, "i") : null;
  } catch {
    return null;   // invalid pattern → show all records
  }
}
```

Matches in the description are wrapped in `<mark>` for highlighting. Some patterns to try against the seed data:

- `coffee|tea` → matches “Coffee with friends” and “Tea and a croissant”
- `^Bus` → matches “Bus pass”
- `\bfine\b` → matches “Late library fine fine”
- `book` → matches “Chemistry textbook” and “Notebook set 5-pack”

An invalid pattern such as `(` is caught and simply shows all records.

## Keyboard Map

The whole app is operable with the keyboard alone.

| Key | Action |
|---|---|
| `Tab` / `Shift`+`Tab` | Move focus forward / backward through links, fields, and buttons |
| `Enter` (on “Skip to content”) | Jump straight to the main content |
| `Enter` (on a nav link) | Switch to that section |
| `Enter` (in the form / on “Add expense” or “Save”) | Submit the add or edit form |
| `Enter` / `Space` (on **Edit**) | Load that record into the form for editing |
| `Enter` / `Space` (on **Delete**) | Open the delete confirmation |
| `Enter` / `Esc` (in the confirm dialog) | Confirm / cancel the deletion |
| `↑` / `↓` (on the Sort or Currency dropdowns) | Change the selected option |
| Typing (in Search) | Filters the records live as you type |

## Accessibility

- **Semantic landmarks:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- **Heading hierarchy:** one `<h1>`, an `<h2>` per section, `<h3>` for sub-blocks.
- **Labelled inputs:** every field has a `<label>` bound with `for` / `id`.
- **Skip-to-content link** that becomes visible on keyboard focus.
- **Visible focus styles** on every interactive element (`:focus-visible` outline).
- **ARIA live regions:** the spending-cap message is `aria-live="polite"` and switches to `assertive` when the cap is exceeded; the import status uses `role="status"`; form errors use `role="alert"`.
- **Descriptive associations:** inputs are linked to their help and error text with `aria-describedby`.
- **The SVG chart** carries `role="img"` and a descriptive `aria-label`.
- **Contrast:** dark brown text on a light cream background, and white text on the brown header, for readable contrast.
- **Mobile:** the records table reflows into labelled cards (via `data-label`) instead of a horizontally scrolling table.

## Running the Tests

A small assertion runner lives in `tests.html`.

1. Open `tests.html` in your browser by double-clicking it.
2. It loads `scripts/validator.js` and runs each check, printing `PASS` or `FAIL` in a list.

It covers the amount format (valid and over-precise decimals), the description leading-space rule, the category letters-only rule, the date month bounds, and the duplicate-word back-reference. A successful run shows `PASS` on every line.

## Author

**Dorcase Lesly Nana Tounda**

- GitHub: [@DTounda](https://github.com/DTounda)
- Email: d.nanatoun@alustudent.com

This repository is individual work; the contribution history reflects a single author.

## License

Released for educational purposes as part of African Leadership University's coursework.
