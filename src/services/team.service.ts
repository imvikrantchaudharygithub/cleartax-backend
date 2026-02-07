import mongoose from 'mongoose';
import { Team } from '../models/Team.model';
import {
  TeamMemberCreateRequest,
  TeamMemberUpdateRequest,
  TeamMemberResponse,
} from '../types/team.types';

const isMongoId = (s: string) => /^[a-fA-F0-9]{24}$/.test(s);

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
  const filter = isMongoId(id)
    ? { _id: new mongoose.Types.ObjectId(id) }
    : { id };
  const member = await Team.findOneAndUpdate(filter, data, { new: true }).lean();

  if (!member) {
    throw new Error('Team member not found');
  }

  return member as unknown as TeamMemberResponse;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  const filter = isMongoId(id)
    ? { _id: new mongoose.Types.ObjectId(id) }
    : { id };
  const member = await Team.findOneAndDelete(filter);
  if (!member) {
    throw new Error('Team member not found');
  }
};

