import { UserRepository } from "../repositories/UserRepository.js";
import { InstagramService } from "../services/InstagramService.js";

export async function getMe(req, res) {
  const user = UserRepository.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    id: user.id,
    username: user.username,
    accountType: user.accountType,
    instagramUserId: user.instagramUserId,
    permissions: user.permissions,
    connectedAt: user.connectedAt,
  });
}

export async function getMedia(req, res) {
  const user = UserRepository.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const media = await InstagramService.getAccountMedia(user);
    return res.json(media);
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({
        error: "Instagram session expired. Please log in again.",
        code: error.code || "INSTAGRAM_AUTH_EXPIRED",
        details: error.details || null,
      });
    }

    console.error("[users] Media load failed:", error.details || error.message);
    return res.status(500).json({ error: "Failed to load Instagram media" });
  }
}
