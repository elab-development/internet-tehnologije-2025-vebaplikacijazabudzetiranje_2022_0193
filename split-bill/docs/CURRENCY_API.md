# 💱 Currency API Documentation

## Overview

SplitBill supports multiple currencies using the **ExchangeRate-API** for real-time exchange rates.

---

## Supported Currencies

| Code | Name | Symbol |
|------|------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| RSD | Serbian Dinar | RSD |
| JPY | Japanese Yen | ¥ |
| CAD | Canadian Dollar | C$ |
| AUD | Australian Dollar | A$ |
| CHF | Swiss Franc | CHF |

---

## API Endpoints

### Get Exchange Rates

```
GET /api/currency/rates?base=USD
```

**Response:**

```json
{
  "base": "USD",
  "date": "2024-01-20",
  "rates": {
    "EUR": 0.9215,
    "GBP": 0.7925,
    "RSD": 107.50,
    "JPY": 149.25,
    ...
  }
}
```

### Convert Currency

```
GET /api/currency/convert?amount=100&from=USD&to=EUR
```

**Response:**

```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR",
  "converted": 92.15,
  "rate": 0.9215
}
```

### User Currency Preference

**Get:**
```
GET /api/profile/currency
```

**Response:**
```json
{
  "currency": "USD"
}
```

**Update:**
```
PUT /api/profile/currency
Content-Type: application/json

{
  "currency": "EUR"
}
```

---

## Usage Examples

### React Hook

```typescript
import { useCurrency } from '@/hooks/useCurrency';

function MyComponent() {
  const { preferredCurrency, updateCurrency, isLoading } = useCurrency();

  if (isLoading) return <div>Loading...</div>;

  return (
    <select
      value={preferredCurrency}
      onChange={(e) => updateCurrency(e.target.value)}
    >
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="GBP">GBP</option>
      <option value="RSD">RSD</option>
    </select>
  );
}
```

### Currency Converter Hook

```typescript
import { useCurrencyConverter } from '@/hooks/useCurrency';
import { SupportedCurrency } from '@/lib/currency/types';

function ConversionExample() {
  const { convert, isConverting } = useCurrencyConverter();

  const handleConvert = async () => {
    const result = await convert(
      100,
      SupportedCurrency.USD,
      SupportedCurrency.EUR
    );
    console.log(result); // 92.15
  };

  return (
    <button onClick={handleConvert} disabled={isConverting}>
      {isConverting ? 'Converting...' : 'Convert'}
    </button>
  );
}
```

### Direct Conversion

```typescript
import { convertAmount, formatCurrency } from '@/lib/currency';
import { SupportedCurrency } from '@/lib/currency/types';

// Convert amount
const usdAmount = 100;
const eurAmount = await convertAmount(
  usdAmount,
  SupportedCurrency.USD,
  SupportedCurrency.EUR
);
console.log(eurAmount); // 92.15

// Format currency
const formatted = formatCurrency(92.15, SupportedCurrency.EUR);
console.log(formatted); // €92.15
```

### Format Currency with Options

```typescript
import { formatCurrency } from '@/lib/currency';
import { SupportedCurrency } from '@/lib/currency/types';

// With symbol (default)
formatCurrency(100, SupportedCurrency.USD);
// Output: $100.00

// Without symbol
formatCurrency(100, SupportedCurrency.USD, { showSymbol: false });
// Output: 100.00

// With currency code
formatCurrency(100, SupportedCurrency.USD, { showCode: true });
// Output: $100.00 USD

// Custom decimals
formatCurrency(100.123, SupportedCurrency.USD, { decimals: 3 });
// Output: $100.123
```

### Currency Selector Component

```typescript
import { CurrencySelector } from '@/components/currency/CurrencySelector';
import { useState } from 'react';
import { SupportedCurrency } from '@/lib/currency/types';

function MyForm() {
  const [currency, setCurrency] = useState(SupportedCurrency.USD);

  return (
    <CurrencySelector
      value={currency}
      onChange={setCurrency}
    />
  );
}
```

---

## Caching

Exchange rates are cached for **1 hour** to minimize API calls.

### Cache Management

```typescript
import { ratesCache } from '@/lib/currency';

// Get cache statistics
console.log(ratesCache.getStats());
// Output: { size: 3, keys: ['USD', 'EUR', 'GBP'] }

// Clear cache
ratesCache.clear();
```

### Production Recommendations

- Use **Redis** instead of in-memory cache
- Monitor API usage (1,500 requests/month free tier)
- Implement fallback rates if API is down
- Consider upgrading to paid tier for higher limits

---

## Rate Limits

### ExchangeRate-API Free Tier

- **Requests:** 1,500 per month
- **API Key:** Not required
- **Updates:** Daily
- **Response Time:** ~200ms average

### Optimization Tips

1. **Cache exchange rates** (1 hour default)
2. **Batch conversions** when possible
3. **Fallback to USD** if API fails
4. **Monitor usage** via dashboard

---

## Error Handling

### Example Error Response

```json
{
  "error": "Invalid currency code"
}
```

### Common Errors

| Status | Message | Solution |
|--------|---------|----------|
| 400 | Invalid currency code | Use valid currency code (USD, EUR, etc.) |
| 400 | Missing required parameters | Include all required query parameters |
| 503 | API unavailable | Check ExchangeRate-API status |

### Error Handling in Code

```typescript
import { convertAmount } from '@/lib/currency';

try {
  const converted = await convertAmount(100, 'USD', 'EUR');
} catch (error) {
  console.error('Conversion failed:', error.message);
  // Fallback logic here
}
```

---

## Testing

### Unit Tests

```bash
npm test -- __tests__/lib/currency/convert.test.ts
```

### API Endpoint Tests

```bash
# Get exchange rates
curl "http://localhost:3000/api/currency/rates?base=USD"

# Convert currency
curl "http://localhost:3000/api/currency/convert?amount=100&from=USD&to=EUR"

# Get user preference (requires auth)
curl -b "cookies.txt" "http://localhost:3000/api/profile/currency"

# Update user preference
curl -X PUT \
  -b "cookies.txt" \
  -H "Content-Type: application/json" \
  -d '{"currency":"EUR"}' \
  "http://localhost:3000/api/profile/currency"
```

---

## Database Migration

The currency preference is stored in the User model:

```prisma
model User {
  // ... other fields
  preferredCurrency Currency @default(USD) @map("preferred_currency")
  // ... relations
}

enum Currency {
  USD
  EUR
  GBP
  RSD
  JPY
  CAD
  AUD
  CHF
}
```

Run migration:
```bash
npx prisma migrate dev --name add_user_currency_preference
```

---

## Performance Considerations

1. **In-Memory Cache:** Reduces API calls from 10+ per page to 1 per hour
2. **Next.js Response Cache:** Additional 1-hour server-side caching
3. **Browser Cache:** Set to 1 hour via Cache-Control headers
4. **Batch Conversion:** Parallel promises with Promise.all()

---

## Future Enhancements

- [ ] Redis caching for production
- [ ] Cryptocurrency support (BTC, ETH)
- [ ] Historical rate tracking
- [ ] Custom exchange rate fallbacks
- [ ] Rate alerts for significant changes
- [ ] Multi-currency expense splitting
- [ ] Automatic currency conversion in groups

---

## Resources

- [ExchangeRate-API Documentation](https://www.exchangerate-api.com/docs)
- [ExchangeRate-API Status](https://status.exchangerate-api.com/)
- [Supported Currencies](https://www.exchangerate-api.com/docs/supported-currencies)
