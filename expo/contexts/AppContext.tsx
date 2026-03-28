import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, TrackedScholarship, Scholarship, ScholarshipMatch } from '@/types/scholarship';
import { MOCK_SCHOLARSHIPS } from '@/mocks/scholarships';

const PROFILE_STORAGE_KEY = '@scholarship_scout_profile';
const TRACKED_STORAGE_KEY = '@scholarship_scout_tracked';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  nationality: '',
  studyLevel: 'Undergraduate',
  major: '',
  gpa: '',
  preferredCountries: [],
  deadlinePreference: '',
  completedOnboarding: false,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [trackedScholarships, setTrackedScholarships] = useState<TrackedScholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, trackedData] = await Promise.all([
        AsyncStorage.getItem(PROFILE_STORAGE_KEY),
        AsyncStorage.getItem(TRACKED_STORAGE_KEY),
      ]);

      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
      if (trackedData) {
        setTrackedScholarships(JSON.parse(trackedData));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, [profile]);

  const completeOnboarding = useCallback(async (profileData: Omit<UserProfile, 'completedOnboarding'>) => {
    const newProfile = { ...profileData, completedOnboarding: true };
    setProfile(newProfile);
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, []);

  const toggleFavorite = useCallback(async (scholarship: Scholarship) => {
    const existing = trackedScholarships.find(t => t.scholarship.id === scholarship.id);
    let newTracked: TrackedScholarship[];

    if (existing) {
      newTracked = trackedScholarships.map(t =>
        t.scholarship.id === scholarship.id
          ? { ...t, isFavorite: !t.isFavorite }
          : t
      );
    } else {
      newTracked = [
        ...trackedScholarships,
        {
          scholarship,
          status: 'Not Started',
          isFavorite: true,
          notes: '',
        },
      ];
    }

    setTrackedScholarships(newTracked);
    try {
      await AsyncStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(newTracked));
    } catch (error) {
      console.error('Failed to save tracked scholarships:', error);
    }
  }, [trackedScholarships]);

  const updateTrackedScholarship = useCallback(async (
    scholarshipId: string,
    updates: Partial<Omit<TrackedScholarship, 'scholarship'>>
  ) => {
    const newTracked = trackedScholarships.map(t =>
      t.scholarship.id === scholarshipId ? { ...t, ...updates } : t
    );
    setTrackedScholarships(newTracked);
    try {
      await AsyncStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(newTracked));
    } catch (error) {
      console.error('Failed to update tracked scholarship:', error);
    }
  }, [trackedScholarships]);

  const isFavorite = useCallback((scholarshipId: string) => {
    const tracked = trackedScholarships.find(t => t.scholarship.id === scholarshipId);
    return tracked?.isFavorite || false;
  }, [trackedScholarships]);

  const getTrackedScholarship = useCallback((scholarshipId: string) => {
    return trackedScholarships.find(t => t.scholarship.id === scholarshipId);
  }, [trackedScholarships]);

  const calculateMatch = useCallback((scholarship: Scholarship): ScholarshipMatch | null => {
    if (!profile.completedOnboarding) {
      return null;
    }

    const reasons: string[] = [];

    const studyLevelMatch = scholarship.studyLevel.includes(profile.studyLevel);
    if (!studyLevelMatch) {
      return null;
    }
    reasons.push(`Matches your study level: ${profile.studyLevel}`);

    const majorMatch = scholarship.major.some(m => 
      m.toLowerCase().includes(profile.major.toLowerCase()) || 
      profile.major.toLowerCase().includes(m.toLowerCase()) ||
      m === 'All Majors'
    );
    if (!majorMatch) {
      return null;
    }
    reasons.push(`Matches your major: ${profile.major}`);

    const countryMatch = profile.preferredCountries.length === 0 || profile.preferredCountries.some(c => 
      scholarship.country.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(scholarship.country.toLowerCase())
    );
    if (!countryMatch) {
      return null;
    }
    if (profile.preferredCountries.length > 0) {
      reasons.push(`Available in your preferred country: ${scholarship.country}`);
    }

    const nationalityMatch = scholarship.nationality.includes('All Countries') ||
      scholarship.nationality.some(n => 
        n.toLowerCase().includes(profile.nationality.toLowerCase()) ||
        profile.nationality.toLowerCase().includes(n.toLowerCase())
      );
    if (!nationalityMatch) {
      return null;
    }
    reasons.push('Open to your nationality');

    if (profile.gpa && scholarship.minGPA) {
      const gpaNum = parseFloat(profile.gpa);
      if (isNaN(gpaNum) || gpaNum < scholarship.minGPA) {
        return null;
      }
      reasons.push(`Your GPA meets the requirement (${scholarship.minGPA}+)`);
    } else if (!scholarship.minGPA && profile.gpa) {
      reasons.push('No GPA requirement');
    }

    return {
      scholarship,
      matchPercentage: 100,
      matchReasons: reasons,
    };
  }, [profile]);

  const getRecommendedScholarships = useMemo(() => {
    if (!profile.completedOnboarding) return [];

    const matches = MOCK_SCHOLARSHIPS.map(calculateMatch)
      .filter((m): m is ScholarshipMatch => m !== null);

    return matches;
  }, [profile, calculateMatch]);

  const favoriteScholarships = useMemo(() => {
    return trackedScholarships.filter(t => t.isFavorite);
  }, [trackedScholarships]);

  return useMemo(() => ({
    profile,
    updateProfile,
    completeOnboarding,
    trackedScholarships,
    toggleFavorite,
    updateTrackedScholarship,
    isFavorite,
    getTrackedScholarship,
    getRecommendedScholarships,
    favoriteScholarships,
    isLoading,
  }), [profile, updateProfile, completeOnboarding, trackedScholarships, toggleFavorite, updateTrackedScholarship, isFavorite, getTrackedScholarship, getRecommendedScholarships, favoriteScholarships, isLoading]);
});
