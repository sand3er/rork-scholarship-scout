import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { StudyLevel } from '@/types/scholarship';
import { COUNTRIES, MAJORS, NATIONALITIES } from '@/mocks/scholarships';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/constants/theme';

const STUDY_LEVELS: StudyLevel[] = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'PhD'];
const DEADLINE_OPTIONS = ['1-3 months', '3-6 months', '6-12 months', '12+ months'];

interface StepData {
  name: string;
  nationality: string;
  studyLevel: StudyLevel;
  major: string;
  gpa: string;
  preferredCountries: string[];
  deadlinePreference: string;
}

const SelectableChip = memo<{ label: string; selected: boolean; onPress: () => void }>(
  ({ label, selected, onPress }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.primary : colors.surface,
            borderColor: selected ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected ? '#FFFFFF' : colors.text },
          ]}
        >
          {label}
        </Text>
        {selected && <Check size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />}
      </TouchableOpacity>
    );
  }
);

SelectableChip.displayName = 'SelectableChip';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { completeOnboarding } = useApp();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<StepData>({
    name: '',
    nationality: '',
    studyLevel: 'Undergraduate',
    major: '',
    gpa: '',
    preferredCountries: [],
    deadlinePreference: '',
  });

  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / 7,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim]);

  const updateData = useCallback((updates: Partial<StepData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding({
        ...data,
        profilePicture: undefined,
      });
      router.replace('/(tabs)');
    }
  }, [currentStep, data, completeOnboarding, router]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const toggleCountry = useCallback((country: string) => {
    setData(prev => ({
      ...prev,
      preferredCountries: prev.preferredCountries.includes(country)
        ? prev.preferredCountries.filter(c => c !== country)
        : [...prev.preferredCountries, country],
    }));
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return data.name.trim().length > 0;
      case 1: return data.nationality.trim().length > 0;
      case 2: return true;
      case 3: return data.major.trim().length > 0;
      case 4: {
        if (data.gpa.trim().length === 0) return false;
        const gpaNum = parseFloat(data.gpa);
        return !isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4.0;
      }
      case 5: return data.preferredCountries.length > 0;
      case 6: return data.deadlinePreference.length > 0;
      default: return false;
    }
  }, [currentStep, data]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              What&apos;s your name?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Let&apos;s personalize your experience
            </Text>
            <Input
              label="Full Name"
              value={data.name}
              onChangeText={(text) => updateData({ name: text })}
              placeholder="Enter your full name"
              autoFocus
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              What&apos;s your nationality?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              This helps us find scholarships available to you
            </Text>
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {NATIONALITIES.map((nationality) => (
                <TouchableOpacity
                  key={nationality}
                  onPress={() => updateData({ nationality })}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: data.nationality === nationality ? `${colors.primary}15` : colors.surface,
                      borderColor: data.nationality === nationality ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    {nationality}
                  </Text>
                  {data.nationality === nationality && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              What&apos;s your study level?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Select your current or intended level of study
            </Text>
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {STUDY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateData({ studyLevel: level })}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: data.studyLevel === level ? `${colors.primary}15` : colors.surface,
                      borderColor: data.studyLevel === level ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    {level}
                  </Text>
                  {data.studyLevel === level && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              What&apos;s your major?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Your field of study or intended major
            </Text>
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {MAJORS.map((major) => (
                <TouchableOpacity
                  key={major}
                  onPress={() => updateData({ major })}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: data.major === major ? `${colors.primary}15` : colors.surface,
                      borderColor: data.major === major ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.listItemText, { color: colors.text }]}>
                    {major}
                  </Text>
                  {data.major === major && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              What&apos;s your GPA?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Enter your current GPA (on a 4.0 scale)
            </Text>
            <Input
              label="GPA"
              value={data.gpa}
              onChangeText={(text) => updateData({ gpa: text })}
              placeholder="e.g., 3.5"
              keyboardType="decimal-pad"
              autoFocus
            />
            {data.gpa.trim().length > 0 && (parseFloat(data.gpa) > 4.0 || parseFloat(data.gpa) < 0 || isNaN(parseFloat(data.gpa))) && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Please enter a valid GPA between 0.0 and 4.0
              </Text>
            )}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Preferred study countries?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Select one or more countries (you can change this later)
            </Text>
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.chipsContainer}>
                {COUNTRIES.map((country) => (
                  <SelectableChip
                    key={country}
                    label={country}
                    selected={data.preferredCountries.includes(country)}
                    onPress={() => toggleCountry(country)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Application timeline?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              When are you planning to apply?
            </Text>
            <View style={styles.chipsContainer}>
              {DEADLINE_OPTIONS.map((option) => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={data.deadlinePreference === option}
                  onPress={() => updateData({ deadlinePreference: option })}
                />
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradient1, colors.gradient2, colors.gradient3]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: `${colors.background}30` }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.background,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.background }]}>
              {currentStep + 1} / 7
            </Text>
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {renderStep()}
        </View>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.backButton, { backgroundColor: colors.surface }]}
              >
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1, marginLeft: currentStep > 0 ? SPACING.md : 0 }}>
              <Button
                title={currentStep === 6 ? 'Get Started' : 'Continue'}
                onPress={handleNext}
                disabled={!canProceed()}
                size="lg"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
    minWidth: 40,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  scrollContent: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500' as const,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    marginBottom: SPACING.sm,
  },
  listItemText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
});
