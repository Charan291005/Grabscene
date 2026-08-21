import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// We must hit the local API since this simulates actual web traffic.
// Ensure `npm run dev` is running before executing this script!

const showId = "ssss1111-ssss-1111-ssss-1111ssss1111"; // Mock Event A
const seatId = "eeee5555-eeee-5555-eeee-5555eeee5554"; // Known available seat
const userId = "11111111-1111-1111-1111-111111111111"; // Admin user

async function main() {
  console.log("==========================================");
  console.log("🚀 GRABSCENE CONCURRENCY STRESS TEST 🚀");
  console.log("==========================================\n");
  console.log(`Target Show: ${showId}`);
  console.log(`Target Seat: ${seatId}`);
  console.log(`Concurrency: 50 parallel requests\n`);

  const requests = Array.from({ length: 50 }).map(async (_, i) => {
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:3000/api/seats/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          seatIds: [seatId],
          userId
        })
      });
      const duration = performance.now() - start;
      const data = await res.json().catch(() => ({}));
      return { status: res.status, duration, error: data.error };
    } catch (err: any) {
      const duration = performance.now() - start;
      return { status: 500, duration, error: err.message };
    }
  });

  const results = await Promise.all(requests);

  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;
  let totalTime = 0;

  results.forEach((res) => {
    totalTime += res.duration;
    if (res.status === 200) {
      successCount++;
    } else if (res.status === 409) {
      conflictCount++;
    } else {
      errorCount++;
    }
  });

  console.log("📊 RESULTS SUMMARY");
  console.log("------------------------------------------");
  console.log(`✅ Success (HTTP 200):  ${successCount} (Expected: 1)`);
  console.log(`🔒 Conflict (HTTP 409): ${conflictCount} (Expected: 49)`);
  console.log(`❌ Errors (HTTP 500+):  ${errorCount} (Expected: 0)`);
  console.log(`⏱️ Avg Response Time:   ${(totalTime / 50).toFixed(2)}ms`);
  console.log("------------------------------------------");
  
  if (successCount === 1 && conflictCount === 49) {
    console.log("\n🎉 TEST PASSED: Perfect ACID transaction isolation! Zero deadlocks.");
    process.exit(0);
  } else if (errorCount > 0) {
    console.log("\n⚠️ TEST FAILED: Network errors detected. Did you start the server via 'npm run dev'?");
    process.exit(1);
  } else {
    console.log("\n⚠️ TEST FAILED: Concurrency leak detected or DB locked unexpectedly.");
    process.exit(1);
  }
}

main();
