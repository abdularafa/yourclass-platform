import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

export default function BatchesScreen() {
  const router = useRouter();
  const batches = [
    { id: '1', name: 'JEE 2025 Batch A', enrolled_count: 150, thumbnail_url: null, start_date: '2025-01-15' },
    { id: '2', name: 'NEET Foundation', enrolled_count: 200, thumbnail_url: null, start_date: '2025-02-01' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.batchCard} onPress={() => router.push(`/batches/${item.id}`)}>
            <View style={styles.batchThumbnail}>
              <Text style={styles.batchInitial}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.batchContent}>
              <Text style={styles.batchName}>{item.name}</Text>
              <Text style={styles.batchMeta}>{item.enrolled_count} students enrolled</Text>
              <Text style={styles.batchDate}>Started: {new Date(item.start_date).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No batches yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  list: { padding: spacing.md },
  batchCard: { flexDirection: 'row', backgroundColor: colors.background.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border.subtle },
  batchThumbnail: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary.default, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  batchInitial: { fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.text.primary },
  batchContent: { flex: 1 },
  batchName: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  batchMeta: { fontSize: typography.sizes.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  batchDate: { fontSize: typography.sizes.caption, color: colors.accent.teal },
  emptyText: { textAlign: 'center', color: colors.text.secondary, marginTop: spacing.xxl },
});
