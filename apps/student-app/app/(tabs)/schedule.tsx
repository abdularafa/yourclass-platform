import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

export default function ScheduleScreen() {
  const router = useRouter();
  const sessions = [
    { id: '1', title: 'Physics - Mechanics', scheduled_at: new Date(Date.now() + 3600000).toISOString(), duration_minutes: 60, status: 'scheduled' },
    { id: '2', title: 'Chemistry - Organic', scheduled_at: new Date(Date.now() + 86400000).toISOString(), duration_minutes: 90, status: 'scheduled' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {sessions.map((session) => (
          <TouchableOpacity key={session.id} style={styles.sessionCard} onPress={() => router.push(`/live/${session.id}`)}>
            <View style={styles.sessionTime}>
              <Text style={styles.sessionTimeText}>{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.sessionDuration}>{session.duration_minutes} min</Text>
            </View>
            <View style={styles.sessionContent}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <View style={styles.sessionStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{session.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {sessions.length === 0 && <Text style={styles.emptyText}>No upcoming sessions</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  list: { padding: spacing.md },
  sessionCard: { flexDirection: 'row', backgroundColor: colors.background.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border.subtle },
  sessionTime: { width: 70, marginRight: spacing.md },
  sessionTimeText: { fontSize: typography.sizes.h4, fontWeight: typography.weights.bold, color: colors.accent.teal },
  sessionDuration: { fontSize: typography.sizes.caption, color: colors.text.secondary },
  sessionContent: { flex: 1 },
  sessionTitle: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  sessionStatus: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.warning, marginRight: spacing.xs },
  statusText: { fontSize: typography.sizes.caption, color: colors.text.secondary, textTransform: 'capitalize' },
  emptyText: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.xxl },
});
