import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { MOCK_SCHOLARSHIPS, COUNTRIES, MAJORS } from '@/mocks/scholarships';
import ScholarshipCard from '@/components/ScholarshipCard';
import { Scholarship } from '@/types/scholarship';
import { BORDER_RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants/theme';

const DEBOUNCE_DELAY = 300;

interface Suggestion {
  type: 'scholarship' | 'country' | 'major';
  value: string;
  label: string;
}

const SuggestionItem = memo<{ suggestion: Suggestion; onPress: () => void }>(
  ({ suggestion, onPress }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity onPress={onPress} style={[styles.suggestionItem, { backgroundColor: colors.surface }]}>
        <Search size={16} color={colors.textSecondary} />
        <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
          {suggestion.label}
        </Text>
        <Text style={[styles.suggestionType, { color: colors.textSecondary }]}>
          {suggestion.type}
        </Text>
      </TouchableOpacity>
    );
  }
);

SuggestionItem.displayName = 'SuggestionItem';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { toggleFavorite, isFavorite } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    country?: string;
    major?: string;
  }>({});

  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, DEBOUNCE_DELAY);
  }, []);

  const suggestions = useMemo((): Suggestion[] => {
    if (debouncedQuery.length < 2) return [];

    const query = debouncedQuery.toLowerCase();
    const results: Suggestion[] = [];

    MOCK_SCHOLARSHIPS.forEach(scholarship => {
      if (scholarship.title.toLowerCase().includes(query)) {
        results.push({
          type: 'scholarship',
          value: scholarship.id,
          label: scholarship.title,
        });
      }
    });

    COUNTRIES.forEach(country => {
      if (country.toLowerCase().includes(query)) {
        results.push({
          type: 'country',
          value: country,
          label: country,
        });
      }
    });

    MAJORS.forEach(major => {
      if (major.toLowerCase().includes(query)) {
        results.push({
          type: 'major',
          value: major,
          label: major,
        });
      }
    });

    return results.slice(0, 8);
  }, [debouncedQuery]);

  const filteredScholarships = useMemo(() => {
    let results = MOCK_SCHOLARSHIPS;

    if (selectedFilters.country) {
      results = results.filter(s =>
        s.country.toLowerCase().includes(selectedFilters.country!.toLowerCase())
      );
    }

    if (selectedFilters.major) {
      results = results.filter(s =>
        s.major.some(m => m.toLowerCase().includes(selectedFilters.major!.toLowerCase()))
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.country.toLowerCase().includes(query) ||
        s.major.some(m => m.toLowerCase().includes(query)) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return results;
  }, [searchQuery, selectedFilters]);

  const handleSuggestionPress = useCallback((suggestion: Suggestion) => {
    if (suggestion.type === 'scholarship') {
      router.push(`/scholarship/${suggestion.value}` as any);
    } else if (suggestion.type === 'country') {
      setSelectedFilters(prev => ({ ...prev, country: suggestion.value }));
      setSearchQuery('');
      setShowSuggestions(false);
    } else if (suggestion.type === 'major') {
      setSelectedFilters(prev => ({ ...prev, major: suggestion.value }));
      setSearchQuery('');
      setShowSuggestions(false);
    }
  }, [router]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setShowSuggestions(false);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  const renderScholarship = useCallback(({ item }: { item: Scholarship }) => (
    <ScholarshipCard
      scholarship={item}
      onPress={() => router.push(`/scholarship/${item.id}` as any)}
      onFavoritePress={() => toggleFavorite(item)}
      isFavorite={isFavorite(item.id)}
      testID={`scholarship-card-${item.id}`}
    />
  ), [router, toggleFavorite, isFavorite]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Discover Scholarships
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find your perfect opportunity
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.sm]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search scholarships, countries, majors..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.lg]}>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                suggestion={suggestion}
                onPress={() => handleSuggestionPress(suggestion)}
              />
            ))}
          </View>
        )}
      </View>

      {(selectedFilters.country || selectedFilters.major) && (
        <View style={styles.filtersRow}>
          {selectedFilters.country && (
            <View style={[styles.filterChip, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                {selectedFilters.country}
              </Text>
              <TouchableOpacity onPress={() => setSelectedFilters(prev => ({ ...prev, country: undefined }))}>
                <X size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          {selectedFilters.major && (
            <View style={[styles.filterChip, { backgroundColor: `${colors.secondary}15` }]}>
              <Text style={[styles.filterChipText, { color: colors.secondary }]}>
                {selectedFilters.major}
              </Text>
              <TouchableOpacity onPress={() => setSelectedFilters(prev => ({ ...prev, major: undefined }))}>
                <X size={16} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={[styles.clearFiltersText, { color: colors.textSecondary }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredScholarships}
        renderItem={renderScholarship}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No scholarships found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Try adjusting your search or filters
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
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    position: 'relative',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    paddingVertical: SPACING.sm,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    maxHeight: 300,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  suggestionType: {
    fontSize: FONT_SIZES.xs,
    textTransform: 'capitalize',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500' as const,
  },
  clearFiltersButton: {
    paddingHorizontal: SPACING.sm,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
  },
});
