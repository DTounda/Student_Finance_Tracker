# Student Finance Tracker - Spec.

## Summary.

Web application utilizing HTML, CSS, and JS to monitor student expenditure.

There is only one index.html; the navigation switches sections, with each section appearing one at a time, not separate pages.

## Data Model 

### A set of data (one transaction).

{
  id:           "txn_0001",                  
  description: "Lunch",       
  amount:      2000,                        
  category:    "Food",                      
  date:        "2025-09-29",             
  createdAt:   "2025-09-29T14:03:00.000Z", 
  updatedAt:   "2025-09-29T14:03:00.000Z",
}

The unique ID for a transaction, which is auto-generated.   Description which is validated by regex.   Amount is a number.   Category is pre-defined categories (meaning Food, Books, Transport, Entertainment, Fees, Other).   Date is when expense HAPPENED.   createdAt is when RECORD was first created (is auto, so set once only).  updatedAt is when was last edited and is auto, so bumped on edit.

### Settings (separate from records)

Stored with its own localStorage key.

localStorage keys: finance:records (the array of transactions) and finance:settings (the settings object).

{
  baseCurrency: "RWF",                   
  rates: { USD: 0.00077, XAF: 0.8 },        
  budgetCap: 500,                        
  categories: ["Food","Books","Transport","Entertainment","Fees","Other"]
}

The code baseCurrency helps during currency conversion, and rates help for managing exchange rates.  


### Accessibility Plan in Short(a11y)

- Proper use of semantic landmarks (header, nav, main, section, footer) and headings.

- There are labels that are related to the inputs and a visible focus style with a skip-to-content link.

- The aria-live attribute has been defined for normal news, or record added or 12 results. The budget warning flips to aria-live=assertive only when you go over the cap. 

- Keyboard-based navigation should function.

- Responsive design prioritizing mobile phones with three breakpoints for all devices.

## Important determinations.

- Single-page app with navigation that toggles sections.

- The numerical values are expressed in the base currency. Other currencies are shown by multiplying them by a manual rate.

- On a mobile device, these records display as cards, while on a laptop, as a sortable table.

