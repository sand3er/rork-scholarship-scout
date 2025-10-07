import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import ScholarshipCard from '@/components/ScholarshipCard';
import { ScholarshipMatch } from '@/types/scholarship';
import { FONT_SIZES, SPACING } from '@/constants/theme';

export default function AIMatchScreen() {
  const { colors } = useTheme();
  const { getRecommendedScholarships, toggleFavorite, isFavorite, profile } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderMatch = useCallback(({ item }: { item: ScholarshipMatch }) => (
    <View style={styles.matchContainer}>
      <ScholarshipCard
        scholarship={item.scholarship}
        onPress={() => router.push(`/scholarship/${item.scholarship.id}` as any)}
        onFavoritePress={() => toggleFavorite(item.scholarship)}
        isFavorite={isFavorite(item.scholarship.id)}
        matchPercentage={item.matchPercentage}
        testID={`match-card-${item.scholarship.id}`}
      />
      {item.matchReasons.length > 0 && (
        <View style={[styles.reasonsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.reasonsTitle, { color: colors.text }]}>
            Why this matches:
          </Text>
          {item.matchReasons.map((reason, index) => (
            <Text key={index} style={[styles.reasonText, { color: colors.textSecondary }]}>
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </View>
  ), [router, toggleFavorite, isFavorite, colors]);

  if (!profile.completedOnboarding) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Sparkles size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Complete your profile first
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            We need your information to find the best matches
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          AI Recommendations
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Personalized matches based on your profile
        </Text>
      </View>

      <FlatList
        data={getRecommendedScholarships}
        renderItem={renderMatch}
        keyExtractor={(item) => item.scholarship.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Sparkles size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No matches found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Update your profile to get better recommendations
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700' as const,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  matchContainer: {
    marginBottom: SPACING.md,
  },
  reasonsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: -SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  reasonsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600' as const,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});
