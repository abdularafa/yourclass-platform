import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@yourclass/ui-tokens';
import { ContinueLearningSection, FeaturedCoursesSection, UpcomingLiveSection } from '../components/CourseCards';

interface User {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface HomeData {
  user: User | null;
  continue_learning: Array<{ id: string; title: string; thumbnail_url: string | null; progress: number; teacher: { user: { name: string } } }>;
  featured_courses: Array<{ id: string; title: string; thumbnail_url: string | null; price: number; discount_price: number | null; total_enrolled: number; teacher: { user: { name: string } } }>;
  upcoming_live: Array<{ id: string; title: string; scheduled_at: string; teacher: { user: { name: string } } }>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeData>({ user: null, continue_learning: [], featured_courses: [], upcoming_live: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [coursesRes, liveRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_COURSE_URL}/api/v1/courses?visibility=published&limit=10`),
        fetch(`${process.env.NEXT_PUBLIC_LIVE_URL}/api/v1/live-sessions/upcoming?tenant_id=demo`),
      ]);
      const coursesData = await coursesRes.json();
      const liveData = await liveRes.json();
      
      setData({
        user: { id: '1', name: 'Student', avatar_url: null },
        continue_learning: [],
        featured_courses: coursesData.success ? coursesData.data : [],
        upcoming_live: liveData.success ? liveData.data : [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.default} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {data.user?.name || 'Student'}!</Text>
        <Text style={styles.subtitle}>Ready to learn something new today?</Text>
      </View>

      <FeaturedCoursesSection courses={data.featured_courses} onCoursePress={(id) => router.push(`/courses/${id}`)} />
      <UpcomingLiveSection sessions={data.upcoming_live} onSessionPress={(id) => router.push(`/live/${id}`)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  loadingContainer: { flex: 1, backgroundColor: colors.background.base, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: typography.sizes.body, color: colors.text.secondary },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  greeting: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.text.primary },
  subtitle: { fontSize: typography.sizes.body, color: colors.text.secondary, marginTop: spacing.xs },
});
