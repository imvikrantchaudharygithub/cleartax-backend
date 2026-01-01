import { Request, Response, NextFunction } from 'express';
import * as teamService from '../services/team.service';
import { uploadTeamAvatar } from '../services/fileUpload.service';

export const getTeamMembers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await teamService.getTeamMembers();
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamMemberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const member = await teamService.getTeamMemberById(id);
    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let avatarUrl = req.body.avatar;

    // Upload avatar if file is provided
    if (req.file) {
      const uploadResult = await uploadTeamAvatar(req.file);
      avatarUrl = uploadResult.secureUrl;
    }

    const member = await teamService.createTeamMember({
      ...req.body,
      avatar: avatarUrl,
    });

    res.status(201).json({
      success: true,
      data: member,
      message: 'Team member created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Upload avatar if file is provided
    if (req.file) {
      const uploadResult = await uploadTeamAvatar(req.file);
      updateData.avatar = uploadResult.secureUrl;
    }

    const member = await teamService.updateTeamMember(id, updateData);
    res.status(200).json({
      success: true,
      data: member,
      message: 'Team member updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await teamService.deleteTeamMember(id);
    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

