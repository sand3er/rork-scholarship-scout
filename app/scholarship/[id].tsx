import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Animated } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MapPin, Calendar, DollarSign, GraduationCap, Globe, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { MOCK_SCHOLARSHIPS } from '@/mocks/scholarships';
import Button from '@/components/Button';
import { BORDER_RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants/theme';

export default function ScholarshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { toggleFavorite, isFavorite } = useApp();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const scholarship = useMemo(() => {
    return MOCK_SCHOLARSHIPS.find(s => s.id === id);
  }, [id]);

  if (!scholarship) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Scholarship not found
        </Text>
      </View>
    );
  }

  const handleApply = async () => {
    try {
      await Linking.openURL(scholarship.applyUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleFavorite(scholarship);
  };

  const favorite = isFavorite(scholarship.id);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity onPress={handleFavoritePress} style={styles.headerButton}>
                <Heart
                  size={24}
                  color={favorite ? colors.error : colors.text}
                  fill={favorite ? colors.error : 'transparent'}
                />
              </TouchableOpacity>
            </Animated.View>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradient1, colors.gradient2, colors.gradient3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle} numberOfLines={3}>
            {scholarship.title}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.md]}>
            <View style={styles.infoRow}>
              <DollarSign size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Amount
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {scholarship.amount}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={24} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Deadline
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={24} color={colors.secondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Country
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {scholarship.country}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Globe size={24} color={colors.info} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Source
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {scholarship.source}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
              {scholarship.description}
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Eligibility
            </Text>
            {scholarship.eligibility.map((item, index) => (
              <View key={index} style={styles.eligibilityItem}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={[styles.eligibilityText, { color: colors.textSecondary }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Study Levels
            </Text>
            <View style={styles.tagsContainer}>
              {scholarship.studyLevel.map((level, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: `${colors.primary}15` }]}
                >
                  <GraduationCap size={16} color={colors.primary} />
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {level}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Eligible Majors
            </Text>
            <View style={styles.tagsContainer}>
              {scholarship.major.slice(0, 6).map((major, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: `${colors.secondary}15` }]}
                >
                  <Text style={[styles.tagText, { color: colors.secondary }]}>
                    {major}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.applyButtonContainer}>
            <Button
              title="Apply Now"
              onPress={handleApply}
              size="lg"
              style={styles.applyButton}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  bannerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: FONT_SIZES.xxxl * 1.3,
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
  },
  section: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700' as const,
    marginBottom: SPACING.md,
  },
  sectionText: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.6,
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  eligibilityText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500' as const,
  },
  applyButtonContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  applyButton: {
    width: '100%',
  },
  headerButton: {
    marginRight: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
});
