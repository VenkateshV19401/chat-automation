import { AutomationService } from "../services/AutomationService.js";

export async function getAutomations(req, res) {
  res.json(await AutomationService.getAutomations(req.user.id));
}

export async function getAutomationForMedia(req, res) {
  const automation = await AutomationService.getAutomationForMedia(req.user.id, req.params.mediaId);
  if (!automation) return res.status(404).json({ error: "Automation not found" });
  res.json(automation);
}

export async function createAutomation(req, res) {
  try {
    const automation = await AutomationService.createAutomation(req.user.id, req.body);
    res.status(201).json(automation);
  } catch (error) {
    if (error.code === "PLAN_LIMIT_REACHED") {
      return res.status(403).json({ error: error.message, code: "PLAN_LIMIT_REACHED" });
    }
    if (error.code === "AUTOMATION_EXISTS") {
      return res.status(409).json({ error: error.message, automation: error.automation });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function updateAutomation(req, res) {
  const automation = await AutomationService.updateAutomation(req.user.id, req.params.id, req.body);
  if (!automation) return res.status(404).json({ error: "Automation not found" });
  res.json(automation);
}

export async function toggleAutomation(req, res) {
  const automation = await AutomationService.toggleAutomation(req.user.id, req.params.id);
  if (!automation) return res.status(404).json({ error: "Automation not found" });
  res.json(automation);
}

export async function deleteAutomation(req, res) {
  const automation = await AutomationService.deleteAutomation(req.user.id, req.params.id);
  if (!automation) return res.status(404).json({ error: "Automation not found" });
  res.json({ success: true, automation });
}
