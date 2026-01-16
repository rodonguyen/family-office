# Broker CSV Mapping Templates

This directory contains structured mapping templates that define how to parse CSV exports from different brokerages.

## Purpose

Finance Guru™ uses these JSON templates to:
1. **Understand broker-specific CSV formats** - Each broker exports data differently
2. **Map broker columns to Finance Guru fields** - Standardize data across brokers
3. **Enable automated parsing** - For supported brokers with full automation
4. **Guide manual mapping** - For unsupported brokers during onboarding

## Template Files

| File | Broker | Status | Use Case |
|------|--------|--------|----------|
| `fidelity-mapping.json` | Fidelity Investments | ✅ Fully Supported | Automated parsing (current implementation) |
| `schwab-mapping.json` | Charles Schwab | ⚠️ Coming Soon | Manual mapping (automated parsing planned) |
| `vanguard-mapping.json` | Vanguard | ⚠️ Coming Soon | Manual mapping (retirement accounts) |
| `generic-mapping-template.json` | Any Broker | 📝 Template | Create custom broker mappings |

## File Structure

Each mapping file contains:

```json
{
  "broker": "Broker Name",
  "status": "fully_supported|coming_soon|template",
  "positions_csv": {
    "file_pattern": "filename pattern",
    "required_columns": { /* column mappings */ },
    "optional_columns": { /* column mappings */ }
  },
  "balances_csv": {
    "file_pattern": "filename pattern",
    "required_fields": { /* field mappings */ }
  },
  "parsing_notes": { /* format specifics */ },
  "validation_rules": { /* data validation */ }
}
```

### Column Mapping Format

Each column mapping defines:
- **broker_column**: Exact column name in broker's CSV
- **data_type**: string, number, currency, percentage, date
- **example**: Sample value from actual CSV
- **finance_guru_field**: Internal field name
- **notes**: Special handling instructions

Example:
```json
{
  "symbol": {
    "fidelity_column": "Symbol",
    "data_type": "string",
    "example": "TSLA",
    "finance_guru_field": "ticker",
    "notes": "Stock ticker symbol"
  }
}
```

## How to Use

### For Supported Brokers (Fidelity)

No action needed - Finance Guru automatically detects and parses Fidelity CSVs.

### For Coming Soon Brokers (Schwab, Vanguard)

1. Export CSV from your broker
2. Finance Guru will detect it's not Fidelity format
3. Select your broker from the list during onboarding
4. System uses corresponding mapping template
5. You confirm column mappings match your CSV
6. Data imports successfully

### For Unsupported Brokers

1. Copy `generic-mapping-template.json` to `<your_broker>-mapping.json`
2. Export positions CSV from your broker
3. Open CSV in text editor to see column names
4. Edit your mapping file:
   - Replace `CHANGE_ME` with actual column names
   - Delete optional fields you don't need
   - Configure data format settings (delimiter, encoding, etc.)
5. Save mapping file
6. Run onboarding with your broker's CSV
7. (Optional) Submit your mapping to help others!

## Data Format Configuration

Templates include configuration for international formats:

```json
{
  "data_format_configuration": {
    "csv_delimiter": ",",           // or ";" or "\t"
    "decimal_separator": ".",       // "." for US, "," for EU
    "thousands_separator": ",",     // "," for US, "." for EU
    "currency_symbol": "$",         // "$", "€", "£", etc.
    "date_format": "MM/DD/YYYY"     // or "DD/MM/YYYY", "YYYY-MM-DD"
  }
}
```

## Validation Rules

Each template defines validation rules applied during import:

**Positions:**
- Symbol must not be empty
- Quantity must be positive
- Average Cost Basis must be positive

**Balances:**
- Total account value must be positive
- Margin debt should be negative (if used)
- Account equity percentage must be 0-100%

## CSV Types

Templates cover these CSV types:

1. **Positions CSV** (REQUIRED)
   - Holdings: ticker, quantity, cost basis
   - Updates: DataHub columns A, B, G, S

2. **Balances CSV** (REQUIRED)
   - Cash, margin debt, account totals
   - Updates: DataHub rows 37-39 (SPAXX, pending, margin)

3. **Transaction History CSV** (Optional)
   - All account transactions
   - Creates: Transaction log, Expense Tracker

4. **Dividend History CSV** (Optional)
   - Dividend payments
   - Updates: Dividends sheet input area

5. **Retirement Accounts CSV** (Optional)
   - IRA, 401k holdings
   - Updates: DataHub rows 46-62

## Broker Coverage Status

| Broker | Positions | Balances | Transactions | Dividends | Retirement |
|--------|-----------|----------|--------------|-----------|------------|
| **Fidelity** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Schwab** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Vanguard** | ⚠️ | ⚠️ | ⚠️ | N/A | ⚠️ |
| **TD Ameritrade** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **E*TRADE** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Robinhood** | ❌ | ❌ | ❌ | ❌ | ❌ |

Legend:
- ✅ Fully automated parsing
- ⚠️ Manual mapping template available
- ❌ Not yet supported (use generic template)

## Testing Your Mapping

Checklist for validating a new broker mapping:

```
[ ] 1. Exported test CSV from broker
[ ] 2. Identified all column names (exact, case-sensitive)
[ ] 3. Mapped all required fields
[ ] 4. Mapped optional fields (if available)
[ ] 5. Configured data format settings
[ ] 6. Tested import with sample data
[ ] 7. Verified values in Google Sheets
[ ] 8. Confirmed formulas still work
[ ] 9. Checked margin debt sign (negative)
[ ] 10. Validated date parsing
```

## Common Issues

### Problem: Column Not Found

**Cause:** Column name doesn't match exactly (case-sensitive, extra spaces)

**Solution:**
1. Open CSV in text editor (not Excel)
2. Copy exact column name from header row
3. Paste into mapping file
4. Watch for trailing spaces or special characters

### Problem: Numbers Parse Incorrectly

**Cause:** Decimal/thousands separator mismatch

**Solution:** Check your broker's format:
- US: 1,234.56 (comma thousands, period decimal)
- EU: 1.234,56 (period thousands, comma decimal)

Update `data_format_configuration` accordingly.

### Problem: Encoding Error

**Cause:** File has BOM (Byte Order Mark) or non-UTF-8 encoding

**Solution:** Try these encodings in order:
1. `utf-8-sig` (for files with BOM)
2. `utf-8` (standard)
3. `latin-1` (for European files)

### Problem: Margin Debt Shows Positive

**Cause:** Broker exports margin as positive number

**Solution:** Add to your mapping:
```json
"net_debit": {
  "your_broker_column": "Margin Balance",
  "sign_conversion": "negate"
}
```

## Contributing

Help expand broker coverage:

1. **Test a mapping** - Try existing template with your broker
2. **Share anonymized CSV** - Provide column headers (no real data!)
3. **Submit mapping** - File PR with new broker mapping
4. **Report issues** - File GitHub issue for parsing errors

**Anonymizing CSV for sharing:**
```bash
# Keep header, replace data rows with XXXX
head -1 Portfolio_Positions.csv > sample.csv
echo "XXXX,XXXX,XXXX,XXXX,XXXX" >> sample.csv
```

## Related Documentation

- **CSV Upload Guide**: `docs/required-csv-uploads.md`
- **Broker Export Guide**: `docs/broker-csv-export-guide.md`
- **Onboarding Evaluation**: `fin-guru-private/onboarding-summary.md`

## Future Plans

### Phase 5 (Automated Parsing)
- [ ] Schwab automated parsing
- [ ] Vanguard automated parsing
- [ ] TD Ameritrade support
- [ ] E*TRADE support

### Phase 6 (Advanced Features)
- [ ] Robinhood API integration
- [ ] Multi-broker aggregation
- [ ] Historical cost basis tracking
- [ ] Corporate action detection

## Security Note

**Mapping files are safe to commit** - they contain only column names and format specifications, no actual financial data.

**CSV files must NEVER be committed** - they're in `.gitignore`.

---

**Last Updated**: 2026-01-16
**Templates Available**: 4
**Fully Supported Brokers**: 1 (Fidelity)
**Coming Soon**: 2 (Schwab, Vanguard)
