const queries = [
  // DISCOVER - Finding the Right Inventory
  "What sports inventory do you have?",
  "Find inventory under $20 CPM",
  "What's good for reaching tech executives?",
  "What video formats do you support?",
  "What publishers can I access?",
  "Which properties have premium deals?",
  "What's the minimum budget for NYT?",
  "Launch a $5K test campaign on ESPN",

  // MONITOR - Campaign Performance
  "Show me all active campaigns",
  "What's our total spend this month?",
  "How are we pacing against budgets?",
  "Which campaigns are underperforming?",
  "How is Apex Motors performing?",
  "Break down Apex by device",
  "Show me performance by geo",
  "What's our best performing campaign?",

  // OPTIMIZE - Making Adjustments
  "Why is Apex Motors struggling?",
  "What optimisations would you recommend?",
  "Reduce Apex mobile bid by 20%",
  "Pause Germany targeting",
  "Shift 20% budget from mobile to desktop",
  "TechFlow is overspending - cap the daily budget",
  "Submit our conversion data for Apex",

  // GENERAL - MCP, AdCP, Digital Marketing
  "What is MCP?",
  "What is AdCP and how does it work?",
  "Explain programmatic advertising",
  "What is CPM and how is it calculated?",
  "What are the best practices for digital campaign optimization?"
];

const results = [];

async function testQuery(query, index) {
  const startTime = Date.now();

  try {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query })
    });

    const data = await response.json();
    const elapsed = Date.now() - startTime;

    const toolsCalled = data.toolCalls && data.toolCalls.length > 0;
    const toolNames = toolsCalled
      ? data.toolCalls.map(tc => tc.name).join(", ")
      : "None";

    results.push({
      index: index + 1,
      query: query,
      toolsCalled: toolsCalled ? "Yes" : "No",
      toolNames: toolNames,
      outputPreview: data.message?.substring(0, 200).replace(/\n/g, " ") || "No response",
      fullOutput: data.message || "No response",
      elapsed: elapsed
    });

    console.log("Completed " + (index + 1) + "/" + queries.length + ": " + query.substring(0, 40) + "...");

  } catch (err) {
    results.push({
      index: index + 1,
      query: query,
      toolsCalled: "Error",
      toolNames: "Error",
      outputPreview: err.message,
      fullOutput: err.message,
      elapsed: 0
    });
    console.log("Error on " + (index + 1) + ": " + err.message);
  }
}

async function runAll() {
  console.log("Starting tests for " + queries.length + " queries...\n");

  for (let i = 0; i < queries.length; i++) {
    await testQuery(queries[i], i);
  }

  // Print summary table
  console.log("\n\n" + "=".repeat(120));
  console.log("INTEGRATION TEST REPORT");
  console.log("=".repeat(120));
  console.log("Date: " + new Date().toISOString());
  console.log("Total Queries: " + queries.length);
  console.log("=".repeat(120) + "\n");

  // Section headers
  const sections = [
    { start: 0, end: 8, name: "DISCOVER - Finding the Right Inventory" },
    { start: 8, end: 16, name: "MONITOR - Campaign Performance" },
    { start: 16, end: 23, name: "OPTIMIZE - Making Adjustments" },
    { start: 23, end: 28, name: "GENERAL - MCP, AdCP, Digital Marketing" }
  ];

  for (const section of sections) {
    console.log("\n" + "-".repeat(120));
    console.log("SECTION: " + section.name);
    console.log("-".repeat(120));

    for (let i = section.start; i < section.end; i++) {
      const r = results[i];
      if (!r) continue;

      console.log("\n[" + r.index + "] QUERY: " + r.query);
      console.log("    Tool Called: " + r.toolsCalled + " | Tool Name(s): " + r.toolNames + " | Time: " + r.elapsed + "ms");
      console.log("    OUTPUT: " + r.outputPreview + "...");
    }
  }

  // Stats summary
  const withTools = results.filter(r => r.toolsCalled === "Yes").length;
  const withoutTools = results.filter(r => r.toolsCalled === "No").length;
  const errors = results.filter(r => r.toolsCalled === "Error").length;

  console.log("\n\n" + "=".repeat(120));
  console.log("SUMMARY STATISTICS");
  console.log("=".repeat(120));
  console.log("Total Queries: " + queries.length);
  console.log("With Tool Calls: " + withTools);
  console.log("Without Tool Calls: " + withoutTools);
  console.log("Errors: " + errors);
  console.log("=".repeat(120));

  // Tool usage breakdown
  console.log("\nTOOL USAGE BREAKDOWN:");
  const toolCounts = {};
  for (const r of results) {
    if (r.toolsCalled === "Yes") {
      const tools = r.toolNames.split(", ");
      for (const t of tools) {
        toolCounts[t] = (toolCounts[t] || 0) + 1;
      }
    }
  }
  for (const [tool, count] of Object.entries(toolCounts)) {
    console.log("  - " + tool + ": " + count + " times");
  }
}

runAll();
