export interface CoreTeamMember {
  id: string | number;
  name: string;
  role: string;
  photo: string;
  branch: string;
  section: string | number;
  year?: string | number;
  achievements?: string[];
  testimonials?: Array<{ text: string; author: string }>;
  linkedin?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  email?: string | null;
}
