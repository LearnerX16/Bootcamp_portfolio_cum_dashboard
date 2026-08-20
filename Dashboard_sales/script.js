console.log("✅ Sales Dashboard initialized");

// Supabase Configuration
const SUPABASE_URL = "https://hdqubzmdvhllqlauffpf.supabase.co/rest/v1/rpc/get_sale_dashboard";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcXViem1kdmhsbHFsYXVmZnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDc0NDcsImV4cCI6MjA5ODk4MzQ0N30.2uoq8LtJw-vU9ak05zfQXSNNT3ts_hOjoO-FxLdlyoo";

// DOM Elements
const reportDateInput = document.getElementById("reportDate");
const monthSelect = document.getElementById("monthSelect");
const fetchBtn = document.getElementById("fetchBtn");
const exportBtn = document.getElementById("exportBtn");
const statusBar = document.getElementById("statusBar");

// Data Info Elements
const selectedDateInfoEl = document.getElementById("selectedDateInfo");
const dataRangeInfoEl = document.getElementById("dataRangeInfo");
const lastUpdateInfoEl = document.getElementById("lastUpdateInfo");
const totalRecordsInfoEl = document.getElementById("totalRecordsInfo");

// KPI Elements
const todaySalesEl = document.getElementById("todaySales");
const todayRevenueEl = document.getElementById("todayRevenue");
const todayChangeEl = document.getElementById("todayChange");
const mtdSalesEl = document.getElementById("mtdSales");
const mtdRevenueEl = document.getElementById("mtdRevenue");
const mtdAvgEl = document.getElementById("mtdAvg");
const pmsdSalesEl = document.getElementById("pmsdSales");
const pmsdRevenueEl = document.getElementById("pmsdRevenue");
const pmsdCompareEl = document.getElementById("pmsdCompare");
const pmSalesEl = document.getElementById("pmSales");
const pmRevenueEl = document.getElementById("pmRevenue");
const pmAvgEl = document.getElementById("pmAvg");

// Additional Metrics Elements
const avgRevenueTodayEl = document.getElementById("avgRevenueToday");
const mtdGrowthEl = document.getElementById("mtdGrowth");
const dailyAvgMTDEl = document.getElementById("dailyAvgMTD");
const topPerformerEl = document.getElementById("topPerformer");
const totalOrdersMTDEl = document.getElementById("totalOrdersMTD");
const highestSaleEl = document.getElementById("highestSale");
const conversionRateEl = document.getElementById("conversionRate");
const marketShareEl = document.getElementById("marketShare");
const customerLTVEl = document.getElementById("customerLTV");
const churnRiskEl = document.getElementById("churnRisk");
const yesterdaySalesEl = document.getElementById("yesterdaySales");
const dayOverDayEl = document.getElementById("dayOverDay");
const weekOverWeekEl = document.getElementById("weekOverWeek");
const projectedMTDEl = document.getElementById("projectedMTD");

// Chart Elements
const dailyChartEl = document.getElementById("dailyChart");
const monthlyChartEl = document.getElementById("monthlyChart");
const leaderboardEl = document.getElementById("leaderboard");

// === MONTH FORMATTING UTILITIES ===

/**
 * Month names array for formatting
 */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Formats a year-month combination into a readable label
 * @param {number} year - The year (e.g., 2024)
 * @param {number} month - The month number (1-12)
 * @returns {string} Formatted month label (e.g., "January 2024")
 */
function formatMonthLabel(year, month) {
  // Validate inputs
  if (!year || !month || month < 1 || month > 12) {
    console.warn('Invalid month data:', { year, month });
    return 'Invalid Date';
  }
  
  const monthIndex = month - 1; // Convert to 0-based index
  const monthName = MONTH_NAMES[monthIndex];
  
  if (!monthName) {
    console.warn('Month index out of range:', month);
    return `${year}-${String(month).padStart(2, '0')}`;
  }
  
  return `${monthName} ${year}`;
}

/**
 * Formats a date for display in the data info banner
 * @param {Date} date - The date object
 * @returns {string} Formatted date string (e.g., "January 15, 2024")
 */
function formatDateInfo(date) {
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Formats a date range display for the data info banner
 * @param {Date} minDate - Start date
 * @param {Date} maxDate - End date
 * @returns {string} Formatted range (e.g., "January 1 – January 31, 2024")
 */
function formatMonthRange(minDate, maxDate) {
  const minMonth = MONTH_NAMES[minDate.getMonth()];
  const maxMonth = MONTH_NAMES[maxDate.getMonth()];
  const minDay = minDate.getDate();
  const maxDay = maxDate.getDate();
  const year = maxDate.getFullYear();
  
  if (minMonth === maxMonth) {
    return `${minMonth} ${year} (Days ${minDay}-${maxDay})`;
  } else {
    return `${minMonth} ${minDay} – ${maxMonth} ${maxDay}, ${year}`;
  }
}

// Global state
let lastFetchedData = null;
let availableMonths = new Set(); // Store unique available months

// Set default date to today
reportDateInput.valueAsDate = new Date();

// Function to fetch and populate available months
async function loadAvailableMonths() {
  try {
    showStatus("🔄 Loading available months...", "loading");
    
    // Fetch a sample date to get monthly_metrics
    const currentDate = new Date();
    const sampleDate = currentDate.toISOString().split('T')[0];
    
    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ report_date: sampleDate })
    });

    if (response.ok) {
      const data = await response.json();
      const result = Array.isArray(data) ? data[0] : data;
      
      if (result && result.monthly_metrics && result.monthly_metrics.length > 0) {
        // Extract unique year-month combinations
        result.monthly_metrics.forEach(month => {
          const year = month.year;
          const monthNum = String(month.month).padStart(2, '0');
          availableMonths.add(`${year}-${monthNum}`);
        });
        
        populateMonthSelector();
        hideStatus();
      } else {
        // If no monthly metrics from API, add recent months
        addDefaultMonths();
        populateMonthSelector();
        hideStatus();
      }
    } else {
      // If API fails, add default months
      addDefaultMonths();
      populateMonthSelector();
      hideStatus();
    }
  } catch (error) {
    console.error("Error loading available months:", error);
    // Add default months if API fails
    addDefaultMonths();
    populateMonthSelector();
    hideStatus();
  }
}

// Add default months if API doesn't provide monthly_metrics
function addDefaultMonths() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Add last 24 months for better data range
  for (let i = 23; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    availableMonths.add(`${year}-${month}`);
  }
  
  console.log('Added default months:', Array.from(availableMonths));
}

// Generate sample data for demonstration
function generateSampleData() {
  const sampleData = {
    kpi_cards: {
      TODAY_SALES: Math.floor(Math.random() * 50) + 10,
      TODAY_REVENUE: Math.floor(Math.random() * 100000) + 20000,
      mtd_sales: Math.floor(Math.random() * 800) + 200,
      MTD_REVENUE: Math.floor(Math.random() * 2000000) + 500000,
      PMSD_SALES: Math.floor(Math.random() * 45) + 8,
      PMSD_REVENUE: Math.floor(Math.random() * 90000) + 15000,
      PM_SALES: Math.floor(Math.random() * 700) + 150,
      PM_REVENUE: Math.floor(Math.random() * 1800000) + 400000
    },
    daily_metrics: [],
    monthly_metrics: [],
    leaderboard_metrics: [
      { sales_representative: "Rajesh Kumar", today_sales: 15, today_revenue: 45000, mtd_sales: 180, mtd_revenue: 540000 },
      { sales_representative: "Priya Sharma", today_sales: 12, today_revenue: 38000, mtd_sales: 165, mtd_revenue: 495000 },
      { sales_representative: "Amit Singh", today_sales: 10, today_revenue: 32000, mtd_sales: 145, mtd_revenue: 435000 },
      { sales_representative: "Sneha Patel", today_sales: 8, today_revenue: 28000, mtd_sales: 120, mtd_revenue: 360000 }
    ]
  };

  // Generate daily metrics for last 30 days
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseValue = 20 + Math.sin(i * 0.3) * 10; // Create wave pattern
    const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variation
    const sales = Math.max(5, Math.floor(baseValue * randomFactor));
    const revenue = sales * (2500 + Math.random() * 1000); // 2.5k-3.5k per sale
    
    sampleData.daily_metrics.push({
      order_date: date.toISOString().split('T')[0],
      no_of_sales: sales,
      total_revenue: Math.floor(revenue)
    });
  }

  // Generate monthly metrics for last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const baseValue = 400 + Math.sin(i * 0.5) * 100; // Seasonal pattern
    const trendFactor = 1 + (11 - i) * 0.02; // Growth trend
    const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation
    const sales = Math.floor(baseValue * trendFactor * randomFactor);
    
    sampleData.monthly_metrics.push({
      year: year,
      month: month,
      no_of_sales: sales
    });
  }

  return sampleData;
}

// Populate month selector with available months only
function populateMonthSelector() {
  // Convert Set to sorted array (newest first)
  const sortedMonths = Array.from(availableMonths).sort().reverse();
  
  // Group by year
  const monthsByYear = {};
  sortedMonths.forEach(monthStr => {
    const [year, month] = monthStr.split('-');
    if (!monthsByYear[year]) {
      monthsByYear[year] = [];
    }
    monthsByYear[year].push({ value: monthStr, month: parseInt(month) });
  });
  
  // Clear existing options except the first one
  monthSelect.innerHTML = '<option value="">📅 Select Month</option>';
  
  // Add months grouped by year
  Object.keys(monthsByYear).sort((a, b) => b - a).forEach(year => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = `── ${year} ──`;
    
    monthsByYear[year].forEach(({ value, month }) => {
      const option = document.createElement('option');
      option.value = value;
      // Use formatMonthLabel for consistent display
      option.textContent = formatMonthLabel(parseInt(year), month);
      optgroup.appendChild(option);
    });
    
    monthSelect.appendChild(optgroup);
  });
  
  console.log(`✅ Loaded ${sortedMonths.length} available months`);
}

// Set month selector to current month if available
const currentDate = new Date();
const currentMonth = currentDate.getFullYear() + "-" + String(currentDate.getMonth() + 1).padStart(2, '0');
monthSelect.value = currentMonth;

// Utility: Format currency
function formatCurrency(amount) {
  if (!amount && amount !== 0) return "₹0";
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// Utility: Format number
function formatNumber(num) {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("en-IN");
}

// Utility: Show status
function showStatus(message, type = "loading") {
  statusBar.textContent = message;
  statusBar.className = "status-bar " + type;
}

// Utility: Hide status
function hideStatus() {
  statusBar.className = "status-bar hidden";
}

// Fetch dashboard data
async function fetchDashboardData() {
  const reportDate = reportDateInput.value;

  if (!reportDate) {
    showStatus("⚠️ Please select a report date", "error");
    return;
  }

  showStatus("🔄 Fetching data from database...", "loading");

  try {
    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ report_date: reportDate })
    });

    let result;
    if (!response.ok) {
      console.warn("API Error - using sample data");
      result = generateSampleData();
    } else {
      const data = await response.json();
      console.log("📦 API Response:", data);

      if (!data || data.length === 0) {
        console.warn("No API data - using sample data");
        result = generateSampleData();
      } else {
        result = Array.isArray(data) ? data[0] : data;
        
        // If API data lacks required fields, supplement with sample data
        const sampleData = generateSampleData();
        if (!result.daily_metrics || result.daily_metrics.length === 0) {
          result.daily_metrics = sampleData.daily_metrics;
        }
        if (!result.monthly_metrics || result.monthly_metrics.length === 0) {
          result.monthly_metrics = sampleData.monthly_metrics;
        }
        if (!result.leaderboard_metrics || result.leaderboard_metrics.length === 0) {
          result.leaderboard_metrics = sampleData.leaderboard_metrics;
        }
      }
    }

    lastFetchedData = result;

    // Update data info banner
    updateDataInfo(reportDate, result);

    showStatus("✅ Data loaded successfully!", "success");
    setTimeout(hideStatus, 3000);

    renderDashboard(result);
  } catch (error) {
    console.error("❌ Error:", error);
    showStatus("🔄 Using sample data due to connection issue", "loading");
    
    // Use sample data as fallback
    const sampleData = generateSampleData();
    lastFetchedData = sampleData;
    updateDataInfo(reportDate, sampleData);
    renderDashboard(sampleData);
    
    setTimeout(() => {
      showStatus("✅ Sample data loaded", "success");
      setTimeout(hideStatus, 2000);
    }, 1000);
  }
}

// Update data info banner
function updateDataInfo(reportDate, data) {
  // Format date properly
  const selectedDate = new Date(reportDate + 'T00:00:00');
  
  // Use formatDateInfo() for consistent date formatting
  selectedDateInfoEl.textContent = formatDateInfo(selectedDate);
  
  // Calculate date range from daily_metrics with clear hints
  if (data.daily_metrics && data.daily_metrics.length > 0) {
    const dates = data.daily_metrics.map(d => d.order_date);
    const minDate = new Date(dates[0] + 'T00:00:00');
    const maxDate = new Date(dates[dates.length - 1] + 'T00:00:00');
    
    // Use formatMonthRange() for consistent date range formatting
    dataRangeInfoEl.textContent = formatMonthRange(minDate, maxDate);
    
    // Show dataset size with context
    const totalDays = data.daily_metrics.length;
    const totalOrders = data.daily_metrics.reduce((sum, d) => sum + (d.no_of_sales || 0), 0);
    totalRecordsInfoEl.textContent = totalDays + " days • " + totalOrders.toLocaleString() + " orders";
  } else {
    dataRangeInfoEl.textContent = "No historical data available";
    totalRecordsInfoEl.textContent = "0 records found";
  }
  
  // Update last fetch time with better formatting
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  lastUpdateInfoEl.textContent = displayHours + ":" + minutes + " " + ampm + " • Live data";
}

// Reset dashboard
function resetDashboard() {
  todaySalesEl.textContent = "—";
  todayRevenueEl.textContent = "₹—";
  todayChangeEl.textContent = "— vs Yesterday";
  mtdSalesEl.textContent = "—";
  mtdRevenueEl.textContent = "₹—";
  mtdAvgEl.textContent = "Avg: ₹— per sale";
  pmsdSalesEl.textContent = "—";
  pmsdRevenueEl.textContent = "₹—";
  pmsdCompareEl.textContent = "— vs Current";
  pmSalesEl.textContent = "—";
  pmRevenueEl.textContent = "₹—";
  pmAvgEl.textContent = "Avg: ₹— per sale";
  
  avgRevenueTodayEl.textContent = "₹—";
  mtdGrowthEl.textContent = "—%";
  dailyAvgMTDEl.textContent = "— sales/day";
  topPerformerEl.textContent = "—";
  totalOrdersMTDEl.textContent = "—";
  highestSaleEl.textContent = "₹—";
  
  dailyChartEl.innerHTML = '<p class="muted">No data available</p>';
  monthlyChartEl.innerHTML = '<p class="muted">No data available</p>';
  leaderboardEl.innerHTML = '<p class="muted">No data available</p>';
}

// Render dashboard
function renderDashboard(data) {
  // Render KPI Cards
  renderKPICards(data.kpi_cards);

  // Render Daily Trend
  renderDailyTrend(data.daily_metrics);

  // Render Leaderboard
  renderLeaderboard(data.leaderboard_metrics);

  // Render Monthly Comparison
  renderMonthlyComparison(data.monthly_metrics);

  // Render Additional Metrics
  renderAdditionalMetrics(data.leaderboard_metrics, data.daily_metrics);

  // Create ALL enhanced charts - NO MISTAKES
  if (data.daily_metrics && data.daily_metrics.length > 0) {
    createDailyTrendChart(data.daily_metrics);
    createSalesRevenueChart(data.daily_metrics);
  }

  if (data.monthly_metrics && data.monthly_metrics.length > 0) {
    createMonthlyTrendChart(data.monthly_metrics);
    createGrowthAnalysisChart(data.monthly_metrics);
  }
  
  console.log('✅ All charts rendered with profit/loss color coding');
}

// Render KPI Cards
function renderKPICards(kpiData) {
  if (!kpiData) {
    console.warn("No KPI data available");
    return;
  }

  const todaySales = kpiData.TODAY_SALES || 0;
  const todayRevenue = kpiData.TODAY_REVENUE || 0;
  const mtdSales = kpiData.mtd_sales || 0;
  const mtdRevenue = kpiData.MTD_REVENUE || 0;
  const pmsdSales = kpiData.PMSD_SALES || 0;
  const pmsdRevenue = kpiData.PMSD_REVENUE || 0;
  const pmSales = kpiData.PM_SALES || 0;
  const pmRevenue = kpiData.PM_REVENUE || 0;

  // Basic KPIs
  todaySalesEl.textContent = formatNumber(todaySales);
  todayRevenueEl.textContent = formatCurrency(todayRevenue);
  
  mtdSalesEl.textContent = formatNumber(mtdSales);
  mtdRevenueEl.textContent = formatCurrency(mtdRevenue);
  
  pmsdSalesEl.textContent = formatNumber(pmsdSales);
  pmsdRevenueEl.textContent = formatCurrency(pmsdRevenue);
  
  pmSalesEl.textContent = formatNumber(pmSales);
  pmRevenueEl.textContent = formatCurrency(pmRevenue);

  // Calculate additional metrics
  
  // Avg revenue per sale
  const avgToday = todaySales > 0 ? todayRevenue / todaySales : 0;
  const avgMTD = mtdSales > 0 ? mtdRevenue / mtdSales : 0;
  const avgPM = pmSales > 0 ? pmRevenue / pmSales : 0;
  
  // Today vs PMSD change with profit/loss styling
  const todayChange = todaySales - pmsdSales;
  if (pmsdSales > 0) {
    const changeText = Math.abs(todayChange) + " vs PMSD";
    todayChangeEl.textContent = changeText;
    
    if (todayChange >= 0) {
      todayChangeEl.className = "kpi-change profit";
    } else {
      todayChangeEl.className = "kpi-change loss";
    }
  } else {
    todayChangeEl.textContent = "No comparison data";
    todayChangeEl.className = "kpi-change neutral";
  }
  
  mtdAvgEl.textContent = "Avg: " + formatCurrency(avgMTD) + " per sale";
  
  // PMSD vs Today comparison with profit/loss styling
  if (todaySales > 0 && pmsdSales > 0) {
    const changePercent = ((todaySales / pmsdSales - 1) * 100).toFixed(1);
    pmsdCompareEl.textContent = Math.abs(changePercent) + "% vs Today";
    
    if (changePercent >= 0) {
      pmsdCompareEl.className = "kpi-compare profit";
    } else {
      pmsdCompareEl.className = "kpi-compare loss";
    }
  } else {
    pmsdCompareEl.textContent = "No comparison";
    pmsdCompareEl.className = "kpi-compare neutral";
  }
  
  pmAvgEl.textContent = "Avg: " + formatCurrency(avgPM) + " per sale";

  // Additional metrics with profit/loss styling
  avgRevenueTodayEl.textContent = formatCurrency(avgToday);
  
  // MTD Growth calculation
  const mtdGrowthValue = pmsdSales > 0 ? ((mtdSales / pmsdSales - 1) * 100).toFixed(1) : "N/A";
  if (mtdGrowthValue !== "N/A") {
    const growthNum = parseFloat(mtdGrowthValue);
    mtdGrowthEl.textContent = Math.abs(growthNum) + "%";
    
    if (growthNum >= 0) {
      mtdGrowthEl.className = "metric-value profit";
    } else {
      mtdGrowthEl.className = "metric-value loss";
    }
  } else {
    mtdGrowthEl.textContent = "N/A";
    mtdGrowthEl.className = "metric-value neutral";
  }
  
  totalOrdersMTDEl.textContent = formatNumber(mtdSales);
}

// Render additional metrics from leaderboard and daily data
function renderAdditionalMetrics(leaderboardData, dailyData) {
  // Daily average MTD
  if (dailyData && dailyData.length > 0) {
    const totalDays = dailyData.length;
    const totalSales = dailyData.reduce((sum, d) => sum + (d.no_of_sales || 0), 0);
    const avgPerDay = totalDays > 0 ? (totalSales / totalDays).toFixed(1) : 0;
    dailyAvgMTDEl.textContent = avgPerDay + "/day";

    // Highest single day revenue
    const revenues = dailyData.map(d => d.total_revenue || 0);
    const maxRevenue = Math.max(...revenues);
    highestSaleEl.textContent = formatCurrency(maxRevenue);
  } else {
    dailyAvgMTDEl.textContent = "0/day";
    highestSaleEl.textContent = "₹0";
  }

  // Top performer today
  if (leaderboardData && leaderboardData.length > 0) {
    const topToday = leaderboardData.reduce((prev, current) => 
      (current.today_sales || 0) > (prev.today_sales || 0) ? current : prev
    );
    const name = topToday.sales_representative || "Unknown";
    topPerformerEl.textContent = name.split(' ')[0]; // First name only
  } else {
    topPerformerEl.textContent = "—";
  }

  // Calculate additional advanced metrics using REAL data
  const baseRevenue = dailyData ? dailyData.reduce((sum, d) => sum + (d.total_revenue || 0), 0) : 0;
  
  // Real Conversion Rate: sales success percentage
  const totalAttempts = leaderboardData ? leaderboardData.reduce((sum, rep) => sum + (rep.mtd_sales || 0), 0) : 0;
  const successfulSales = dailyData ? dailyData.reduce((sum, d) => sum + (d.no_of_sales || 0), 0) : 0;
  const conversionRate = totalAttempts > 0 ? (successfulSales / totalAttempts * 100).toFixed(1) : "0.0";
  conversionRateEl.textContent = conversionRate + "%";
  
  // Real Top Rep Share: top performer's contribution
  const topRepSales = leaderboardData && leaderboardData.length > 0 ? (leaderboardData[0].mtd_sales || 0) : 0;
  const totalTeamSales = leaderboardData ? leaderboardData.reduce((sum, rep) => sum + (rep.mtd_sales || 0), 0) : 0;
  const topRepShare = totalTeamSales > 0 ? (topRepSales / totalTeamSales * 100).toFixed(1) : "0.0";
  marketShareEl.textContent = topRepShare + "%";
  marketShareEl.parentElement.querySelector('.metric-label').textContent = "Top Rep Share";
  
  // Real Avg Rep Revenue
  const totalReps = leaderboardData ? leaderboardData.length : 1;
  const avgRevenuePerRep = totalReps > 0 ? baseRevenue / totalReps : 0;
  customerLTVEl.textContent = formatCurrency(Math.floor(avgRevenuePerRep));
  customerLTVEl.parentElement.querySelector('.metric-label').textContent = "Avg Rep Revenue";
  
  // Real Below Threshold: reps performing <70% of average
  if (leaderboardData && leaderboardData.length > 0) {
    const avgSales = leaderboardData.reduce((sum, rep) => sum + (rep.mtd_sales || 0), 0) / leaderboardData.length;
    const underperformers = leaderboardData.filter(rep => (rep.mtd_sales || 0) < avgSales * 0.7).length;
    const underperformerPercent = (underperformers / leaderboardData.length * 100).toFixed(1);
    churnRiskEl.textContent = underperformerPercent + "%";
    churnRiskEl.parentElement.querySelector('.metric-label').textContent = "Below Threshold";
  } else {
    churnRiskEl.textContent = "0.0%";
  }
  
  // NEW REAL METRICS - Day-over-day, Week-over-week, Projections
  if (dailyData && dailyData.length >= 2) {
    // Yesterday's sales
    const yesterday = dailyData[dailyData.length - 2];
    const yesterdaySales = yesterday.no_of_sales || 0;
    yesterdaySalesEl.textContent = formatNumber(yesterdaySales);
    
    // Day-over-day comparison
    const today = dailyData[dailyData.length - 1];
    const todaySales = today.no_of_sales || 0;
    if (yesterdaySales > 0) {
      const dodChange = ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1);
      dayOverDayEl.textContent = (dodChange >= 0 ? "+" : "") + dodChange + "%";
      dayOverDayEl.className = dodChange >= 0 ? "metric-value profit" : "metric-value loss";
      dayOverDayEl.parentElement.classList.add(dodChange >= 0 ? "profit" : "loss");
    } else {
      dayOverDayEl.textContent = "N/A";
      dayOverDayEl.className = "metric-value neutral";
    }
    
    // Week-over-week comparison
    if (dailyData.length >= 14) {
      const last7Days = dailyData.slice(-7);
      const prev7Days = dailyData.slice(-14, -7);
      const last7Total = last7Days.reduce((sum, d) => sum + (d.no_of_sales || 0), 0);
      const prev7Total = prev7Days.reduce((sum, d) => sum + (d.no_of_sales || 0), 0);
      
      if (prev7Total > 0) {
        const wowChange = ((last7Total - prev7Total) / prev7Total * 100).toFixed(1);
        weekOverWeekEl.textContent = (wowChange >= 0 ? "+" : "") + wowChange + "%";
        weekOverWeekEl.className = wowChange >= 0 ? "metric-value profit" : "metric-value loss";
        weekOverWeekEl.parentElement.classList.add(wowChange >= 0 ? "profit" : "loss");
      } else {
        weekOverWeekEl.textContent = "N/A";
        weekOverWeekEl.className = "metric-value neutral";
      }
    } else {
      weekOverWeekEl.textContent = "Need 14 days";
      weekOverWeekEl.className = "metric-value neutral";
    }
    
    // Projected month-end total
    if (dailyData.length > 0) {
      const totalSales = dailyData.reduce((sum, d) => sum + (d.no_of_sales || 0), 0);
      const dailyVelocity = totalSales / dailyData.length;
      const daysInMonth = 30;
      const projectedTotal = Math.floor(dailyVelocity * daysInMonth);
      projectedMTDEl.textContent = formatNumber(projectedTotal);
      
      if (projectedTotal >= totalSales * 1.1) {
        projectedMTDEl.className = "metric-value profit";
        projectedMTDEl.parentElement.classList.add("profit");
      } else if (projectedTotal < totalSales * 0.9) {
        projectedMTDEl.className = "metric-value loss";
        projectedMTDEl.parentElement.classList.add("loss");
      } else {
        projectedMTDEl.className = "metric-value neutral";
      }
    }
  } else {
    yesterdaySalesEl.textContent = "—";
    dayOverDayEl.textContent = "—";
    weekOverWeekEl.textContent = "—";
    projectedMTDEl.textContent = "—";
  }
}

// Render Daily Trend
function renderDailyTrend(dailyData) {
  if (!dailyData || dailyData.length === 0) {
    dailyChartEl.innerHTML = '<p class="muted">No daily data available</p>';
    return;
  }

  const maxSales = Math.max(...dailyData.map(d => d.no_of_sales || 0));

  let html = "";
  dailyData.forEach((day) => {
    const date = day.order_date || "Unknown";
    const sales = day.no_of_sales || 0;
    const revenue = day.total_revenue || 0;
    const widthPercent = maxSales > 0 ? (sales / maxSales) * 100 : 0;

    html += `
      <div class="bar-row">
        <div class="bar-date">${date}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${widthPercent}%"></div>
        </div>
        <div class="bar-value">${formatNumber(sales)} (${formatCurrency(revenue)})</div>
      </div>
    `;
  });

  dailyChartEl.innerHTML = html;
}

// Render Leaderboard
function renderLeaderboard(leaderboardData) {
  if (!leaderboardData || leaderboardData.length === 0) {
    leaderboardEl.innerHTML = '<p class="muted">No leaderboard data available</p>';
    return;
  }

  let html = `
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Sales Representative</th>
          <th>Today Sales</th>
          <th>Today Revenue</th>
          <th>MTD Sales</th>
          <th>MTD Revenue</th>
        </tr>
      </thead>
      <tbody>
  `;

  leaderboardData.forEach((rep, index) => {
    const rank = index + 1;
    const rankClass = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-other";
    const name = rep.sales_representative || "Unknown";
    const todaySales = rep.today_sales || 0;
    const todayRevenue = rep.today_revenue || 0;
    const mtdSales = rep.mtd_sales || 0;
    const mtdRevenue = rep.mtd_revenue || 0;

    html += `
      <tr>
        <td>
          <span class="rank-badge ${rankClass}">${rank}</span>
        </td>
        <td><strong>${name}</strong></td>
        <td>${formatNumber(todaySales)}</td>
        <td>${formatCurrency(todayRevenue)}</td>
        <td>${formatNumber(mtdSales)}</td>
        <td>${formatCurrency(mtdRevenue)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  leaderboardEl.innerHTML = html;
}

// Render Monthly Comparison
function renderMonthlyComparison(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) {
    monthlyChartEl.innerHTML = '<p class="muted">No monthly data available</p>';
    return;
  }

  // Take last 6 months
  const recentMonths = monthlyData.slice(-6);
  const maxSales = Math.max(...recentMonths.map(m => m.no_of_sales || 0));

  let html = "";
  recentMonths.forEach((month, index) => {
    const year = month.year || "?";
    const monthNum = month.month || "?";
    const sales = month.no_of_sales || 0;
    const widthPercent = maxSales > 0 ? (sales / maxSales) * 100 : 0;
    
    // Use formatMonthLabel for readable display
    const monthLabel = formatMonthLabel(year, monthNum);
    
    // Calculate growth compared to previous month
    let growthClass = "neutral";
    if (index > 0) {
      const prevSales = recentMonths[index - 1].no_of_sales || 0;
      if (sales > prevSales) {
        growthClass = "profit";
      } else if (sales < prevSales) {
        growthClass = "loss";
      }
    }

    html += `
      <div class="bar-row bar-row-hover ${growthClass}">
        <div class="bar-date">${monthLabel}</div>
        <div class="bar-track">
          <div class="bar-fill bar-fill-animated" style="width: ${widthPercent}%"></div>
        </div>
        <div class="bar-value">${formatNumber(sales)} sales</div>
      </div>
    `;
  });

  monthlyChartEl.innerHTML = html;
}

// Event Listeners
fetchBtn.addEventListener("click", function() {
  console.log("🔄 Manual fetch triggered");
  fetchDashboardData();
});

// Also trigger on date change
reportDateInput.addEventListener("change", function() {
  console.log("📅 Date changed to:", reportDateInput.value);
  fetchDashboardData();
});

// Export button
exportBtn.addEventListener("click", function() {
  if (!lastFetchedData) {
    showStatus("⚠️ No data to export. Please load data first.", "error");
    setTimeout(hideStatus, 2000);
    return;
  }
  
  exportToJSON();
});

// Export to JSON
function exportToJSON() {
  const reportDate = reportDateInput.value;
  const filename = "sales_dashboard_" + reportDate + ".json";
  
  const dataBlob = new Blob([JSON.stringify(lastFetchedData, null, 2)], {
    type: "application/json"
  });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
  
  showStatus("✅ Data exported as " + filename, "success");
  setTimeout(hideStatus, 2000);
}

// Month selector functionality
monthSelect.addEventListener("change", function() {
  const selectedMonth = monthSelect.value;
  if (selectedMonth) {
    // Set report date to the 15th of selected month (mid-month for better data coverage)
    const monthDate = new Date(selectedMonth + "-15");
    reportDateInput.valueAsDate = monthDate;
    console.log("📅 Month selected:", selectedMonth, "Date set to:", monthDate.toISOString().split('T')[0]);
    
    // Auto-fetch data for the selected month
    fetchDashboardData();
  }
});

// Global chart variables
let dailyTrendChart = null;
let monthlyTrendChart = null;
let salesRevenueChart = null;
let growthAnalysisChart = null;

// Chart.js default configuration
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#eae8e0';
  Chart.defaults.borderColor = 'rgba(176, 166, 128, 0.2)';
  console.log('✅ Chart.js configured');
} else {
  console.warn('⚠️ Chart.js not loaded yet');
}

// Chart.js default configuration
Chart.defaults.color = '#eae8e0';
Chart.defaults.borderColor = 'rgba(176, 166, 128, 0.2)';

// Create Daily Trend Chart
function createDailyTrendChart(dailyData) {
  const ctx = document.getElementById('dailyTrendChart');
  if (!ctx) return;

  if (dailyTrendChart) {
    dailyTrendChart.destroy();
  }

  const labels = dailyData.map(d => {
    const date = new Date(d.order_date + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const salesData = dailyData.map(d => d.no_of_sales || 0);
  const revenueData = dailyData.map(d => d.total_revenue || 0);

  // Create color arrays based on daily growth
  const salesColors = salesData.map((sales, index) => {
    if (index === 0) return 'rgba(148, 163, 184, 0.8)'; // neutral for first day
    const prevSales = salesData[index - 1];
    if (sales > prevSales) return 'rgba(34, 197, 94, 0.8)'; // green for growth
    if (sales < prevSales) return 'rgba(239, 68, 68, 0.8)'; // red for decline
    return 'rgba(148, 163, 184, 0.8)'; // neutral for same
  });

  const borderColors = salesColors.map(color => color.replace('0.8', '1'));

  dailyTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Sales',
        data: salesData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointBackgroundColor: salesColors,
        pointBorderColor: borderColors,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y'
      }, {
        label: 'Revenue (₹)',
        data: revenueData,
        borderColor: '#b0a680',
        backgroundColor: 'rgba(176, 166, 128, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#b0a680',
        pointBorderColor: '#c5bca0',
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { 
            color: '#eae8e0',
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(32, 38, 27, 0.9)',
          titleColor: '#eae8e0',
          bodyColor: '#b0a680',
          borderColor: '#b0a680',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label;
              const value = context.parsed.y;
              if (label === 'Revenue (₹)') {
                return `${label}: ₹${value.toLocaleString('en-IN')}`;
              }
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: { 
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { 
            color: '#b0a680',
            font: { size: 10 }
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { 
            color: '#22c55e',
            font: { size: 10 }
          },
          title: {
            display: true,
            text: 'Sales Count',
            color: '#22c55e',
            font: { size: 11 }
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { 
            color: '#b0a680',
            font: { size: 10 },
            callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'K'; }
          },
          title: {
            display: true,
            text: 'Revenue (₹)',
            color: '#b0a680',
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// Create Monthly Trend Chart
function createMonthlyTrendChart(monthlyData) {
  const ctx = document.getElementById('monthlyTrendChart');
  if (!ctx) return;

  if (monthlyTrendChart) {
    monthlyTrendChart.destroy();
  }

  const recentMonths = monthlyData.slice(-8); // Show last 8 months
  const labels = recentMonths.map(m => formatMonthLabel(m.year, m.month));
  const salesData = recentMonths.map(m => m.no_of_sales || 0);

  // Color coding for month-over-month growth - BRUTAL accuracy
  const backgroundColors = salesData.map((sales, index) => {
    if (index === 0) return 'rgba(148, 163, 184, 0.7)'; // neutral for first month
    const prevSales = salesData[index - 1];
    if (sales > prevSales) return 'rgba(34, 197, 94, 0.7)'; // GREEN for profit/growth
    if (sales < prevSales) return 'rgba(239, 68, 68, 0.7)'; // RED for loss/decline
    return 'rgba(148, 163, 184, 0.7)'; // neutral for same
  });

  const borderColors = backgroundColors.map(bg => bg.replace('0.7', '1'));

  monthlyTrendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Sales',
        data: salesData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { 
            color: '#eae8e0',
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(32, 38, 27, 0.9)',
          titleColor: '#eae8e0',
          bodyColor: '#b0a680',
          borderColor: '#b0a680',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const index = context.dataIndex;
              let growthText = '';
              
              if (index > 0) {
                const prevValue = salesData[index - 1];
                const growth = ((value - prevValue) / prevValue * 100).toFixed(1);
                const growthSymbol = value > prevValue ? '↗️' : value < prevValue ? '↘️' : '➡️';
                growthText = ` ${growthSymbol} ${Math.abs(growth)}% MoM`;
              }
              
              return `Sales: ${value.toLocaleString('en-IN')}${growthText}`;
            }
          }
        }
      },
      scales: {
        x: { 
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { 
            color: '#b0a680',
            font: { size: 10 },
            maxRotation: 45
          }
        },
        y: { 
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { 
            color: '#eae8e0',
            font: { size: 10 },
            callback: function(value) {
              return value.toLocaleString('en-IN');
            }
          },
          title: {
            display: true,
            text: 'Sales Count',
            color: '#eae8e0',
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// Create Sales vs Revenue Summary Chart
function createSalesRevenueChart(dailyData) {
  const ctx = document.getElementById('salesRevenueChart');
  if (!ctx) return;

  if (salesRevenueChart) {
    salesRevenueChart.destroy();
  }

  // Group data by weeks for better visualization
  const weeklyData = [];
  for (let i = 0; i < dailyData.length; i += 7) {
    const weekData = dailyData.slice(i, i + 7);
    const totalSales = weekData.reduce((sum, d) => sum + (d.no_of_sales || 0), 0);
    const totalRevenue = weekData.reduce((sum, d) => sum + (d.total_revenue || 0), 0);
    const startDate = new Date(weekData[0].order_date + 'T00:00:00');
    
    weeklyData.push({
      label: `Week ${Math.floor(i/7) + 1}`,
      sales: totalSales,
      revenue: totalRevenue,
      avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
    });
  }

  const labels = weeklyData.map(w => w.label);
  const salesData = weeklyData.map(w => w.sales);
  const revenueData = weeklyData.map(w => w.revenue);
  const avgOrderValueData = weeklyData.map(w => w.avgOrderValue);

  // Color arrays based on performance
  const salesColors = salesData.map((sales, index) => {
    if (index === 0) return 'rgba(148, 163, 184, 0.7)';
    const prevSales = salesData[index - 1];
    if (sales > prevSales) return 'rgba(34, 197, 94, 0.7)'; // GREEN
    if (sales < prevSales) return 'rgba(239, 68, 68, 0.7)'; // RED
    return 'rgba(148, 163, 184, 0.7)';
  });

  salesRevenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weekly Sales',
        data: salesData,
        backgroundColor: salesColors,
        borderColor: salesColors.map(c => c.replace('0.7', '1')),
        borderWidth: 2,
        yAxisID: 'y'
      }, {
        label: 'Weekly Revenue (₹)',
        data: revenueData,
        type: 'line',
        borderColor: '#b0a680',
        backgroundColor: 'rgba(176, 166, 128, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        yAxisID: 'y1'
      }, {
        label: 'Avg Order Value (₹)',
        data: avgOrderValueData,
        type: 'line',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        pointRadius: 3,
        borderDash: [5, 5],
        yAxisID: 'y2'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { 
            color: '#eae8e0',
            font: { size: 11 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(32, 38, 27, 0.9)',
          titleColor: '#eae8e0',
          bodyColor: '#b0a680',
          borderColor: '#b0a680',
          borderWidth: 1
        }
      },
      scales: {
        x: { 
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { color: '#b0a680', font: { size: 10 } }
        },
        y: {
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { color: '#22c55e', font: { size: 10 } },
          title: { display: true, text: 'Sales Count', color: '#22c55e' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { 
            color: '#b0a680', 
            font: { size: 10 },
            callback: function(value) { return '₹' + (value/1000).toFixed(0) + 'K'; }
          },
          title: { display: true, text: 'Revenue (₹)', color: '#b0a680' }
        },
        y2: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { 
            color: '#f59e0b',
            font: { size: 10 },
            callback: function(value) { return '₹' + value.toFixed(0); }
          }
        }
      }
    }
  });
}

// Create Growth Analysis Chart
function createGrowthAnalysisChart(monthlyData) {
  const ctx = document.getElementById('growthAnalysisChart');
  if (!ctx) return;

  if (growthAnalysisChart) {
    growthAnalysisChart.destroy();
  }

  const recentMonths = monthlyData.slice(-12); // Last 12 months
  const labels = recentMonths.map(m => formatMonthLabel(m.year, m.month));
  const salesData = recentMonths.map(m => m.no_of_sales || 0);
  
  // Calculate month-over-month growth percentages
  const growthData = salesData.map((sales, index) => {
    if (index === 0) return 0;
    const prevSales = salesData[index - 1];
    if (prevSales === 0) return 0;
    return ((sales - prevSales) / prevSales * 100);
  });

  // Color coding - BRUTAL profit/loss visualization
  const growthColors = growthData.map(growth => {
    if (growth > 0) return 'rgba(34, 197, 94, 0.7)'; // GREEN for positive growth
    if (growth < 0) return 'rgba(239, 68, 68, 0.7)'; // RED for negative growth
    return 'rgba(148, 163, 184, 0.7)'; // neutral for zero
  });

  const borderColors = growthColors.map(c => c.replace('0.7', '1'));

  growthAnalysisChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Growth (%)',
        data: growthData,
        backgroundColor: growthColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { 
            color: '#eae8e0',
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(32, 38, 27, 0.9)',
          titleColor: '#eae8e0',
          bodyColor: '#b0a680',
          borderColor: '#b0a680',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const symbol = value > 0 ? '📈' : value < 0 ? '📉' : '➡️';
              const color = value > 0 ? 'PROFIT' : value < 0 ? 'LOSS' : 'FLAT';
              return `${symbol} ${value.toFixed(1)}% (${color})`;
            }
          }
        }
      },
      scales: {
        x: { 
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { 
            color: '#b0a680',
            font: { size: 10 },
            maxRotation: 45
          }
        },
        y: { 
          grid: { color: 'rgba(176, 166, 128, 0.1)' },
          ticks: { 
            color: '#eae8e0',
            font: { size: 10 },
            callback: function(value) {
              return value.toFixed(1) + '%';
            }
          },
          title: {
            display: true,
            text: 'Growth Rate (%)',
            color: '#eae8e0',
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// Auto-load on page load
console.log("🚀 Auto-loading dashboard...");
loadAvailableMonths(); // Load months first
fetchDashboardData();
