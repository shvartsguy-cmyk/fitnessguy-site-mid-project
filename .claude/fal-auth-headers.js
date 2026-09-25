// headersHelper for the fal-ai MCP server (see .mcp.json).
// Claude Code does not load .env files, so this reads FAL_KEY from the project's .env
// and prints the Authorization header as JSON. The key never appears in any tracked file.
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let key = "";
try {
  const line = fs.readFileSync(envPath, "utf8").split(/\r?\n/).find((l) => /^\s*FAL_KEY\s*=/.test(l));
  if (line) key = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
} catch {
  console.error(`fal-auth-headers: cannot read ${envPath}`);
}

if (!key || key === "your_fal_api_key") {
  console.error("fal-auth-headers: FAL_KEY is empty in .env — get a key at https://fal.ai/dashboard/keys");
  process.stdout.write("{}");
} else {
  process.stdout.write(JSON.stringify({ Authorization: `Bearer ${key}` }));
}
