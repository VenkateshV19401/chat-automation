import axios from "axios";
import { config } from "../config/config.js";

const INSTAGRAM_AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const INSTAGRAM_GRAPH_ME_URL = "https://graph.instagram.com/me";
const INSTAGRAM_LONG_LIVED_TOKEN_URL = "https://graph.instagram.com/access_token";
const INSTAGRAM_REFRESH_TOKEN_URL = "https://graph.instagram.com/refresh_access_token";

export function buildInstagramLoginUrl() {
  const params = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(","),
  });

  return `${INSTAGRAM_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code) {
  const payload = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code,
  });

  const response = await axios.post(INSTAGRAM_TOKEN_URL, payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

export async function exchangeForLongLivedAccessToken(accessToken) {
  const response = await axios.get(INSTAGRAM_LONG_LIVED_TOKEN_URL, {
    params: {
      grant_type: "ig_exchange_token",
      client_secret: config.appSecret,
      access_token: accessToken,
    },
  });

  return response.data;
}

export async function refreshLongLivedAccessToken(accessToken) {
  const response = await axios.get(INSTAGRAM_REFRESH_TOKEN_URL, {
    params: {
      grant_type: "ig_refresh_token",
      access_token: accessToken,
    },
  });

  return response.data;
}

export async function fetchInstagramProfile(accessToken) {
  const response = await axios.get(INSTAGRAM_GRAPH_ME_URL, {
    params: {
      fields: "user_id,username,account_type",
      access_token: accessToken,
    },
  });

  return response.data;
}
