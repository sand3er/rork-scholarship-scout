import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { FONT_SIZES, SPACING } from '@/constants/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/(tabs)" style={[styles.link, { color: colors.primary }]}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700' as const,
    marginBottom: SPACING.md,
  },
  link: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600' as const,
  },
});
