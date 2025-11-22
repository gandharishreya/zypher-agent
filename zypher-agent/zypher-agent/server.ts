import { serve } from "https://deno.land/std/http/server.ts";
import { runAgent } from "./main.ts";

serve(async (req) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    if (req.method === "POST" && req.url === "/run-agent") {
      const { query } = await req.json();
      const output = await runAgent(query);

      return new Response(JSON.stringify({ output }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return new Response("Internal server error", { status: 500 });
  }
});










/*import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const file = await Deno.readTextFile("./index.html");
  return new Response(file, {
    headers: { "content-type": "text/html" },
  });
});

console.log("Server running at http://localhost:8000");
*/

// server.ts
/*
import { serve } from "https://deno.land/std/http/server.ts";
import { runAgent } from "./main.ts";

serve(async (req) => {
  try {
    // Serve HTML page
    if (req.method === "GET" && req.url === "/") {
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    // Agent API endpoint
    if (req.method === "POST" && req.url === "/run-agent") {
      const body = await req.json();
      const userQuery = body.query;

      const result = await runAgent(userQuery);

      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    // Not found route
    return new Response("Not found", { status: 404 });
  } catch (err) {
    console.error("Server Error:", err);
    return new Response("Error: " + err.message, { status: 500 });
  }
});
*/

