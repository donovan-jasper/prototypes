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
      if (onSave) onSave(fileUri);
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'Failed to save the PDF.');
    }
  };

  const handlePanGesture = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setTranslateX(lastTranslateX + event.nativeEvent.translationX);
      setTranslateY(lastTranslateY + event.nativeEvent.translationY);
    } else if (event.nativeEvent.state === State.END) {
      setLastTranslateX(translateX);
      setLastTranslateY(translateY);
    }
  };

  const handlePinchGesture = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setScale(scale * event.nativeEvent.scale);
    }
  };

  const handleAddAnnotation = (type) => {
    if (type === 'text' && textInput.trim() === '') {
      Alert.alert('Empty Text', 'Please enter some text for the annotation.');
      return;
    }

    const newAnnotation = {
      id: Date.now(),
      type,
      x: 50,
      y: 50,
      ...(type === 'text' && { text: textInput }),
      ...(type === 'rectangle' && { width: 100, height: 50 }),
      ...(type === 'circle' && { radius: 50 }),
    };

    setAnnotations([...annotations, newAnnotation]);
    setTextInput('');
  };

  const handleAnnotationPress = (id) => {
    setCurrentAnnotation(id);
  };

  const handleAnnotationMove = (id, dx, dy) => {
    setAnnotations(annotations.map(ann =>
      ann.id === id ? { ...ann, x: ann.x + dx, y: ann.y + dy } : ann
    ));
  };

  const handlePdfLayout = (event) => {
    setPdfDimensions({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.toolbar}>
        <Button title="Text" onPress={() => setTool('text')} />
        <Button title="Rectangle" onPress={() => setTool('rectangle')} />
        <Button title="Circle" onPress={() => setTool('circle')} />
        <Button title="OCR" onPress={handleOCR} disabled={ocrLimitReached} />
        <Button title="Save" onPress={handleSave} />
      </View>

      {tool === 'text' && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter annotation text"
            value={textInput}
            onChangeText={setTextInput}
          />
          <Button title="Add Text" onPress={() => handleAddAnnotation('text')} />
        </View>
      )}

      <View style={styles.editorContainer}>
        <PinchGestureHandler onGestureEvent={handlePinchGesture}>
          <PanGestureHandler onGestureEvent={handlePanGesture}>
            <View style={styles.pdfContainer} onLayout={handlePdfLayout}>
              <Pdf
                ref={pdfRef}
                source={{ uri: `data:application/pdf;base64,${pdfData}` }}
                style={styles.pdf}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`Number of pages: ${numberOfPages}`);
                }}
                onError={(error) => {
                  console.log(error);
                }}
              />

              <Svg
                ref={svgRef}
                style={StyleSheet.absoluteFill}
                width={pdfDimensions.width}
                height={pdfDimensions.height}
              >
                {annotations.map(annotation => (
                  <React.Fragment key={annotation.id}>
                    {annotation.type === 'text' && (
                      <SvgText
                        x={annotation.x}
                        y={annotation.y}
                        fontSize="12"
                        fill="black"
                        onPress={() => handleAnnotationPress(annotation.id)}
                      >
                        {annotation.text}
                      </SvgText>
                    )}
                    {annotation.type === 'rectangle' && (
                      <Rect
                        x={annotation.x}
                        y={annotation.y}
                        width={annotation.width}
                        height={annotation.height}
                        stroke="black"
                        strokeWidth="1"
                        fill="none"
                        onPress={() => handleAnnotationPress(annotation.id)}
                      />
                    )}
                    {annotation.type === 'circle' && (
                      <Circle
                        cx={annotation.x + annotation.radius}
                        cy={annotation.y + annotation.radius}
                        r={annotation.radius}
                        stroke="black"
                        strokeWidth="1"
                        fill="none"
                        onPress={() => handleAnnotationPress(annotation.id)}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          </PanGestureHandler>
        </PinchGestureHandler>
      </View>

      {ocrText && (
        <View style={styles.ocrContainer}>
          <Text style={styles.ocrTitle}>Extracted Text:</Text>
          <ScrollView style={styles.ocrTextContainer}>
            <Text>{ocrText}</Text>
          </ScrollView>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  },
  editorContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  ocrContainer: {
    height: 200,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
  },
  ocrTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ocrTextContainer: {
    flex: 1,
  },
});

export default PDFEditor;
