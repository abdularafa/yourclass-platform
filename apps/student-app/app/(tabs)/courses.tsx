import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

export default function CoursesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const courses = [
    { id: '1', title: 'Physics Masterclass', price: 499, students: 1200, teacher: 'Dr. Sharma' },
    { id: '2', title: 'Chemistry Complete', price: 399, students: 800, teacher: 'Prof. Singh' },
    { id: '3', title: 'Mathematics Advanced', price: 599, students: 1500, teacher: 'Mr. Kumar' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search courses..." placeholderTextColor={colors.text.disabled} value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <ScrollView contentContainerStyle={styles.courseList}>
        {courses.map((course) => (
          <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => router.push(`/courses/${course.id}`)}>
            <View style={styles.courseContent}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseTeacher}>{course.teacher}</Text>
              <View style={styles.courseMeta}>
                <Text style={styles.coursePrice}>₹{course.price}</Text>
                <Text style={styles.courseStudents}>{course.students} students</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  searchContainer: { padding: spacing.md },
  searchInput: { backgroundColor: colors.background.surface, borderRadius: 6, paddingHorizontal: spacing.md, height: 44, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.subtle },
  courseList: { padding: spacing.md },
  courseCard: { backgroundColor: colors.background.surface, borderRadius: 10, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border.subtle },
  courseContent: { flex: 1 },
  courseTitle: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text.primary, marginBottom: spacing.xs },
  courseTeacher: { fontSize: typography.sizes.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  courseMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coursePrice: { fontSize: typography.sizes.h4, fontWeight: typography.weights.bold, color: colors.primary.default },
  courseStudents: { fontSize: typography.sizes.caption, color: colors.text.secondary },
});
