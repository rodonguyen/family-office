# Google Sheets Scripts

Apps Script files for the Finance Guru Portfolio Tracker spreadsheet.

## Folder Structure

```
google-sheets/
└── portfolio-optimizer/     # All Apps Scripts (clasp-enabled)
    ├── Code.js              # Portfolio allocation optimizer
    ├── Dividend.js          # Dividend data fetching
    ├── Hedge.js             # Black-Scholes hedge analysis
    ├── Fire Model.js        # FIRE calculations
    ├── History.js           # Historical price data
    ├── NAV Data.js          # NAV tracking
    ├── ExpenseSync.js       # Transactions → Expense Tracker sync
    ├── .clasp.json          # Clasp configuration
    ├── appsscript.json      # Apps Script manifest
    └── README.md            # Detailed documentation
```

## Quick Start

### Deploy Changes

```bash
cd scripts/google-sheets/portfolio-optimizer/
clasp push
```

### Pull Latest from Google

```bash
clasp pull
```

### Open in Browser

```bash
clasp open
```

## Key Scripts

| Script | Purpose | Menu Item |
|--------|---------|-----------|
| `Code.js` | Portfolio allocation optimization | Portfolio Optimizer > Deposit |
| `Dividend.js` | Fetch dividend data | Portfolio Optimizer > Update Dividend Data |
| `ExpenseSync.js` | Sync expenses from Transactions | Expense Sync > Sync Expenses |
| `Hedge.js` | Hedge position analysis | Portfolio Optimizer > Hedge Analysis |

## Documentation

See `portfolio-optimizer/README.md` for detailed documentation on each module.

---

**Last Updated**: 2026-01-02
