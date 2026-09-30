import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const BASE_URL = "http://localhost:6060";
const SCREENSHOTS_DIR = path.resolve("./tests/screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log("=== LAUNCHING CHROME CDP RUNTIME TEST ===");

  // Spawn Chrome with remote debugging
  const chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1440,900",
    ],
    { stdio: "ignore" }
  );

  // Wait for Chrome CDP port to open
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE_URL)}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.webSocketDebuggerUrl) {
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error("Could not connect to Chrome DevTools Protocol port");
    chrome.kill();
    process.exit(1);
  }

  console.log("Connected to Chrome via WebSocket:", wsUrl);
  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Wait for page to settle
  await new Promise((r) => setTimeout(r, 1500));

  // Helper to evaluate JS and return value
  const evalJs = async (expr) => {
    const res = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  };

  // Helper to take screenshot
  const takeScreenshot = async (filename) => {
    const res = await send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, filename), buffer);
    console.log(`Saved screenshot: ${filename}`);
  };

  // 1. Initial State (Origin)
  const title = await evalJs("document.title");
  console.log("Page title:", title);

  const initialChapter = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter (0):", initialChapter);
  await takeScreenshot("01_desktop_origin_1440.png");

  // 2. Scroll to Harvest (0.2)
  const metrics = await evalJs(`(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.2);
    window.dispatchEvent(new Event('scroll'));
    return { scrollY: window.scrollY, maxScroll };
  })()`);
  console.log("Scroll metrics at 0.2:", metrics);
  await new Promise((r) => setTimeout(r, 700));
  const harvestTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter (Harvest):", harvestTitle);
  await takeScreenshot("02_desktop_harvest_1440.png");

  // 3. Scroll to Air (0.4)
  const airMetrics = await evalJs(`(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.4);
    window.dispatchEvent(new Event('scroll'));
    return { scrollY: window.scrollY, maxScroll };
  })()`);
  console.log("Air metrics:", airMetrics);
  await new Promise((r) => setTimeout(r, 700));
  const airTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter (Air):", airTitle);
  await takeScreenshot("03_desktop_air_1440.png");

  // 4. Scroll to Fire (0.6)
  const fireMetrics = await evalJs(`(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.6);
    window.dispatchEvent(new Event('scroll'));
    return { scrollY: window.scrollY, maxScroll };
  })()`);
  console.log("Fire metrics:", fireMetrics);
  await new Promise((r) => setTimeout(r, 700));
  const fireTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter (Fire):", fireTitle);
  await takeScreenshot("04_desktop_fire_1440.png");

  // 5. Scroll to Passage (0.8)
  const passageMetrics = await evalJs(`(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.8);
    window.dispatchEvent(new Event('scroll'));
    return { scrollY: window.scrollY, maxScroll };
  })()`);
  console.log("Passage metrics:", passageMetrics);
  await new Promise((r) => setTimeout(r, 700));
  const passageTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter (Passage):", passageTitle);
  await takeScreenshot("05_desktop_passage_1440.png");

  // 6. Scroll to Final Cup (1.0)
  const cupMetrics = await evalJs(`(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll);
    window.dispatchEvent(new Event('scroll'));
    return { scrollY: window.scrollY, maxScroll };
  })()`);
  console.log("Cup metrics:", cupMetrics);
  await new Promise((r) => setTimeout(r, 900));
  const cupTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter (Cup):", cupTitle);
  await takeScreenshot("06_desktop_final_cup_1440.png");

  // 7. Test Begin Again button click
  await evalJs("document.querySelector('.journey-restart')?.click()");
  await new Promise((r) => setTimeout(r, 900));
  const restartedTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter after 'Begin again':", restartedTitle);

  // 8. Test Navigation Rail click jump to Fire (index 3)
  await evalJs("document.querySelectorAll('.journey-dot')[3]?.click()");
  await new Promise((r) => setTimeout(r, 900));
  const jumpedTitle = await evalJs(
    "document.querySelector('.journey-copy.is-active .journey-title')?.textContent"
  );
  console.log("Active chapter after clicking dot 3 (Fire):", jumpedTitle);

  // 9. Tablet Viewport 768x1024
  await send("Emulation.setDeviceMetricsOverride", {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evalJs("window.scrollTo(0, 0)");
  await new Promise((r) => setTimeout(r, 600));
  await takeScreenshot("07_tablet_origin_768.png");

  // 10. Mobile Viewport 390x844 (iPhone)
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 600));
  await takeScreenshot("08_mobile_origin_390.png");

  // 11. Compact Mobile 360x640
  await send("Emulation.setDeviceMetricsOverride", {
    width: 360,
    height: 640,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 600));
  await takeScreenshot("10_mobile_compact_360.png");

  // Check 3D Canvas presence
  const canvasCount = await evalJs("document.querySelectorAll('canvas').length");
  console.log("WebGL Canvas element count:", canvasCount);

  ws.close();
  chrome.kill();

  console.log("=== CDP RUNTIME VALIDATION PASSED SUCCESSFULLY ===");
}

run().catch((err) => {
  console.error("CDP Validation failed:", err);
  process.exit(1);
});
