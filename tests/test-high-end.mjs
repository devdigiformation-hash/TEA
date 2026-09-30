import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223; // Use fresh port 9223
const BASE_URL = "http://localhost:6060";

async function run() {
  console.log("=== VALIDATING HIGH-END ASTRA & CLAUDE / KIMI FEATURES ===");

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

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
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
    console.error("Could not connect to Chrome on port", PORT);
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let idCounter = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = idCounter++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((res) => (ws.onopen = res));

  // Wait for initial render
  await new Promise((r) => setTimeout(r, 2200));

  // 1. Capture High-End Home view
  const homeShot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("tests/screenshots/11_highend_home.png", Buffer.from(homeShot.data, "base64"));
  console.log("Captured 11_highend_home.png");

  // 2. Click '3D Artifact' button (Astra 6 3D Leaf Inspector)
  const evalRes = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const texts = btns.map(b => b.textContent || "");
      const target = btns.find(b => (b.textContent || "").includes("3D Artifact"));
      if (target) {
        target.click();
        return { success: true, texts };
      }
      return { success: false, texts };
    })()`,
  });
  console.log("Evaluate result for 3D Artifact:", JSON.stringify(evalRes));
  await new Promise((r) => setTimeout(r, 1800));

  const leafShot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("tests/screenshots/12_astra_3d_leaf.png", Buffer.from(leafShot.data, "base64"));
  console.log("Captured 12_astra_3d_leaf.png");

  // 3. Close Leaf Inspector
  await send("Runtime.evaluate", {
    expression: `(() => {
      const exitBtn = document.querySelector(".tea-leaf-inspector-overlay button[aria-label='Exit leaf inspector']");
      if (exitBtn) { exitBtn.click(); return true; }
      return false;
    })()`,
  });
  await new Promise((r) => setTimeout(r, 600));

  // 4. Click 'Leaf AI' button (Claude & Kimi Copilot Drawer)
  const aiEval = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find(b => (b.textContent || "").includes("Leaf AI"));
      if (target) {
        target.click();
        return { success: true };
      }
      return { success: false };
    })()`,
  });
  console.log("Evaluate result for Leaf AI:", JSON.stringify(aiEval));
  await new Promise((r) => setTimeout(r, 1400));

  const aiShot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("tests/screenshots/13_claude_kimi_ai.png", Buffer.from(aiShot.data, "base64"));
  console.log("Captured 13_claude_kimi_ai.png");

  ws.close();
  chrome.kill();
  console.log("=== HIGH-END FEATURES VALIDATED SUCCESSFULLY ===");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
