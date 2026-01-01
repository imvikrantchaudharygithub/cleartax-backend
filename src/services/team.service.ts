import { Team } from '../models/Team.model';
import {
  TeamMemberCreateRequest,
  TeamMemberUpdateRequest,
  TeamMemberResponse,
} from '../types/team.types';

export const getTeamMembers = async (): Promise<TeamMemberResponse[]> => {
  const members = await Team.find().sort({ createdAt: -1 }).lean();
  return members as unknown as TeamMemberResponse[];
};

export const getTeamMemberById = async (id: string): Promise<TeamMemberResponse> => {
  const member = await Team.findOne({ id }).lean();

  if (!member) {
    throw new Error('Team member not found');
  }

  return member as unknown as TeamMemberResponse;
};

export const createTeamMember = async (data: TeamMemberCreateRequest): Promise<TeamMemberResponse> => {
  // Check if id already exists
  const existing = await Team.findOne({ id: data.id });

  if (existing) {
    throw new Error('A team member with this ID already exists');
  }

  const member = await Team.create(data);
  return member.toObject() as unknown as TeamMemberResponse;
};

export const updateTeamMember = async (
  id: string,
  data: TeamMemberUpdateRequest
): Promise<TeamMemberResponse> => {
  const member = await Team.findOneAndUpdate({ id }, data, { new: true }).lean();

  if (!member) {
    throw new Error('Team member not found');
  }

  return member as unknown as TeamMemberResponse;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  const member = await Team.findOneAndDelete({ id });

  if (!member) {
    throw new Error('Team member not found');
  }
};

