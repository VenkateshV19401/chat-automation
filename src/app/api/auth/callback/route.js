import { NextResponse } from "next/server";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { SessionService } from "@/lib/services/SessionService";
import { InstagramService } from "@/lib/services/InstagramService";
import {
  exchangeCodeForAccessToken,
  exchangeForLongLivedAccessToken,
  fetchInstagramProfile,
} from "@/lib/services/instagramAuthService";

export async function GET(request) {
  await connectDb();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (error) {
    console.error("[oauth] Instagram returned an error:", error);
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code query parameter" }, { status: 400 });
  }

  try {
    console.log("[oauth] Received code from Instagram");
    const tokenData = await exchangeCodeForAccessToken(code);

    let finalTokenData = tokenData;
    if (tokenData.access_token) {
      try {
        const longLivedTokenData = await exchangeForLongLivedAccessToken(tokenData.access_token);
        finalTokenData = { ...tokenData, ...longLivedTokenData, permissions: tokenData.permissions || [] };
      } catch (longLivedError) {
        console.error("[oauth] Long-lived token exchange failed:", longLivedError.message);
      }
    }

    const profile = finalTokenData.access_token ? await fetchInstagramProfile(finalTokenData.access_token) : null;
    if (profile) console.log("[oauth] Profile:", profile);

    const instagramUserId = String(profile?.user_id || "");
    let user = await UserRepository.findUserByInstagramUserId(instagramUserId);

    const userPayload = {
      instagramUserId,
      instagramLoginId: profile?.id ? String(profile.id) : "",
      instagramTokenUserId: finalTokenData.user_id ? String(finalTokenData.user_id) : "",
      username: profile?.username || "",
      profilePictureUrl: profile?.profile_picture_url || "",
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

    const session = await SessionService.issueSession(user);
    const redirectUrl = `${appUrl}/login?token=${session.accessToken}`;
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Set-Cookie", session.cookieHeader);
    return response;
  } catch (err) {
    const details = err.response?.data || err.message;
    console.error("[oauth] Callback exchange failed:", details);
    return NextResponse.json({ error: "Instagram callback exchange failed", details }, { status: 500 });
  }
}
