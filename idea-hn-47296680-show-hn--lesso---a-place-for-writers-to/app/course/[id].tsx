import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCourseStore } from '../../store/courseStore';
import { Ionicons } from '@expo/vector-icons';

export default function CourseEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courses = useCourseStore((state) => state.courses);
  const addLesson = useCourseStore((state) => state.addLesson);
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color="#C7C7CC" />
          <Text style={styles.errorTitle}>Course not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const lessonCount = course.lessons?.length || 0;

  const handleAddLesson = () => {
    const lessonId = addLesson(course.id, {
      title: `Lesson ${lessonCount + 1}`,
      content: '',
      order: lessonCount,
    });
    router.push(`/course/lesson/${lessonId}?courseId=${course.id}`);
  };

  const handleLessonPress = (lessonId: string) => {
    router.push(`/course/lesson/${lessonId}?courseId=${course.id}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        {course.description && (
          <Text style={styles.description}>{course.description}</Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={16} color="#8E8E93" />
            <Text style={styles.metaText}>{lessonCount} lessons</Text>
          </View>
          {course.price && (
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>${course.price}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lessons</Text>
        </View>

        {lessonCount === 0 ? (
          <View style={styles.emptyLessons}>
            <Ionicons name="document-text-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyLessonsText}>No lessons yet</Text>
            <Text style={styles.emptyLessonsSubtext}>
              Add your first lesson to start building your course
            </Text>
          </View>
        ) : (
          <View style={styles.lessonsList}>
            {course.lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => handleLessonPress(lesson.id)}
                activeOpacity={0.7}
              >
                <View style={styles.lessonNumber}>
                  <Text style={styles.lessonNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addLessonButton}
          onPress={handleAddLesson}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.addLessonText}>Add Lesson</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  emptyLessons: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyLessonsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
  },
  emptyLessonsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  lessonsList: {
    gap: 12,
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    gap: 12,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lessonTitle: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  addLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    gap: 8,
  },
  addLessonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
