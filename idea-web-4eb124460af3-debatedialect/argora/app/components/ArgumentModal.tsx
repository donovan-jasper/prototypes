import React, { useState } from 'react';
import { View, TextInput, Button, Modal, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
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
                    placeholder="Evidence title"
                    value={evidenceTitle}
                    onChangeText={setEvidenceTitle}
                  />
                  <View style={styles.evidenceFormButtons}>
                    <View style={styles.evidenceFormButton}>
                      <Button title="Add" onPress={handleAddEvidence} />
                    </View>
                    <View style={styles.evidenceFormButton}>
                      <Button 
                        title="Cancel" 
                        onPress={() => {
                          setShowEvidenceForm(false);
                          setEvidenceUrl('');
                          setEvidenceTitle('');
                        }} 
                        color="#666" 
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
            
            <View style={styles.actionButtons}>
              <View style={styles.actionButton}>
                <Button title="Submit" onPress={handleSubmit} />
              </View>
              <View style={styles.actionButton}>
                <Button title="Cancel" onPress={handleClose} color="#666" />
              </View>
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
    width: '85%',
    maxHeight: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  parentInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  parentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  parentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  evidenceSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 8,
  },
  evidenceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
  },
  evidenceTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#c62828',
    fontWeight: 'bold',
  },
  addEvidenceButton: {
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    alignItems: 'center',
  },
  addEvidenceButtonText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  evidenceForm: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  evidenceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  evidenceFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  evidenceFormButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ArgumentModal;
