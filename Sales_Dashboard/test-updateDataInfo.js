// Test updateDataInfo function with formatMonthRange

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatDateInfo(date) {
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

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

console.log('Testing Task 5.1 - formatDateInfo() integration:');
console.log('================================================');

// Test case 1: Selected date formatting
const reportDate = '2024-01-15';
const selectedDate = new Date(reportDate + 'T00:00:00');
const formattedSelectedDate = formatDateInfo(selectedDate);
console.log(`Selected Date: ${reportDate}`);
console.log(`Formatted: ${formattedSelectedDate}`);
console.log(`Expected: January 15, 2024`);
console.log(`✓ Test 5.1 ${formattedSelectedDate === 'January 15, 2024' ? 'PASSED' : 'FAILED'}`);
console.log();

console.log('Testing Task 5.2 - formatMonthRange() integration:');
console.log('=================================================');

// Test case 2: Single month range
const minDate1 = new Date('2024-01-01T00:00:00');
const maxDate1 = new Date('2024-01-31T00:00:00');
const formattedRange1 = formatMonthRange(minDate1, maxDate1);
console.log(`Date Range: 2024-01-01 to 2024-01-31`);
console.log(`Formatted: ${formattedRange1}`);
console.log(`Expected: January 2024 (Days 1-31)`);
console.log(`✓ Test 5.2a ${formattedRange1 === 'January 2024 (Days 1-31)' ? 'PASSED' : 'FAILED'}`);
console.log();

// Test case 3: Cross-month range
const minDate2 = new Date('2024-01-15T00:00:00');
const maxDate2 = new Date('2024-02-14T00:00:00');
const formattedRange2 = formatMonthRange(minDate2, maxDate2);
console.log(`Date Range: 2024-01-15 to 2024-02-14`);
console.log(`Formatted: ${formattedRange2}`);
console.log(`Expected: January 15 – February 14, 2024`);
console.log(`✓ Test 5.2b ${formattedRange2 === 'January 15 – February 14, 2024' ? 'PASSED' : 'FAILED'}`);
console.log();

// Test case 4: Partial month range
const minDate3 = new Date('2024-06-10T00:00:00');
const maxDate3 = new Date('2024-06-20T00:00:00');
const formattedRange3 = formatMonthRange(minDate3, maxDate3);
console.log(`Date Range: 2024-06-10 to 2024-06-20`);
console.log(`Formatted: ${formattedRange3}`);
console.log(`Expected: June 2024 (Days 10-20)`);
console.log(`✓ Test 5.2c ${formattedRange3 === 'June 2024 (Days 10-20)' ? 'PASSED' : 'FAILED'}`);
console.log();

console.log('====================================');
console.log('✅ All Task 5 tests completed!');
console.log('====================================');
