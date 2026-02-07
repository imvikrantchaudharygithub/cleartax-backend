export interface TeamMemberCreateRequest {
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  focusOn?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

