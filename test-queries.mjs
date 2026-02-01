const queries = [
  "What sports inventory do you have?",
  "Find inventory under $20 CPM",
  "What's good for reaching tech executives?",
  "What video formats do you support?",
  "What publishers can I access?",
  "Which properties have premium deals?",
  "What's the minimum budget for NYT?",
  "Launch a $5K test campaign on ESPN"
];

async function testQuery(query, index) {
  console.log("\n" + "=".repeat(70));
  console.log("QUERY " + (index + 1) + ": " + query);
  console.log("=".repeat(70));

  try {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query })
    });

    const data = await response.json();

    // Show tool calls
    if (data.toolCalls && data.toolCalls.length > 0) {
      console.log("\nTOOL CALLS:");
      for (const tc of data.toolCalls) {
        console.log("  - " + tc.name + "(" + JSON.stringify(tc.input) + ")");
      }
    } else {
      console.log("\nTOOL CALLS: None");
    }

    // Show response (truncated)
    console.log("\nRESPONSE:");
    console.log(data.message?.substring(0, 1000) || "No message");
    if (data.message && data.message.length > 1000) {
      console.log("... [truncated, total " + data.message.length + " chars]");
    }

  } catch (err) {
    console.log("ERROR:", err.message);
  }
}

// Run sequentially
async function runAll() {
  for (let i = 0; i < queries.length; i++) {
    await testQuery(queries[i], i);
  }
}

runAll();
