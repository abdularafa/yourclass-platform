import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  total_enrolled: number;
  teacher: { user: { name: string } };
}

interface ContinueLearningProps {
  courses: Course[];
  onCoursePress: (id: string) => void;
}

export function ContinueLearningSection({ courses, onCoursePress }: ContinueLearningProps) {
  if (courses.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue Learning</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {courses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={styles.card}
            onPress={() => onCoursePress(course.id)}
          >
            <Image
              source={{ uri: course.thumbnail_url || 'https://via.placeholder.com/200' }}
              style={styles.thumbnail}
            />
            <View style={styles.cardContent}>
              <Text style={styles.courseTitle} numberOfLines={2}>
                {course.title}
              </Text>
              <Text style={styles.teacherName}>{course.teacher.user.name}</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>45% completed</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

interface FeaturedCourse {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  discount_price: number | null;
  total_enrolled: number;
  teacher: { user: { name: string } };
}

interface FeaturedCoursesProps {
  courses: FeaturedCourse[];
  onCoursePress: (id: string) => void;
}

export function FeaturedCoursesSection({ courses, onCoursePress }: FeaturedCoursesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Featured Courses</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {courses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={styles.featuredCard}
            onPress={() => onCoursePress(course.id)}
          >
            <Image
              source={{ uri: course.thumbnail_url || 'https://via.placeholder.com/300x180' }}
              style={styles.featuredThumbnail}
            />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {course.title}
              </Text>
              <Text style={styles.featuredTeacher}>{course.teacher.user.name}</Text>
              <View style={styles.priceContainer}>
                {course.discount_price ? (
                  <>
                    <Text style={styles.originalPrice}>₹{course.price}</Text>
                    <Text style={styles.discountedPrice}>₹{course.discount_price}</Text>
                  </>
                ) : (
                  <Text style={styles.price}>₹{course.price}</Text>
                )}
              </View>
              <Text style={styles.enrolledCount}>{course.total_enrolled} students</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

interface UpcomingLive {
  id: string;
  title: string;
  scheduled_at: string;
  teacher: { user: { name: string } };
}

interface UpcomingLiveSectionProps {
  sessions: UpcomingLive[];
  onSessionPress: (id: string) => void;
}

export function UpcomingLiveSection({ sessions, onSessionPress }: UpcomingLiveSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Upcoming Live Classes</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {sessions.map(session => (
        <TouchableOpacity
          key={session.id}
          style={styles.liveCard}
          onPress={() => onSessionPress(session.id)}
        >
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <View style={styles.liveContent}>
            <Text style={styles.liveTitle}>{session.title}</Text>
            <Text style={styles.liveTeacher}>{session.teacher.user.name}</Text>
            <Text style={styles.liveTime}>{new Date(session.scheduled_at).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.lg },
  title: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.sizes.body,
    color: colors.primary.default,
    fontWeight: typography.weights.medium,
  },
  scrollContent: { paddingRight: spacing.lg },
  card: {
    width: 280,
    backgroundColor: colors.background.surface,
    borderRadius: 10,
    marginRight: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  thumbnail: { width: '100%', height: 140 },
  cardContent: { padding: spacing.md },
  courseTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  teacherName: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border.subtle,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: colors.accent.teal,
    borderRadius: 2,
  },
  progressText: { fontSize: typography.sizes.caption, color: colors.text.secondary },
  featuredCard: {
    width: 200,
    backgroundColor: colors.background.surface,
    borderRadius: 10,
    marginRight: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  featuredThumbnail: { width: '100%', height: 120 },
  featuredContent: { padding: spacing.md },
  featuredTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featuredTeacher: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  originalPrice: {
    fontSize: typography.sizes.caption,
    color: colors.text.disabled,
    textDecorationLine: 'line-through',
    marginRight: spacing.xs,
  },
  discountedPrice: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.primary.default,
  },
  price: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.primary.default,
  },
  enrolledCount: { fontSize: typography.sizes.caption, color: colors.text.secondary },
  liveCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  liveBadge: {
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginRight: spacing.md,
    alignSelf: 'flex-start',
  },
  liveBadgeText: { fontSize: 10, fontWeight: typography.weights.bold, color: colors.text.primary },
  liveContent: { flex: 1 },
  liveTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  liveTeacher: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  liveTime: { fontSize: typography.sizes.caption, color: colors.accent.teal },
});
