import axios from "axios";
import { config } from "../config/config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { refreshLongLivedAccessToken } from "./instagramAuthService.js";

const INSTAGRAM_GRAPH_BASE = "https://graph.instagram.com/v23.0";
const INSTAGRAM_COMMENT_REPLY_ENDPOINT = (commentId) => `${INSTAGRAM_GRAPH_BASE}/${commentId}/replies`;

const maskToken = (token = "") => {
  if (!token) return "missing";
  if (token.length <= 10) return `${token.slice(0, 3)}...${token.slice(-2)}`;
  return `${token.slice(0, 6)}...${token.slice(-6)}`;
};

async function getMediaListViaInstagramGraph(user) {
  const response = await axios.get(`${INSTAGRAM_GRAPH_BASE}/me/media`, {
    params: {
      access_token: user.accessToken,
      fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    },
  });

  return response.data.data || [];
}

async function getMediaDetailsViaInstagramGraph(mediaId, accessToken) {
  const response = await axios.get(`${INSTAGRAM_GRAPH_BASE}/${mediaId}`, {
    params: {
      access_token: accessToken,
      fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    },
  });

  return response.data;
}

function shouldRefreshToken(user) {
  if (!user?.tokenExpiresAt) return false;
  const expiresAtMs = new Date(user.tokenExpiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return false;
  return expiresAtMs - Date.now() <= config.tokenRefreshLeadSeconds * 1000;
}

async function getUsableAccessToken(user) {
  if (!user?.accessToken) {
    throw new Error("Missing Instagram access token");
  }

  if (!shouldRefreshToken(user)) {
    return { accessToken: user.accessToken, user };
  }

  try {
    const refreshed = await refreshLongLivedAccessToken(user.accessToken);
    const updatedUser = UserRepository.updateUser(user.id, {
      accessToken: refreshed.access_token || user.accessToken,
      tokenType: refreshed.token_type || user.tokenType || "bearer",
      tokenExpiresIn: refreshed.expires_in || user.tokenExpiresIn || null,
      tokenExpiresAt: refreshed.expires_in
        ? new Date(Date.now() + Number(refreshed.expires_in) * 1000).toISOString()
        : user.tokenExpiresAt || null,
    });

    console.log("[instagram] Refreshed long-lived token:", {
      username: user.username,
      tokenFingerprint: maskToken(updatedUser?.accessToken || user.accessToken),
      expiresAt: updatedUser?.tokenExpiresAt || user.tokenExpiresAt || null,
    });

    return {
      accessToken: updatedUser?.accessToken || user.accessToken,
      user: updatedUser || user,
    };
  } catch (error) {
    console.error("[instagram] Token refresh failed:", error.response?.data || error.message);
    return { accessToken: user.accessToken, user };
  }
}

function toAuthError(error, fallbackMessage) {
  const authError = new Error(fallbackMessage);
  authError.status = 401;
  authError.code = "INSTAGRAM_AUTH_EXPIRED";
  authError.details = error?.response?.data || error?.message || fallbackMessage;
  return authError;
}

export const InstagramService = {
  async getAccountMedia(user) {
    try {
      const { accessToken } = await getUsableAccessToken(user);
      const media = await getMediaListViaInstagramGraph({ ...user, accessToken });
      const hydratedMedia = await Promise.all(
        media.map(async (item) => {
          try {
            return await getMediaDetailsViaInstagramGraph(item.id, accessToken);
          } catch (_error) {
            return item;
          }
        })
      );

      console.log("[instagram] Loaded media via Instagram Graph:", {
        username: user.username,
        count: hydratedMedia.length,
        tokenFingerprint: maskToken(user.accessToken),
      });

      return hydratedMedia;
    } catch (instagramError) {
      const details = instagramError.response?.data || instagramError.message;
      console.error("[instagram] Account media fetch failed:", details);

      if (instagramError.response?.status === 400 || instagramError.response?.status === 401) {
        throw toAuthError(instagramError, "Instagram access token expired");
      }

      throw instagramError;
    }
  },

  async replyToComment(commentId, message, user) {
    const endpoint = INSTAGRAM_COMMENT_REPLY_ENDPOINT(commentId);
    const { accessToken } = await getUsableAccessToken(user);
    const replyAttempts = [
      {
        label: "bearer-form-body",
        run: () =>
          axios.post(endpoint, new URLSearchParams({ message }), {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }),
      },
      {
        label: "query-access-token",
        run: () =>
          axios.post(
            endpoint,
            {},
            {
              params: {
                message,
                access_token: accessToken,
              },
            }
          ),
      },
    ];

    try {
      for (const attempt of replyAttempts) {
        try {
          console.log("[instagram] Comment reply request:", {
            endpoint,
            commentId,
            strategy: attempt.label,
            tokenFingerprint: maskToken(accessToken),
          });

          await attempt.run();
          console.log(`[instagram] Comment reply success for ${commentId} using ${attempt.label}`);
          return true;
        } catch (error) {
          console.error("[instagram] Comment reply attempt failed:", {
            strategy: attempt.label,
            details: error.response?.data || error.message,
          });
        }
      }

      console.error(`[instagram] Comment reply failed for ${commentId} after all strategies`);
      return false;
    } catch (error) {
      console.error("[instagram] Comment reply failed:", error.response?.data || error.message);
      return false;
    }
  },

  async subscribeToWebhook(accessToken) {
    try {
      // Check if already subscribed
      const checkResponse = await axios.get(`${INSTAGRAM_GRAPH_BASE}/me/subscribed_apps`, {
        params: { access_token: accessToken },
      });
      const subscribedFields = checkResponse.data?.data?.[0]?.subscribed_fields || [];
      if (subscribedFields.includes("comments")) {
        console.log("[instagram] Webhook already subscribed for comments, skipping");
        return { success: true, alreadySubscribed: true };
      }

      // Not subscribed, subscribe now
      const response = await axios.post(`${INSTAGRAM_GRAPH_BASE}/me/subscribed_apps`, null, {
        params: {
          subscribed_fields: "comments",
          access_token: accessToken,
        },
      });
      console.log("[instagram] Webhook subscription success:", response.data);
      return response.data;
    } catch (error) {
      console.error("[instagram] Webhook subscription failed:", error.response?.data || error.message);
    }
  },

  async sendPrivateReply(commentId, message, user) {
    const { accessToken, user: refreshedUser } = await getUsableAccessToken(user);
    const endpoint = `${INSTAGRAM_GRAPH_BASE}/${refreshedUser.instagramUserId}/messages`;

    try {
      console.log("[instagram] Private reply request:", {
        endpoint,
        instagramUserId: refreshedUser.instagramUserId,
        commentId,
        tokenFingerprint: maskToken(accessToken),
      });

      await axios.post(
        endpoint,
        {
          recipient: { comment_id: commentId },
          message: { text: message },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`[instagram] Private reply success for ${commentId}`);
      return true;
    } catch (error) {
      console.error("[instagram] Private reply failed:", error.response?.data || error.message);
      return false;
    }
  },
};
