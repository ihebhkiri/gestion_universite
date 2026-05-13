export interface StudentProfile {
  matricule: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  cin?: string | null;
  academicClassCode?: string | null;
  program?: string | null;
  status?: string | null;
  avatarUrl?: string | null;
}
