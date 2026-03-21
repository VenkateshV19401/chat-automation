import { config } from "../config/config.js";

function getBaseUrl() {
  return config.redirectUri.replace(/\/auth\/callback$/, "");
}

function renderLegalPage(title, content) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <style>
          :root { color-scheme: dark; }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #120b16, #1b1333 55%, #2a1247);
            color: #f7f3ff;
          }
          main {
            max-width: 860px;
            margin: 48px auto;
            padding: 32px;
            background: rgba(14, 18, 36, 0.78);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
          }
          h1, h2 { line-height: 1.2; }
          h1 { margin-top: 0; font-size: 2rem; }
          h2 { margin-top: 28px; font-size: 1.1rem; color: #ffb1cc; }
          p, li { color: #e7ddff; line-height: 1.7; }
          a { color: #ff7bac; }
          code {
            background: rgba(255, 255, 255, 0.08);
            padding: 2px 6px;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <main>
          ${content}
        </main>
      </body>
    </html>
  `;
}

export function getHomePage(_req, res) {
  res.type("html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Instagram Automation Backend</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 760px; margin: 40px auto; line-height: 1.5; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
          a.button { display: inline-block; background: #e1306c; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <h1>Instagram Automation Backend</h1>
        <p>This backend handles Instagram Login, media loading, automation storage, and webhook processing.</p>
        <p><a class="button" href="/auth/login">Continue with Instagram</a></p>
        <p>Callback: <code>${config.redirectUri}</code></p>
        <p>Webhook verify token configured: <code>${config.webhookVerifyToken ? "yes" : "no"}</code></p>
      </body>
    </html>
  `);
}

export function getHealth(_req, res) {
  res.json({
    ok: true,
    port: config.port,
    redirectUri: config.redirectUri,
    scopes: config.scopes,
    frontendUrl: config.frontendUrl,
  });
}

export function getPrivacyPage(_req, res) {
  res.type("html").send(renderLegalPage("Privacy Policy", `
    <h1>Privacy Policy</h1>
    <p>DmAutomation helps Instagram professional accounts connect their account, load media, and create automation rules for comment replies and private replies.</p>

    <h2>Information We Collect</h2>
    <ul>
      <li>Instagram account identifiers such as account ID, username, and account type.</li>
      <li>Instagram access tokens required to operate the connected automation features.</li>
      <li>Media metadata such as post or reel IDs, captions, permalinks, and media URLs used for rule selection.</li>
      <li>Automation configuration data such as trigger keywords, reply text, and target media.</li>
    </ul>

    <h2>How We Use Information</h2>
    <ul>
      <li>To authenticate the connected Instagram professional account.</li>
      <li>To display the user’s media inside the dashboard.</li>
      <li>To process webhook events and run automation rules configured by the user.</li>
      <li>To support troubleshooting, security, and service improvements.</li>
    </ul>

    <h2>Data Sharing</h2>
    <p>We do not sell personal data. Data is used only to provide the automation features requested by the connected account owner.</p>

    <h2>Data Retention</h2>
    <p>We retain connected account data and automation records only as long as necessary to operate the app or until the user requests deletion.</p>

    <h2>Contact</h2>
    <p>For privacy questions, contact <a href="mailto:abishekincrix@gmail.com">abishekincrix@gmail.com</a>.</p>
  `));
}

export function getTermsPage(_req, res) {
  res.type("html").send(renderLegalPage("Terms of Service", `
    <h1>Terms of Service</h1>
    <p>By using DmAutomation, you agree to use the service only for lawful Instagram automation related to your own professional account.</p>

    <h2>Use of the Service</h2>
    <ul>
      <li>You must connect only Instagram accounts you are authorized to control.</li>
      <li>You are responsible for the automation rules, reply text, and links you configure.</li>
      <li>You must comply with Meta platform policies and applicable laws.</li>
    </ul>

    <h2>Service Availability</h2>
    <p>We may update, improve, or temporarily interrupt the service for maintenance, debugging, or platform changes.</p>

    <h2>Account Removal</h2>
    <p>You may disconnect the app at any time through Meta or Instagram settings. You may also request account data deletion using the data deletion instructions page.</p>

    <h2>Contact</h2>
    <p>For support or legal questions, contact <a href="mailto:abishekincrix@gmail.com">abishekincrix@gmail.com</a>.</p>
  `));
}

export function getDataDeletionPage(_req, res) {
  res.type("html").send(renderLegalPage("Data Deletion Instructions", `
    <h1>Data Deletion Instructions</h1>
    <p>If you want your connected account data removed from DmAutomation, send a deletion request to <a href="mailto:abishekincrix@gmail.com">abishekincrix@gmail.com</a> with the subject <code>Data Deletion Request</code>.</p>

    <h2>Please Include</h2>
    <ul>
      <li>Your Instagram username.</li>
      <li>The email address used to contact us.</li>
      <li>A short note requesting deletion of your app data.</li>
    </ul>

    <h2>What Will Be Deleted</h2>
    <ul>
      <li>Stored Instagram account details.</li>
      <li>Stored access tokens.</li>
      <li>Saved automation rules and related media mappings.</li>
    </ul>

    <h2>Processing Time</h2>
    <p>We aim to process verified deletion requests within 7 business days.</p>

    <h2>Meta Callback</h2>
    <p>Meta can also send automated deletion callbacks to <a href="${getBaseUrl()}/deletion">${getBaseUrl()}/deletion</a>.</p>
  `));
}

export function handleDeauthorize(req, res) {
  console.log("[app] Deauthorize request received:", {
    method: req.method,
    query: req.query,
    body: req.body,
  });

  res.json({ ok: true, message: "Deauthorization callback received" });
}

export function handleDeletionRequest(req, res) {
  console.log("[app] Data deletion request received:", {
    method: req.method,
    query: req.query,
    body: req.body,
  });

  res.json({
    url: `${getBaseUrl()}/data-deletion`,
    confirmation_code: `insta-delete-${Date.now()}`,
  });
}
