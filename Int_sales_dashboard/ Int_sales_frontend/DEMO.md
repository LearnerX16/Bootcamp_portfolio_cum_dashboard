# Sprint 2 Fullstack Demo Runbook

## Modules

- Frontend dashboard: `D:\WORK\SkillCred\international_sales_dashboard`
- Backend API: `D:\WORK\SkillCred\international_sim_backend`
- API request examples: `D:\WORK\SkillCred\international_sim_backend\demo-requests.http`

## Servers

Start backend API:

```powershell
cd D:\WORK\SkillCred\international_sim_backend
npm start
```

Expected backend output:

```text
Server running on http://localhost:3000
```

Start frontend server:

```powershell
cd D:\WORK\SkillCred\international_sales_dashboard
python -m http.server 5500
```

Open the dashboard:

```text
http://localhost:5500/
```

## Demo Flow

1. Open `http://localhost:3000/` to show the backend health check.
2. Open `http://localhost:3000/api/sales?report_date=2026-06-29` to show GET returning JSON.
3. Use `demo-requests.http`, Hoppscotch, or Thunder Client to show missing date, invalid date, and date-not-found errors.
4. Send the POST request from `demo-requests.http` to add the 2026-07-01 Japan record.
5. Send GET for `2026-07-01` to prove the backend stored the new record in memory.
6. Open the frontend dashboard at `http://localhost:5500/`.
7. Open DevTools Network, change the report date dropdown, and show the `api/sales?report_date=...` request and JSON response.

## Teaching Notes

- The dashboard no longer reads sales card data from frontend mock data.
- `script.js` now builds an API URL and calls the backend using `fetch()`.
- The backend stores data in memory, so POST data disappears when the server restarts.
- CORS is enabled so the frontend server on port 5500 can call the backend server on port 3000.
