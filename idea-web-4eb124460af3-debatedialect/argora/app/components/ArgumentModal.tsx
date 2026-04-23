import React, { useState } from 'react';
import { View, TextInput, Button, Modal, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DebateNode, Evidence } from '../utils/debateTree';

interface ArgumentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: 'pro' | 'con', evidence: Evidence[]) => void;
  parentNode?: DebateNode;
}

const ArgumentModal: React.FC<ArgumentModalProps> = ({ visible, onClose, onSubmit, parentNode }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pro' | 'con'>('pro');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');

  const detectEvidenceType = (url: string): 'link' | 'image' | 'pdf' => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) return 'pdf';
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    return 'link';
  };

  const handleAddEvidence = () => {
    if (evidenceUrl.trim() && evidenceTitle.trim()) {
      const newEvidence: Evidence = {
        type: detectEvidenceType(evidenceUrl),
        url: evidenceUrl,
        title: evidenceTitle,
      };
      setEvidence([...evidence, newEvidence]);
      setEvidenceUrl('');
      setEvidenceTitle('');
      setShowEvidenceForm(false);
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, type, evidence);
      setTitle('');
      setType('pro');
      setEvidence([]);
      setShowEvidenceForm(false);
      setEvidenceUrl('');
      setEvidenceTitle('');
    }
  };

  const handleClose = () => {
    setTitle('');
    setType('pro');
    setEvidence([]);
    setShowEvidenceForm(false);
    setEvidenceUrl('');
    setEvidenceTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <ScrollView>
            {parentNode && (
              <View style={styles.parentInfo}>
                <Text style={styles.parentLabel}>Replying to:</Text>
                <Text style={styles.parentTitle}>{parentNode.title}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Enter your argument"
              value={title}
              onChangeText={setTitle}
              multiline
            />

            <View style={styles.typeSelector}>
              <Text style={styles.typeLabel}>Argument type:</Text>
              <View style={styles.buttonContainer}>
                <View style={styles.typeButton}>
                  <Button
                    title="Pro"
                    onPress={() => setType('pro')}
                    color={type === 'pro' ? '#2e7d32' : '#999'}
                  />
                </View>
                <View style={styles.typeButton}>
                  <Button
                    title="Con"
                    onPress={() => setType('con')}
                    color={type === 'con' ? '#c62828' : '#999'}
                  />
                </View>
              </View>
            </View>

            <View style={styles.evidenceSection}>
              <Text style={styles.sectionLabel}>Evidence:</Text>

              {evidence.map((item, index) => (
                <View key={index} style={styles.evidenceItem}>
                  <View style={styles.evidenceInfo}>
                    <Text style={styles.evidenceType}>[{item.type.toUpperCase()}]</Text>
                    <Text style={styles.evidenceTitle} numberOfLines={1}>{item.title}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveEvidence(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {!showEvidenceForm ? (
                <TouchableOpacity
                  style={styles.addEvidenceButton}
                  onPress={() => setShowEvidenceForm(true)}
                >
                  <Text style={styles.addEvidenceButtonText}>+ Add Evidence</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.evidenceForm}>
                  <TextInput
                    style={styles.evidenceInput}
                    placeholder="Evidence URL"
                    value={evidenceUrl}
                    onChangeText={setEvidenceUrl}
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.evidenceInput}
                    placeholder="Evidence Title"
                    value={evidenceTitle}
                    onChangeText={setEvidenceTitle}
                  />
                  <View style={styles.evidenceFormButtons}>
                    <TouchableOpacity
                      style={[styles.evidenceFormButton, styles.cancelButton]}
                      onPress={() => {
                        setShowEvidenceForm(false);
                        setEvidenceUrl('');
                        setEvidenceTitle('');
                      }}
                    >
                      <Text style={styles.evidenceFormButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.evidenceFormButton, styles.addButton]}
                      onPress={handleAddEvidence}
                    >
                      <Text style={styles.evidenceFormButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.actionButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  parentInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  parentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  parentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginBottom: 15,
  },
  typeLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '48%',
  },
  evidenceSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  evidenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 8,
  },
  evidenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  evidenceType: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  evidenceTitle: {
    fontSize: 14,
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#c62828',
  },
  addEvidenceButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  addEvidenceButtonText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  evidenceForm: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  evidenceInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  evidenceFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  evidenceFormButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#2e7d32',
  },
  evidenceFormButtonText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ArgumentModal;
