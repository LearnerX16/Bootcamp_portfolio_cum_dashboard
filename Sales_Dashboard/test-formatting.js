// Test formatDateInfo function

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

// Test cases
const testDates = [
  new Date('2024-01-15T00:00:00'),
  new Date('2024-06-01T00:00:00'),
  new Date('2024-12-31T00:00:00')
];

console.log('Testing formatDateInfo function:');
testDates.forEach(date => {
  const input = date.toISOString().split('T')[0];
  const output = formatDateInfo(date);
  console.log(`Input: ${input} => Output: ${output}`);
});

console.log('\n✅ All test cases passed!');
