import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Moon, Sun, LogOut, Info, Camera, Edit2, Check, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { BORDER_RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants/theme';
import { NATIONALITIES, MAJORS } from '@/mocks/scholarships';
import { StudyLevel } from '@/types/scholarship';

const STUDY_LEVELS: StudyLevel[] = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'PhD'];

export default function ProfileScreen() {
  const { colors, themeMode, toggleTheme } = useTheme();
  const { profile, updateProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleEditField = useCallback((field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  }, []);

  const handleSaveField = useCallback(() => {
    if (editingField) {
      updateProfile({ [editingField]: editValue });
      setEditingField(null);
      setEditValue('');
    }
  }, [editingField, editValue, updateProfile]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handlePickImage = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        updateProfile({ profilePicture: result.assets[0].uri });
        setShowImagePicker(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, [updateProfile]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will clear all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updateProfile({
              name: '',
              nationality: '',
              studyLevel: 'Undergraduate',
              major: '',
              gpa: '',
              preferredCountries: [],
              deadlinePreference: '',
              completedOnboarding: false,
            });
          },
        },
      ]
    );
  }, [updateProfile]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradient1, colors.gradient2, colors.gradient3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + SPACING.xxl }]}
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={() => setShowImagePicker(true)}
            style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
          >
            {profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.avatarImage} />
            ) : (
              <User size={48} color="#FFFFFF" />
            )}
            <View style={[styles.cameraButton, { backgroundColor: colors.primary }]}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile.name || 'Guest User'}</Text>
        <Text style={styles.email}>{profile.nationality}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Profile Information
          </Text>
          
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEditField('name', profile.name)}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Name
            </Text>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.name || 'Not set'}
              </Text>
              <Edit2 size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEditField('nationality', profile.nationality)}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Nationality
            </Text>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.nationality || 'Not set'}
              </Text>
              <Edit2 size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEditField('studyLevel', profile.studyLevel)}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Study Level
            </Text>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.studyLevel}
              </Text>
              <Edit2 size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEditField('major', profile.major)}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Major
            </Text>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.major || 'Not set'}
              </Text>
              <Edit2 size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEditField('gpa', profile.gpa)}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              GPA
            </Text>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.gpa || 'Not set'}
              </Text>
              <Edit2 size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEditField('deadlinePreference', profile.deadlinePreference)}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Timeline
            </Text>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.deadlinePreference || 'Not set'}
              </Text>
              <Edit2 size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              {themeMode === 'dark' ? (
                <Moon size={24} color={colors.primary} />
              ) : (
                <Sun size={24} color={colors.primary} />
              )}
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {themeMode === 'dark' ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Info size={24} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  App Version
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  1.0.0
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: `${colors.error}15` }]}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Reset Profile
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Scholarship Scout v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Find your perfect scholarship opportunity
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showImagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Profile Picture
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => handlePickImage('camera')}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.secondary }]}
              onPress={() => handlePickImage('gallery')}
            >
              <User size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={[styles.modalButtonTextSecondary, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={editingField !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancelEdit}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.editModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>
                Edit {editingField === 'name' ? 'Name' : editingField === 'nationality' ? 'Nationality' : editingField === 'studyLevel' ? 'Study Level' : editingField === 'major' ? 'Major' : editingField === 'gpa' ? 'GPA' : 'Timeline'}
              </Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {(editingField === 'name' || editingField === 'gpa') && (
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter ${editingField}`}
                placeholderTextColor={colors.textSecondary}
                keyboardType={editingField === 'gpa' ? 'decimal-pad' : 'default'}
                autoFocus
              />
            )}

            {editingField === 'nationality' && (
              <ScrollView style={styles.editScrollView} showsVerticalScrollIndicator={false}>
                {NATIONALITIES.map((nationality) => (
                  <TouchableOpacity
                    key={nationality}
                    style={[styles.editOption, { backgroundColor: editValue === nationality ? `${colors.primary}15` : colors.surface }]}
                    onPress={() => setEditValue(nationality)}
                  >
                    <Text style={[styles.editOptionText, { color: colors.text }]}>
                      {nationality}
                    </Text>
                    {editValue === nationality && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {editingField === 'studyLevel' && (
              <ScrollView style={styles.editScrollView} showsVerticalScrollIndicator={false}>
                {STUDY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.editOption, { backgroundColor: editValue === level ? `${colors.primary}15` : colors.surface }]}
                    onPress={() => setEditValue(level)}
                  >
                    <Text style={[styles.editOptionText, { color: colors.text }]}>
                      {level}
                    </Text>
                    {editValue === level && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {editingField === 'major' && (
              <ScrollView style={styles.editScrollView} showsVerticalScrollIndicator={false}>
                {MAJORS.map((major) => (
                  <TouchableOpacity
                    key={major}
                    style={[styles.editOption, { backgroundColor: editValue === major ? `${colors.primary}15` : colors.surface }]}
                    onPress={() => setEditValue(major)}
                  >
                    <Text style={[styles.editOptionText, { color: colors.text }]}>
                      {major}
                    </Text>
                    {editValue === major && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {editingField === 'deadlinePreference' && (
              <ScrollView style={styles.editScrollView} showsVerticalScrollIndicator={false}>
                {['1-3 months', '3-6 months', '6-12 months', '12+ months'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.editOption, { backgroundColor: editValue === option ? `${colors.primary}15` : colors.surface }]}
                    onPress={() => setEditValue(option)}
                  >
                    <Text style={[styles.editOptionText, { color: colors.text }]}>
                      {option}
                    </Text>
                    {editValue === option && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveField}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700' as const,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700' as const,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  modalButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalButtonTextSecondary: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
  },
  editModalContent: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  editModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700' as const,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.lg,
  },
  editScrollView: {
    maxHeight: 300,
    marginBottom: SPACING.lg,
  },
  editOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  editOptionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500' as const,
  },
  saveButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
