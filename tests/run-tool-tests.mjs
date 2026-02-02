/**
 * Unit-style API tests for the 7 AdCP tools.
 *
 * Writes a machine-readable results file to:
 *   tests/results/e2e_tool_unit_results.json
 *
 * Run (with backend running on localhost:3001):
 *   node tests/run-tool-tests.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";
const OUT_PATH =
  process.env.OUT_PATH ||
  path.join(process.cwd(), "tests", "results", "e2e_tool_unit_results.json");

function nowMs() {
  return Date.now();
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    const err = new Error(`Failed to parse JSON from ${url}: ${e?.message || e}`);
    err.status = res.status;
    err.bodyText = text;
    throw err;
  }
  return { status: res.status, ok: res.ok, json };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function callTool(toolName, input) {
  const start = nowMs();
  const { status, ok, json } = await fetchJson(`${BASE_URL}/api/tools/${toolName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input ?? {}),
  });
  const elapsedMs = nowMs() - start;
  return { toolName, input: input ?? {}, httpStatus: status, httpOk: ok, elapsedMs, response: json };
}

function findByName(items, nameSubstring) {
  const needle = String(nameSubstring).toLowerCase();
  return (items || []).find((x) => String(x?.name || "").toLowerCase().includes(needle));
}

async function main() {
  const startedAt = new Date().toISOString();
  const results = {
    startedAt,
    baseUrl: BASE_URL,
    health: null,
    toolTests: [],
    summary: null,
  };

  // Health check
  try {
    const { status, ok, json } = await fetchJson(`${BASE_URL}/health`, { method: "GET" });
    results.health = { httpStatus: status, httpOk: ok, body: json };
  } catch (e) {
    results.health = { error: e?.message || String(e) };
  }

  const toolTests = [];

  // 1) get_products (DISCOVER)
  toolTests.push(
    await callTool("get_products", { category: "Sports" })
  );

  // 2) list_creative_formats (DISCOVER)
  toolTests.push(await callTool("list_creative_formats", {}));

  // 3) list_authorized_properties (DISCOVER)
  toolTests.push(await callTool("list_authorized_properties", {}));

  // 4) create_media_buy (DISCOVER→BUY)
  toolTests.push(
    await callTool("create_media_buy", {
      brand_name: "Test Corp",
      product_id: "prod_espn_premium",
      budget: 5000,
      targeting: { geo_country_any_of: ["US"], device_type: ["mobile", "desktop"] },
      start_time: "2026-02-01T00:00:00Z",
      end_time: "2026-03-01T23:59:59Z",
    })
  );

  // 5) get_media_buy_delivery (MONITOR)
  toolTests.push(await callTool("get_media_buy_delivery", { media_buy_id: "mb_apex_motors_q1" }));

  // 6) update_media_buy (OPTIMISE)
  toolTests.push(
    await callTool("update_media_buy", {
      media_buy_id: "mb_apex_motors_q1",
      updates: { adjust_bid: { device: "mobile", change_percent: -20 } },
    })
  );

  // 7) provide_performance_feedback (OPTIMISE)
  toolTests.push(
    await callTool("provide_performance_feedback", {
      media_buy_id: "mb_apex_motors_q1",
      feedback_type: "conversion_data",
      data: { conversions: 25, conversion_value: 125000, attribution_window: "30-day" },
    })
  );

  // Assertions (kept minimal; detailed mapping is in the markdown report)
  const assertions = [];
  let passed = 0;
  let failed = 0;

  for (const t of toolTests) {
    const a = [];
    let ok = true;
    try {
      assert(t.httpOk, `HTTP ${t.httpStatus}`);
      assert(t.response && t.response.success === true, "response.success !== true");

      if (t.toolName === "get_products") {
        assert(Array.isArray(t.response.products), "products is not an array");
        const products = t.response.products;
        const espn = findByName(products, "ESPN");
        const si = findByName(products, "Sports Illustrated");
        const bleacher = findByName(products, "Bleacher");
        assert(espn, "missing ESPN product in Sports category");
        assert(si, "missing Sports Illustrated product in Sports category");
        assert(bleacher, "missing Bleacher product in Sports category");
        a.push("sports_products_present");
      }

      if (t.toolName === "list_creative_formats") {
        assert(Array.isArray(t.response.formats), "formats is not an array");
        assert(t.response.count === 14, `expected 14 formats, got ${t.response.count}`);
        a.push("formats_count_14");
      }

      if (t.toolName === "list_authorized_properties") {
        assert(Array.isArray(t.response.properties), "properties is not an array");
        assert(t.response.count === 10, `expected 10 properties, got ${t.response.count}`);
        a.push("properties_count_10");
      }

      if (t.toolName === "create_media_buy") {
        assert(t.response.media_buy?.status === "submitted", "media_buy.status !== submitted");
        a.push("created_submitted");
      }

      if (t.toolName === "get_media_buy_delivery") {
        assert(t.response.metrics?.media_buy_id === "mb_apex_motors_q1", "metrics.media_buy_id mismatch");
        assert(t.response.metrics?.summary?.impressions === 3850000, "Apex impressions mismatch");
        assert(t.response.metrics?.summary?.ctr === 0.12, "Apex CTR mismatch");
        a.push("apex_metrics_match_prd_core_fields");
      }

      if (t.toolName === "update_media_buy") {
        const changes = t.response.result?.changes_applied || [];
        const adj = changes.find((c) => c?.operation === "adjust_bid");
        assert(adj, "missing adjust_bid change");
        assert(adj.previous_value === 8.5, `expected previous_value 8.5, got ${adj.previous_value}`);
        assert(adj.new_value === 6.8, `expected new_value 6.8, got ${adj.new_value}`);
        a.push("adjust_bid_mobile_20pct");
      }

      if (t.toolName === "provide_performance_feedback") {
        assert(t.response.result?.status === "processed", "feedback status not processed");
        a.push("feedback_processed");
      }
    } catch (e) {
      ok = false;
      a.push(`error:${e?.message || String(e)}`);
    }

    assertions.push({ toolName: t.toolName, ok, assertions: a });
    if (ok) passed += 1;
    else failed += 1;
  }

  results.toolTests = toolTests.map((t) => ({
    ...t,
    // keep response as-is (full evidence); assertions are stored separately below
  }));
  results.summary = {
    total: toolTests.length,
    passed,
    failed,
    assertions,
    responseTimeMs: {
      max: Math.max(...toolTests.map((t) => t.elapsedMs)),
      avg: Math.round(toolTests.reduce((sum, t) => sum + t.elapsedMs, 0) / toolTests.length),
    },
  };

  ensureDirForFile(OUT_PATH);
  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), "utf8");

  console.log(`Wrote: ${OUT_PATH}`);
  console.log(`Tools: ${passed}/${toolTests.length} passed. Avg ${results.summary.responseTimeMs.avg}ms, Max ${results.summary.responseTimeMs.max}ms.`);

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

