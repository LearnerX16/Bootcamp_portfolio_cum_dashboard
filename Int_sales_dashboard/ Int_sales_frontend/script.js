console.log("Dashboard JavaScript connected");

const API_BASE_URL = "http://localhost:3000";

const salesTrendTotals = {
  "2026-06-27": 950,
  "2026-06-28": 1120,
  "2026-06-29": 1280,
  "2026-06-30": 1400
};

function formatCurrency(amount) {
  return "\u20b9" + amount.toLocaleString("en-IN");
}

function setTrendClass(elementId, trendType) {
  const element = document.getElementById(elementId);

  element.classList.remove("positive", "negative", "neutral");

  if (trendType === "positive") {
    element.classList.add("positive");
  } else if (trendType === "negative") {
    element.classList.add("negative");
  } else {
    element.classList.add("neutral");
  }
}

function updateTrendBars(selectedDate) {
  const maxUnits = Math.max(...Object.values(salesTrendTotals));

  Object.keys(salesTrendTotals).forEach(function (date) {
    const bar = document.getElementById("bar-" + date);
    const units = salesTrendTotals[date];
    const widthPercentage = (units / maxUnits) * 100;

    bar.style.width = widthPercentage + "%";

    if (date === selectedDate) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });
}

function showDashboardError(message) {
  document.getElementById("totalUnits").textContent = "0";
  document.getElementById("totalRevenue").textContent = formatCurrency(0);
  document.getElementById("topCountry").textContent = "-";
  document.getElementById("activationRate").textContent = "0%";
  document.getElementById("unitsTrend").textContent = "No data loaded";
  document.getElementById("revenueTrend").textContent = "No data loaded";
  document.getElementById("activationStatus").textContent = "No data loaded";
  document.getElementById("insightText").textContent = message;

  setTrendClass("unitsTrend", "neutral");
  setTrendClass("revenueTrend", "neutral");
  setTrendClass("activationStatus", "neutral");
}

async function updateDashboard(reportDate) {
  try {
    const apiUrl = API_BASE_URL + "/api/sales?report_date=" + reportDate;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      showDashboardError(data.error);
      updateTrendBars(reportDate);
      return;
    }

    document.getElementById("totalUnits").textContent = data.total_units_sold;
    document.getElementById("totalRevenue").textContent = formatCurrency(data.total_revenue);
    document.getElementById("topCountry").textContent = data.top_country;
    document.getElementById("activationRate").textContent = data.activation_success_rate + "%";

    document.getElementById("unitsTrend").textContent = data.units_trend;
    document.getElementById("revenueTrend").textContent = data.revenue_trend;
    document.getElementById("activationStatus").textContent = data.activation_status;
    document.getElementById("insightText").textContent = data.insight;

    setTrendClass("unitsTrend", data.trend_type);
    setTrendClass("revenueTrend", data.trend_type);

    if (data.activation_success_rate >= 90) {
      setTrendClass("activationStatus", "positive");
    } else {
      setTrendClass("activationStatus", "negative");
    }

    updateTrendBars(reportDate);
  } catch (error) {
    showDashboardError("Unable to connect to backend API.");
    console.error(error);
  }
}

const reportDateSelect = document.getElementById("reportDate");

reportDateSelect.addEventListener("change", function () {
  updateDashboard(reportDateSelect.value);
});

updateDashboard(reportDateSelect.value);
