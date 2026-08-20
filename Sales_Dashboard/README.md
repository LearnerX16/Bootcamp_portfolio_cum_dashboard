# 📊 International Sales Dashboard

Complete sales dashboard connected to **Supabase PostgreSQL** database via RPC function.

---

## ✨ Features

### 🎯 KPI Cards
- **Today**: Current day sales and revenue
- **MTD (Month to Date)**: Current month cumulative
- **PMSD (Previous Month Same Day)**: Comparison baseline
- **PM (Previous Month)**: Full previous month metrics

### 📈 Data Visualizations
1. **Daily Sales Trend** - Bar chart showing daily performance
2. **Sales Representative Leaderboard** - Top performers with rankings
3. **Monthly Comparison** - Last 6 months trend

### 🎨 Design Features
- Modern gradient UI (purple to blue)
- Responsive design (mobile & desktop)
- Smooth animations & transitions
- Color-coded KPI cards
- Medal badges for top 3 performers
- Auto-refresh capability

---

## 🗃️ Database Structure

### RPC Function: `get_sale_dashboard(report_date date)`

**Returns 4 JSON objects:**

1. **kpi_cards**
```json
{
  "TODAY_SALES": 45,
  "TODAY_REVENUE": 125000,
  "mtd_sales": 320,
  "MTD_REVENUE": 2450000,
  "PMSD_SALES": 38,
  "PMSD_REVENUE": 98000,
  "PM_SALES": 650,
  "PM_REVENUE": 4200000
}
```

2. **daily_metrics** (array)
```json
[
  {
    "order_date": "2026-05-01",
    "no_of_sales": 42,
    "total_revenue": 135000
  }
]
```

3. **leaderboard_metrics** (array)
```json
[
  {
    "sales_representative": "John Doe",
    "today_sales": 12,
    "today_revenue": 45000,
    "mtd_sales": 85,
    "mtd_revenue": 320000
  }
]
```

4. **monthly_metrics** (array)
```json
[
  {
    "year": 2026,
    "month": 5,
    "no_of_sales": 650
  }
]
```

---

## 🚀 How to Run

### Option 1: Direct Browser Open
```bash
# Double-click index.html or open with browser
start index.html
```

### Option 2: Python HTTP Server
```bash
cd Sales_Dashboard
python -m http.server 8080
# Visit: http://localhost:8080
```

### Option 3: Node.js Server
```bash
npx http-server -p 8080
```

---

## 🔧 Configuration

### Update API Credentials

Edit `script.js` lines 4-5:

```javascript
const SUPABASE_URL = "https://your-project.supabase.co/rest/v1/rpc/get_sale_dashboard";
const SUPABASE_KEY = "your-supabase-anon-key";
```

### Change Default Date

Edit `script.js` line 29:

```javascript
reportDateInput.valueAsDate = new Date(); // Today
// OR
reportDateInput.value = "2026-05-18"; // Specific date
```

---

## 📊 Data Sources

### Base Tables
- **orders** - Order transactions
- **users** - User/sales rep data
- **products** - Product catalog

### SQL Function Logic
```sql
-- Filters data for report_date and previous month
-- Calculates:
-- - Daily aggregations (COUNT, SUM)
-- - Monthly rollups
-- - Leaderboard rankings
-- - Comparison metrics
```

---

## 🎨 Customization

### Change Color Scheme

Edit `style.css` gradient:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change to your colors */
```

### Modify KPI Card Colors

Edit `.kpi-card` border colors in `style.css`:

```css
.kpi-card.today {
  border-left-color: #10b981; /* Green */
}
```

---

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (4-column KPI grid)
- **Tablet**: 768px (2-column grid)
- **Mobile**: < 768px (1-column stacked)

---

## 🔍 Troubleshooting

### "No data returned from API"
- Check if `report_date` has data in database
- Verify SQL function permissions (`GRANT` statements)
- Check `anon` role has access

### "API returned status 401"
- Verify API key is correct
- Check Supabase project URL
- Ensure RPC function is accessible

### "No data available" in charts
- Verify data exists for selected date
- Check browser console for errors
- Inspect API response structure

---

## 📦 File Structure

```
Sales_Dashboard/
├── index.html       # Main HTML structure
├── style.css        # Beautiful gradient styling
├── script.js        # Supabase integration logic
└── README.md        # This file
```

---

## 🚀 Performance Tips

1. **Indexing**: Add indexes on `order_date_time` column
2. **Caching**: Consider caching frequently accessed dates
3. **Pagination**: For large leaderboards, add pagination
4. **Date Range**: Limit monthly chart to last 6-12 months

---

## 🔐 Security Notes

- API key is **client-side visible** (anon key)
- Use **Row Level Security (RLS)** in Supabase
- Never expose service_role key in frontend
- Consider adding authentication layer

---

Made with ❤️ using Vanilla JS + Supabase + PostgreSQL
