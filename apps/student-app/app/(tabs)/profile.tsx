import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

export default function ProfileScreen() {
  const user = { name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', avatar_url: null };
  const [notifications, setNotifications] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user.phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border.subtle, true: colors.primary.default }} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  header: { alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary.default, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.text.primary },
  name: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.text.primary },
  email: { fontSize: typography.sizes.body, color: colors.text.secondary, marginTop: spacing.xs },
  section: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  sectionTitle: { fontSize: typography.sizes.caption, fontWeight: typography.weights.medium, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoLabel: { fontSize: typography.sizes.body, color: colors.text.primary },
  infoValue: { fontSize: typography.sizes.body, color: colors.text.secondary },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  settingLabel: { fontSize: typography.sizes.body, color: colors.text.primary },
  logoutButton: { margin: spacing.lg, padding: spacing.md, backgroundColor: colors.status.error, borderRadius: 6, alignItems: 'center' },
  logoutText: { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.text.primary },
});
