export type StudyLevel = 'High School' | 'Undergraduate' | 'Graduate' | 'Postgraduate' | 'PhD';

export type ApplicationStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected';

export interface UserProfile {
  name: string;
  nationality: string;
  studyLevel: StudyLevel;
  major: string;
  gpa: string;
  preferredCountries: string[];
  deadlinePreference: string;
  profilePicture?: string;
  completedOnboarding: boolean;
}

export interface Scholarship {
  id: string;
  title: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  country: string;
  description: string;
  source: string;
  applyUrl: string;
  major: string[];
  studyLevel: StudyLevel[];
  nationality: string[];
  minGPA?: number;
}

export interface TrackedScholarship {
  scholarship: Scholarship;
  status: ApplicationStatus;
  isFavorite: boolean;
  notes: string;
  reminderDate?: string;
  appliedDate?: string;
}

export interface ScholarshipMatch {
  scholarship: Scholarship;
  matchPercentage: number;
  matchReasons: string[];
}
