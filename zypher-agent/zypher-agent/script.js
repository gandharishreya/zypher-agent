
async function fetchAI() {
  const outputBox = document.getElementById("output");
  outputBox.textContent = "Loading...\n";

  const res = await fetch("/run-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Find latest AI news in 5 concise bullet points" })
  });

  const data = await res.json();
  outputBox.textContent = data.output;
}

fetchAI();























/*const outputBox = document.getElementById("output");

// Paste your streaming output here as plain text:
const aiText = `
### Latest AI News

• AI Breakthroughs: Recent NLP improvements…
• AI in Healthcare: Diagnostic AI tools…
• AI Ethics: Transparency concerns…
• AI in Education: Personalized learning…
• AI Job Market: New AI roles emerging…
`;

let index = 0;

function typeEffect() {
  if (index < aiText.length) {
    outputBox.textContent += aiText.charAt(index);
    index++;
    setTimeout(typeEffect, 20); // typing speed
  }
}

typeEffect();
*/


