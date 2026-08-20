/**
 * Bug Condition Exploration Test
 * 
 * This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT fix the test or code when it fails
 * This encodes the expected behavior - will validate fix when it passes
 */

const fs = require('fs');
const path = require('path');

// Read the HTML and JavaScript files
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const jsContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf-8');

console.log('🔍 Running Bug Condition Exploration Test...\n');

let failCount = 0;
let passCount = 0;

function test(description, condition, expected) {
  if (condition === expected) {
    console.log(`✅ PASS: ${description}`);
    passCount++;
  } else {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Expected: ${expected}, Got: ${condition}`);
    failCount++;
  }
}

// Test 1: View Mode dropdown should NOT exist
test('View Mode dropdown should NOT exist in HTML', 
  htmlContent.includes('id="viewMode"'), 
  false);

// Test 2: Date Range dropdown should NOT exist
test('Date Range dropdown should NOT exist in HTML', 
  htmlContent.includes('id="dateRange"'), 
  false);

// Test 3: Start Date input should NOT exist
test('Start Date input should NOT exist in HTML', 
  htmlContent.includes('id="startDate"'), 
  false);

// Test 4: End Date input should NOT exist
test('End Date input should NOT exist in HTML', 
  htmlContent.includes('id="endDate"'), 
  false);

// Test 5: applyViewMode function should NOT exist
test('applyViewMode function should NOT exist in JavaScript', 
  jsContent.includes('function applyViewMode'), 
  false);

// Test 6: viewModeSelect event listener should NOT exist
test('viewModeSelect event listener should NOT exist', 
  jsContent.includes('viewModeSelect.addEventListener'), 
  false);

// Test 7: dateRangeSelect event listener should NOT exist
test('dateRangeSelect event listener should NOT exist', 
  jsContent.includes('dateRangeSelect.addEventListener'), 
  false);

// Test 8: Mock data pattern for conversionRate should NOT exist
test('Mock Math.random() for conversionRate should NOT exist', 
  jsContent.includes('85 + Math.random() * 10'), 
  false);

// Test 9: Mock data pattern for marketShare should NOT exist
test('Mock Math.random() for marketShare should NOT exist', 
  jsContent.includes('15 + Math.random() * 5'), 
  false);

// Test 10: Yesterday Sales element SHOULD exist
test('Yesterday Sales element SHOULD exist in HTML', 
  htmlContent.includes('id="yesterdaySales"'), 
  true);

// Test 11: Day-over-Day element SHOULD exist
test('Day-over-Day element SHOULD exist in HTML', 
  htmlContent.includes('id="dayOverDay"'), 
  true);

// Test 12: Week-over-Week element SHOULD exist
test('Week-over-Week element SHOULD exist in HTML', 
  htmlContent.includes('id="weekOverWeek"'), 
  true);

// Test 13: Projected MTD element SHOULD exist
test('Projected MTD element SHOULD exist in HTML', 
  htmlContent.includes('id="projectedMTD"'), 
  true);

// Test 14: yesterdaySalesEl variable SHOULD be declared
test('yesterdaySalesEl variable SHOULD be declared', 
  jsContent.includes('yesterdaySalesEl'), 
  true);

// Test 15: Real calculation for yesterday's sales SHOULD exist
test('Real calculation for yesterday sales SHOULD exist', 
  jsContent.includes('dailyData[dailyData.length - 2]'), 
  true);

console.log('\n' + '='.repeat(50));
console.log(`Total: ${passCount + failCount} tests`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('='.repeat(50));

if (failCount > 0) {
  console.log('\n⚠️  EXPECTED OUTCOME: Test should FAIL on unfixed code');
  console.log('This confirms the bug exists (dropdowns present, mock data, missing new KPIs)');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed - bug is fixed!');
  process.exit(0);
}
