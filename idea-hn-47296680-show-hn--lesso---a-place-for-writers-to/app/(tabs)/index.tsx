import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCourseStore } from '../../store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

function CourseCard({ course }: { course: any }) {
  const lessonCount = course.lessons?.length || 0;
  const publishedText = course.published ? 'Published' : 'Draft';
  const priceText = course.price ? `$${course.price}` : 'Free';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/course/${course.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {course.title}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{publishedText}</Text>
        </View>
      </View>
      
      {course.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {course.description}
        </Text>
      ) : null}
      
      <View style={styles.cardFooter}>
        <View style={styles.metaItem}>
          <Ionicons name="book-outline" size={16} color="#8E8E93" />
          <Text style={styles.metaText}>{lessonCount} lessons</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="pricetag-outline" size={16} color="#8E8E93" />
          <Text style={styles.metaText}>{priceText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const courses = useCourseStore((state) => state.courses);

  const handleCreateCourse = () => {
    router.push('/create');
  };

  return (
    <View style={styles.container}>
      {courses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No courses yet</Text>
          <Text style={styles.emptyDescription}>
            Create your first course to get started
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateCourse}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Course</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CourseCard course={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={handleCreateCourse}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3C3C43',
  },
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
