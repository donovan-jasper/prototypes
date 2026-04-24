import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCourseStore } from '../../store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Markdown from 'react-native-markdown-display';

export default function CourseEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courses = useCourseStore((state) => state.courses);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const addLesson = useCourseStore((state) => state.addLesson);
  const updateLesson = useCourseStore((state) => state.updateLesson);
  const deleteLesson = useCourseStore((state) => state.deleteLesson);
  const reorderLessons = useCourseStore((state) => state.reorderLessons);

  const course = courses.find((c) => c.id === id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

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

  const handleAddLesson = () => {
    if (newLessonTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    const lessonId = addLesson(course.id, {
      title: newLessonTitle,
      content: newLessonContent,
      order: course.lessons.length,
    });

    setNewLessonTitle('');
    setNewLessonContent('');
    setIsModalVisible(false);
    setEditingLessonId(lessonId);
  };

  const handleLessonPress = (lessonId: string) => {
    setEditingLessonId(lessonId);
  };

  const handleSaveLesson = () => {
    if (editingLessonId) {
      const lesson = course.lessons.find(l => l.id === editingLessonId);
      if (lesson) {
        updateLesson(course.id, editingLessonId, {
          title: lesson.title,
          content: lesson.content
        });
        setEditingLessonId(null);
      }
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLesson(course.id, lessonId);
            if (editingLessonId === lessonId) {
              setEditingLessonId(null);
            }
          }
        }
      ]
    );
  };

  const renderLessonItem = ({ item, drag, isActive }: RenderItemParams<Lesson>) => {
    return (
      <TouchableOpacity
        style={[styles.lessonCard, isActive && styles.activeLessonCard]}
        onPress={() => handleLessonPress(item.id)}
        onLongPress={drag}
        activeOpacity={0.7}
        delayLongPress={200}
      >
        <View style={styles.lessonNumber}>
          <Text style={styles.lessonNumberText}>{item.order + 1}</Text>
        </View>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <Ionicons name="reorder-three-outline" size={24} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const currentLesson = editingLessonId ? course.lessons.find(l => l.id === editingLessonId) : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TextInput
            style={styles.titleInput}
            value={course.title}
            onChangeText={(text) => updateCourse(course.id, { title: text })}
            placeholder="Course Title"
            placeholderTextColor="#8E8E93"
          />
          <TextInput
            style={styles.descriptionInput}
            value={course.description}
            onChangeText={(text) => updateCourse(course.id, { description: text })}
            placeholder="Course Description"
            placeholderTextColor="#8E8E93"
            multiline
          />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{course.lessons.length} lessons</Text>
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {course.lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <Ionicons name="document-text-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyLessonsText}>No lessons yet</Text>
              <Text style={styles.emptyLessonsSubtext}>
                Add your first lesson to start building your course
              </Text>
              <TouchableOpacity
                style={styles.addLessonButton}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.addLessonText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DraggableFlatList
              data={course.lessons.sort((a, b) => a.order - b.order)}
              renderItem={renderLessonItem}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => {
                const reorderedLessons = data.map((item, index) => ({
                  ...item,
                  order: index
                }));
                reorderLessons(course.id, reorderedLessons);
              }}
              activationDistance={20}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Lesson Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Lesson</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Lesson Title"
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              autoFocus
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Lesson Content (Markdown)"
              value={newLessonContent}
              onChangeText={setNewLessonContent}
              multiline
              numberOfLines={8}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddLesson}
              >
                <Text style={styles.modalButtonText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lesson Editor Modal */}
      {currentLesson && (
        <Modal
          visible={!!editingLessonId}
          animationType="slide"
          onRequestClose={() => setEditingLessonId(null)}
        >
          <View style={styles.editorContainer}>
            <View style={styles.editorHeader}>
              <TouchableOpacity onPress={() => setEditingLessonId(null)}>
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.editorTitle}>Edit Lesson</Text>
              <View style={styles.editorActions}>
                <TouchableOpacity
                  onPress={() => setIsPreviewVisible(!isPreviewVisible)}
                  style={styles.previewToggle}
                >
                  <Text style={styles.previewToggleText}>
                    {isPreviewVisible ? 'Edit' : 'Preview'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveLesson}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.editorContent}>
              {isPreviewVisible ? (
                <ScrollView style={styles.previewContainer}>
                  <Markdown style={markdownStyles}>
                    {currentLesson.content || 'No content yet'}
                  </Markdown>
                </ScrollView>
              ) : (
                <>
                  <TextInput
                    style={styles.lessonTitleInput}
                    value={currentLesson.title}
                    onChangeText={(text) => updateLesson(course.id, currentLesson.id, { title: text })}
                    placeholder="Lesson Title"
                  />
                  <TextInput
                    style={styles.lessonContentInput}
                    value={currentLesson.content}
                    onChangeText={(text) => updateLesson(course.id, currentLesson.id, { content: text })}
                    placeholder="Lesson Content (Markdown)"
                    multiline
                    numberOfLines={20}
                  />
                </>
              )}
            </View>

            <View style={styles.editorFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteLesson(currentLesson.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Delete Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const markdownStyles = {
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  list_item_icon: {
    marginRight: 8,
  },
  list_item_text: {
    flex: 1,
  },
};

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
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    padding: 0,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 12,
    padding: 0,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 8,
    marginBottom: 24,
  },
  addLessonButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addLessonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  activeLessonCard: {
    opacity: 0.8,
    backgroundColor: '#E5E5EA',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalTextArea: {
    height: 160,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewToggle: {
    padding: 8,
  },
  previewToggleText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editorContent: {
    flex: 1,
    padding: 16,
  },
  lessonTitleInput: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    padding: 0,
  },
  lessonContentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    padding: 0,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  editorFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
