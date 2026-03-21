import { config } from "../config/config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { SessionService } from "../services/SessionService.js";
import {
  buildInstagramLoginUrl,
  exchangeCodeForAccessToken,
  exchangeForLongLivedAccessToken,
  fetchInstagramProfile,
} from "../services/instagramAuthService.js";
import { InstagramService } from "../services/InstagramService.js";

export function startInstagramLogin(_req, res) {
  const loginUrl = buildInstagramLoginUrl();
  console.log("[oauth] Redirecting to Instagram login");
  console.log("[oauth] URL:", loginUrl);
  res.redirect(loginUrl);
}

export async function handleInstagramCallback(req, res) {
  const { code, error, error_reason, error_description } = req.query;

  console.log("[oauth] Callback query params:", req.query);

  if (error) {
    console.error("[oauth] Instagram returned an error:", {
      error,
      error_reason,
      error_description,
    });
    return res.status(400).json({ error, error_reason, error_description });
  }

  if (!code || typeof code !== "string") {
    console.error("[oauth] Missing code in callback query:", req.query);
    return res.status(400).json({ error: "Missing code query parameter", query: req.query });
  }

  try {
    console.log("[oauth] Received code from Instagram");
    const tokenData = await exchangeCodeForAccessToken(code);
    console.log("[oauth] Short-lived token response:", tokenData);

    let finalTokenData = tokenData;
    if (tokenData.access_token) {
      try {
        const longLivedTokenData = await exchangeForLongLivedAccessToken(tokenData.access_token);
        console.log("[oauth] Long-lived token response:", longLivedTokenData);
        finalTokenData = {
          ...tokenData,
          ...longLivedTokenData,
          permissions: tokenData.permissions || [],
        };
      } catch (longLivedError) {
        console.error("[oauth] Long-lived token exchange failed, keeping short-lived token:", {
          message: longLivedError.message,
          status: longLivedError.response?.status,
          data: longLivedError.response?.data,
        });
      }
    }

    const profile = finalTokenData.access_token ? await fetchInstagramProfile(finalTokenData.access_token) : null;
    if (profile) {
      console.log("[oauth] Profile:", profile);
    }

    const instagramUserId = String(profile?.user_id || "");
    let user = await UserRepository.findUserByInstagramUserId(instagramUserId);

    const userPayload = {
      instagramUserId,
      instagramLoginId: profile?.id ? String(profile.id) : "",
      instagramTokenUserId: finalTokenData.user_id ? String(finalTokenData.user_id) : "",
      username: profile?.username || "",
      accountType: profile?.account_type || "",
      accessToken: finalTokenData.access_token,
      tokenType: finalTokenData.token_type || "bearer",
      tokenExpiresIn: finalTokenData.expires_in || null,
      tokenExpiresAt: finalTokenData.expires_in
        ? new Date(Date.now() + Number(finalTokenData.expires_in) * 1000).toISOString()
        : null,
      permissions: finalTokenData.permissions || [],
      connectedAt: new Date().toISOString(),
    };

    if (user) {
      user = await UserRepository.updateUser(user.id, userPayload);
    } else {
      user = await UserRepository.createUser(userPayload);
    }

    await InstagramService.subscribeToWebhook(finalTokenData.access_token);

    const session = await SessionService.issueSession(user, res);
    const appToken = session.accessToken;

    if (config.frontendUrl) {
      return res.redirect(`${config.frontendUrl}/login?token=${appToken}`);
    }

    res.type("html").send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Instagram Login Success</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 760px; margin: 40px auto; line-height: 1.5; }
            pre { background: #111827; color: #f9fafb; padding: 16px; border-radius: 10px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Instagram Login Success</h1>
          <p>The user is now saved in the local database and a JWT has been issued for API use.</p>
          <h2>App token</h2>
          <pre>${appToken}</pre>
          <h2>User</h2>
          <pre>${JSON.stringify(user, null, 2)}</pre>
        </body>
      </html>
    `);
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error("[oauth] Callback exchange failed:", details);
    console.error("[oauth] Callback exchange full error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack,
    });
    res.status(500).json({ error: "Instagram callback exchange failed", details });
  }
}

export async function refreshSession(req, res) {
  try {
    const session = await SessionService.refreshAccessToken(req, res);
    return res.json({ token: session.accessToken });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Failed to refresh session" });
  }
}

export async function logout(req, res) {
  await SessionService.clearSession(req, res);
  return res.json({ ok: true });
}
