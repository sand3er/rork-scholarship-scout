import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Heart, MapPin, Calendar, DollarSign, GraduationCap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Scholarship } from '@/types/scholarship';
import { BORDER_RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants/theme';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
  matchPercentage?: number;
  testID?: string;
}

const ScholarshipCard = memo<ScholarshipCardProps>(({
  scholarship,
  onPress,
  onFavoritePress,
  isFavorite,
  matchPercentage,
  testID,
}) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getMatchColor = () => {
    if (!matchPercentage) return colors.textSecondary;
    if (matchPercentage >= 80) return colors.success;
    if (matchPercentage >= 60) return colors.primary;
    return colors.warning;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={testID}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.sm]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {matchPercentage !== undefined && (
                <View style={[styles.matchBadge, { backgroundColor: getMatchColor() }]}>
                  <Text style={styles.matchText}>
                    {matchPercentage}% Match
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={onFavoritePress}
              style={styles.favoriteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart
                size={22}
                color={isFavorite ? '#FF3B30' : colors.textSecondary}
                fill={isFavorite ? '#FF3B30' : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {scholarship.title}
          </Text>

          <View style={styles.detailsContainer}>
            <View style={[styles.amountBadge, { backgroundColor: '#10B981' }]}>
              <DollarSign size={14} color="#FFFFFF" />
              <Text style={styles.amountText} numberOfLines={1}>
                {scholarship.amount}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {scholarship.country}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.tagsContainer}>
              {scholarship.studyLevel.slice(0, 2).map((level, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <GraduationCap size={12} color={colors.textSecondary} />
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                    {level}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

ScholarshipCard.displayName = 'ScholarshipCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  matchBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700' as const,
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZES.xl * 1.3,
  },
  detailsContainer: {
    marginBottom: SPACING.md,
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  amountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500' as const,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500' as const,
  },
});

export default ScholarshipCard;
