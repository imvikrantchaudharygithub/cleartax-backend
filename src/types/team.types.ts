export interface TeamMemberCreateRequest {
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  focusOn?: string;
  displayOrder?: number;
}

export interface TeamMemberUpdateRequest extends Partial<TeamMemberCreateRequest> {}

export interface TeamMemberResponse {
  _id: string;
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  focusOn?: string;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

