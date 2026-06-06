import { coreTeamService } from '../services/coreTeamService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const adminListCoreTeamMembers = wrapAsync(async (req, res) => {
  const members = await coreTeamService.listMembers();
  return res.json({ members });
});

export const adminAddCoreTeamMember = wrapAsync(async (req, res) => {
  const saved = await coreTeamService.addMember(req.body || {});
  const adminEmail = req.adminSession?.username || 'admin';
  req.app?.emit?.('CORE_TEAM_MEMBER_ADDED', { adminEmail, member: saved, timestamp: new Date().toISOString() });
  return res.status(201).json(saved);
});

export const adminDeleteCoreTeamMember = wrapAsync(async (req, res) => {
  const id = String(req.params.id || '').trim();
  const deleted = await coreTeamService.deleteMember(id);
  if (!deleted) throw new NotFoundError('Member not found');
  return res.json({ ok: true });
});
