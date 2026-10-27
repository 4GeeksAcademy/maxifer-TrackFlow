export type CandidateStatus = "received" | "in_progress" | "selected" | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export type CandidateRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
};

export type CandidateRecordUpsertPayload = Pick<
  CandidateRecord,
  | "full_name"
  | "email"
  | "phone"
  | "position"
  | "cv_url"
  | "status"
  | "stage"
  | "experience_years"
> & {
  linkedin_url: string | null;
};

export type CandidateNote = {
  id: string;
  content: string;
  created_at: string;
};

export type CandidateRecordsResponse = {
  total: number;
  page: number;
  limit: number;
  data: CandidateRecord[];
};

export type CandidateNotesResponse = {
  data: unknown[];
};
