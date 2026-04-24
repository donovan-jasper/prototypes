import React, { useState, useRef, useEffect } from 'react';
import { View, Button, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, Alert, ScrollView } from 'react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Circle, Rect, Path, Text as SvgText } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { createWorker } from 'tesseract.js';
import Pdf from 'react-native-pdf';
import { saveFile } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const PDFEditor = ({ pdfData, onSave }) => {
  const [editedPdf, setEditedPdf] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [tool, setTool] = useState('text');
  const [ocrText, setOcrText] = useState('');
  const [ocrCount, setOcrCount] = useState(0);
  const [ocrLimitReached, setOcrLimitReached] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastTranslateX, setLastTranslateX] = useState(0);
  const [lastTranslateY, setLastTranslateY] = useState(0);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const svgRef = useRef(null);
  const pdfRef = useRef(null);
  const db = SQLite.openDatabase('offlinedoc.db');

  useEffect(() => {
    // Initialize database
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ocr_usage (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, count INTEGER);'
      );
    });

    // Check OCR usage
    checkOcrUsage();
  }, []);

  const checkOcrUsage = () => {
    const today = new Date().toISOString().split('T')[0];

    db.transaction(tx => {
      tx.executeSql(
        'SELECT count FROM ocr_usage WHERE date = ?;',
        [today],
        (_, { rows }) => {
          if (rows.length > 0) {
            const count = rows.item(0).count;
            setOcrCount(count);
            if (count >= 3) {
              setOcrLimitReached(true);
            }
          }
        }
      );
    });
  };

  const updateOcrUsage = () => {
    const today = new Date().toISOString().split('T')[0];

    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO ocr_usage (date, count) VALUES (?, COALESCE((SELECT count FROM ocr_usage WHERE date = ?), 0) + 1);',
        [today, today],
        () => {
          checkOcrUsage();
        }
      );
    });
  };

  const handleOCR = async () => {
    if (ocrLimitReached) {
      Alert.alert('OCR Limit Reached', 'You have reached your daily OCR limit. Please upgrade to continue.');
      return;
    }

    try {
      const worker = await createWorker({
        logger: m => console.log(m),
      });

      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const { data: { text } } = await worker.recognize(pdfData);
      setOcrText(text);
      updateOcrUsage();

      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert('OCR Error', 'Failed to extract text from the document.');
    }
  };

  const handleEdit = async () => {
    const pdfDoc = await PDFDocument.load(pdfData);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text annotations
    annotations.forEach(annotation => {
      if (annotation.type === 'text') {
        firstPage.drawText(annotation.text, {
          x: annotation.x / scale,
          y: (firstPage.getHeight() - annotation.y) / scale,
          size: 12 / scale,
          color: rgb(0, 0, 0),
        });
      } else if (annotation.type === 'rectangle') {
        firstPage.drawRectangle({
          x: annotation.x / scale,
          y: (firstPage.getHeight() - annotation.y - annotation.height) / scale,
          width: annotation.width / scale,
          height: annotation.height / scale,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1 / scale,
        });
      } else if (annotation.type === 'circle') {
        firstPage.drawCircle({
          x: (annotation.x + annotation.radius) / scale,
          y: (firstPage.getHeight() - annotation.y - annotation.radius) / scale,
          radius: annotation.radius / scale,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1 / scale,
        });
      }
    });

    const editedPdfBytes = await pdfDoc.save();
    setEditedPdf(editedPdfBytes);
  };

  const handleSave = async () => {
    if (!editedPdf) {
      Alert.alert('No Changes', 'No edits have been made to save.');
      return;
    }

    try {
      const fileName = `edited_${Date.now()}.pdf`;
      const fileUri = await saveFile(fileName, editedPdf);
      Alert.alert('Success', 'PDF saved successfully!');
      onSave(fileUri);
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'Failed to save the PDF.');
    }
  };

  const handlePanGesture = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      setTranslateX(lastTranslateX + nativeEvent.translationX);
      setTranslateY(lastTranslateY + nativeEvent.translationY);
    } else if (nativeEvent.state === State.END) {
      setLastTranslateX(translateX);
      setLastTranslateY(translateY);
    }
  };

  const handlePinchGesture = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      setScale(scale * nativeEvent.scale);
    }
  };

  const handleAddAnnotation = () => {
    if (tool === 'text' && textInput.trim()) {
      const newAnnotation = {
        id: Date.now(),
        type: 'text',
        text: textInput,
        x: 50,
        y: 50,
      };
      setAnnotations([...annotations, newAnnotation]);
      setTextInput('');
    }
  };

  const handleToolChange = (selectedTool) => {
    setTool(selectedTool);
    if (selectedTool !== 'text') {
      setTextInput('');
    }
  };

  const renderAnnotations = () => {
    return annotations.map(annotation => {
      if (annotation.type === 'text') {
        return (
          <SvgText
            key={annotation.id}
            x={annotation.x}
            y={annotation.y}
            fontSize="12"
            fill="black"
          >
            {annotation.text}
          </SvgText>
        );
      } else if (annotation.type === 'rectangle') {
        return (
          <Rect
            key={annotation.id}
            x={annotation.x}
            y={annotation.y}
            width={annotation.width}
            height={annotation.height}
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        );
      } else if (annotation.type === 'circle') {
        return (
          <Circle
            key={annotation.id}
            cx={annotation.x + annotation.radius}
            cy={annotation.y + annotation.radius}
            r={annotation.radius}
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        );
      }
      return null;
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolButton, tool === 'text' && styles.activeTool]}
          onPress={() => handleToolChange('text')}
        >
          <Text style={styles.toolButtonText}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, tool === 'rectangle' && styles.activeTool]}
          onPress={() => handleToolChange('rectangle')}
        >
          <Text style={styles.toolButtonText}>Rectangle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, tool === 'circle' && styles.activeTool]}
          onPress={() => handleToolChange('circle')}
        >
          <Text style={styles.toolButtonText}>Circle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={handleOCR}
          disabled={ocrLimitReached}
        >
          <Text style={[styles.toolButtonText, ocrLimitReached && styles.disabledText]}>OCR</Text>
        </TouchableOpacity>
      </View>

      {tool === 'text' && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Enter text annotation"
          />
          <Button title="Add" onPress={handleAddAnnotation} />
        </View>
      )}

      <View style={styles.pdfContainer}>
        <PanGestureHandler onGestureEvent={handlePanGesture}>
          <PinchGestureHandler onGestureEvent={handlePinchGesture}>
            <View style={styles.pdfWrapper}>
              <Pdf
                ref={pdfRef}
                source={{ uri: `data:application/pdf;base64,${pdfData}` }}
                style={styles.pdf}
                onLoadComplete={(numberOfPages, filePath, { width, height }) => {
                  setPdfDimensions({ width, height });
                }}
                onPressLink={(uri) => {
                  console.log(`Link pressed: ${uri}`);
                }}
              />
              <Svg
                ref={svgRef}
                style={StyleSheet.absoluteFill}
                width={pdfDimensions.width * scale}
                height={pdfDimensions.height * scale}
              >
                <Svg.Group transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
                  {renderAnnotations()}
                </Svg.Group>
              </Svg>
            </View>
          </PinchGestureHandler>
        </PanGestureHandler>
      </View>

      {ocrText && (
        <ScrollView style={styles.ocrResult}>
          <Text>{ocrText}</Text>
        </ScrollView>
      )}

      <View style={styles.actionButtons}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Apply Changes" onPress={handleEdit} />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  toolButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeTool: {
    backgroundColor: '#4CAF50',
  },
  toolButtonText: {
    color: 'black',
  },
  disabledText: {
    color: '#999',
  },
  textInputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 10,
    borderRadius: 5,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdfWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  ocrResult: {
    maxHeight: 150,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default PDFEditor;
