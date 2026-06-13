import { coreTeamService } from '../services/coreTeamService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';
import { sendList, sendCreated, sendDeleted } from '../utils/responseHelper.js';

export const adminListCoreTeamMembers = wrapAsync(async (req, res) => {
  const members = await coreTeamService.listMembers();
  return sendList(res, members, 'members');
});

export const adminAddCoreTeamMember = wrapAsync(async (req, res) => {
  const saved = await coreTeamService.addMember(req.body || {});
  const adminEmail = req.adminSession?.username || 'admin';
  req.app?.emit?.('CORE_TEAM_MEMBER_ADDED', { adminEmail, member: saved, timestamp: new Date().toISOString() });
  return sendCreated(res, saved, 'member', true);
});

export const adminDeleteCoreTeamMember = wrapAsync(async (req, res) => {
  const id = String(req.params.id || '').trim();
  const deleted = await coreTeamService.deleteMember(id);
  if (!deleted) throw new NotFoundError('Member not found');
  return sendDeleted(res);
});
