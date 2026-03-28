import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookmarkCheck, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import ScholarshipCard from '@/components/ScholarshipCard';
import Button from '@/components/Button';
import { TrackedScholarship, ApplicationStatus } from '@/types/scholarship';
import { BORDER_RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants/theme';

const STATUS_OPTIONS: ApplicationStatus[] = ['Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected'];

const StatusBadge = memo<{ status: ApplicationStatus }>(({ status }) => {
  const { colors } = useTheme();
  const statusColors = {
    'Not Started': colors.textSecondary,
    'In Progress': colors.warning,
    'Submitted': colors.info,
    'Accepted': colors.success,
    'Rejected': colors.error,
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${statusColors[status]}20` }]}>
      <Text style={[styles.statusText, { color: statusColors[status] }]}>
        {status}
      </Text>
    </View>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default function TrackerScreen() {
  const { colors } = useTheme();
  const { favoriteScholarships, toggleFavorite, isFavorite, updateTrackedScholarship } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedScholarship, setSelectedScholarship] = useState<TrackedScholarship | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState('');

  const handleStatusChange = useCallback((scholarshipId: string, status: ApplicationStatus) => {
    updateTrackedScholarship(scholarshipId, { status });
  }, [updateTrackedScholarship]);

  const handleOpenModal = useCallback((tracked: TrackedScholarship) => {
    setSelectedScholarship(tracked);
    setNotes(tracked.notes);
    setModalVisible(true);
  }, []);

  const handleSaveNotes = useCallback(() => {
    if (selectedScholarship) {
      updateTrackedScholarship(selectedScholarship.scholarship.id, { notes });
      setModalVisible(false);
    }
  }, [selectedScholarship, notes, updateTrackedScholarship]);

  const renderTracked = useCallback(({ item }: { item: TrackedScholarship }) => (
    <View style={styles.trackedContainer}>
      <ScholarshipCard
        scholarship={item.scholarship}
        onPress={() => router.push(`/scholarship/${item.scholarship.id}` as any)}
        onFavoritePress={() => toggleFavorite(item.scholarship)}
        isFavorite={isFavorite(item.scholarship.id)}
        testID={`tracked-card-${item.scholarship.id}`}
      />
      <View style={[styles.statusCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
        <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
          Application Status
        </Text>
        <View style={styles.statusButtons}>
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => handleStatusChange(item.scholarship.id, status)}
              style={[
                styles.statusButton,
                {
                  backgroundColor: item.status === status ? colors.primary : colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  { color: item.status === status ? '#FFFFFF' : colors.text },
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => handleOpenModal(item)}
          style={[styles.notesButton, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.notesButtonText, { color: colors.primary }]}>
            {item.notes ? 'Edit Notes' : 'Add Notes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [router, toggleFavorite, isFavorite, handleStatusChange, handleOpenModal, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Application Tracker
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your scholarship applications
        </Text>
      </View>

      <FlatList
        data={favoriteScholarships}
        renderItem={renderTracked}
        keyExtractor={(item) => item.scholarship.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookmarkCheck size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No tracked scholarships
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Favorite scholarships to track your applications
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Application Notes
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add notes about your application..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Button title="Save Notes" onPress={handleSaveNotes} />
          </View>
        </View>
      </Modal>
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
  trackedContainer: {
    marginBottom: SPACING.lg,
  },
  statusCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: -SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
    marginBottom: SPACING.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statusButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500' as const,
  },
  notesButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  notesButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600' as const,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700' as const,
  },
  notesInput: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.lg,
    minHeight: 150,
    borderWidth: 1,
  },
});
