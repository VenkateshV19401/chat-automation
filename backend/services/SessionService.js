import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { UserRepository } from "../repositories/UserRepository.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function createAccessToken(user) {
  return jwt.sign({ userId: user.id }, config.jwtSecret, {
    expiresIn: config.appAccessTokenExpiresIn,
  });
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    path: "/",
    maxAge: config.refreshTokenTtlDays * ONE_DAY_MS,
  };
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");
        if (separatorIndex === -1) return [entry, ""];
        return [entry.slice(0, separatorIndex), decodeURIComponent(entry.slice(separatorIndex + 1))];
      })
  );
}

function buildRefreshSessionUpdate(refreshToken) {
  return {
    refreshTokenHash: hashToken(refreshToken),
    refreshTokenExpiresAt: new Date(Date.now() + config.refreshTokenTtlDays * ONE_DAY_MS).toISOString(),
  };
}

async function clearStoredSession(userId) {
  return UserRepository.updateUser(userId, {
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
  });
}

export const SessionService = {
  async issueSession(user, res) {
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();
    const updatedUser = await UserRepository.updateUser(user.id, buildRefreshSessionUpdate(refreshToken)) || user;

    res.cookie(config.refreshCookieName, refreshToken, getCookieOptions());
    return { accessToken, user: updatedUser };
  },

  async refreshAccessToken(req, res) {
    const refreshToken = parseCookies(req.headers.cookie || "")[config.refreshCookieName];
    if (!refreshToken) {
      const error = new Error("Missing refresh token");
      error.status = 401;
      throw error;
    }

    const user = await UserRepository.findUserByRefreshTokenHash(hashToken(refreshToken));
    if (!user) {
      const error = new Error("Invalid refresh token");
      error.status = 401;
      throw error;
    }

    const expiresAt = user.refreshTokenExpiresAt ? new Date(user.refreshTokenExpiresAt).getTime() : 0;
    if (!expiresAt || expiresAt <= Date.now()) {
      await clearStoredSession(user.id);
      res.clearCookie(config.refreshCookieName, getCookieOptions());
      const error = new Error("Refresh token expired");
      error.status = 401;
      throw error;
    }

    return this.issueSession(user, res);
  },

  async clearSession(req, res) {
    const refreshToken = parseCookies(req.headers.cookie || "")[config.refreshCookieName];
    if (refreshToken) {
      const user = await UserRepository.findUserByRefreshTokenHash(hashToken(refreshToken));
      if (user) {
        await clearStoredSession(user.id);
      }
    }

    res.clearCookie(config.refreshCookieName, getCookieOptions());
  },
};
