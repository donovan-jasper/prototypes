import React, { useState, useRef, useEffect } from 'react';
import { View, Button, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, Alert } from 'react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { createWorker } from 'tesseract.js';

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
  const svgRef = useRef(null);
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

  const handleEdit = async () => {
    const pdfDoc = await PDFDocument.load(pdfData);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text annotations
    annotations.forEach(annotation => {
      if (annotation.type === 'text') {
        firstPage.drawText(annotation.text, {
          x: annotation.x,
          y: firstPage.getHeight() - annotation.y,
          size: 12,
          color: rgb(0, 0, 0),
        });
      } else if (annotation.type === 'rectangle') {
        firstPage.drawRectangle({
          x: annotation.x,
          y: firstPage.getHeight() - annotation.y - annotation.height,
          width: annotation.width,
          height: annotation.height,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      } else if (annotation.type === 'circle') {
        firstPage.drawCircle({
          x: annotation.x + annotation.radius,
          y: firstPage.getHeight() - annotation.y - annotation.radius,
          radius: annotation.radius,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      }
    });

    const editedPdfBytes = await pdfDoc.save();
    setEditedPdf(editedPdfBytes);
  };

  const handleSave = () => {
    if (editedPdf) {
      onSave(editedPdf);
    }
  };

  const handleGestureEvent = (event) => {
    if (tool === 'text') {
      setCurrentAnnotation({
        type: 'text',
        x: event.nativeEvent.x,
        y: event.nativeEvent.y,
        text: textInput,
      });
    } else if (tool === 'rectangle') {
      if (!currentAnnotation) {
        setCurrentAnnotation({
          type: 'rectangle',
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
          width: 0,
          height: 0,
        });
      } else {
        const newWidth = event.nativeEvent.x - currentAnnotation.x;
        const newHeight = event.nativeEvent.y - currentAnnotation.y;
        setCurrentAnnotation({
          ...currentAnnotation,
          width: newWidth,
          height: newHeight,
        });
      }
    } else if (tool === 'circle') {
      if (!currentAnnotation) {
        setCurrentAnnotation({
          type: 'circle',
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
          radius: 0,
        });
      } else {
        const dx = event.nativeEvent.x - currentAnnotation.x;
        const dy = event.nativeEvent.y - currentAnnotation.y;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        setCurrentAnnotation({
          ...currentAnnotation,
          radius: newRadius,
        });
      }
    }
  };

  const handleGestureEnd = () => {
    if (currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }
  };

  const handleOcr = async () => {
    if (ocrLimitReached) {
      Alert.alert(
        'OCR Limit Reached',
        'You have reached your free tier limit of 3 OCR operations per month. Please upgrade to continue.'
      );
      return;
    }

    try {
      const worker = await createWorker({
        logger: m => console.log(m),
      });

      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      // In a real app, you would extract the image data from the PDF
      // For this example, we'll use a sample image
      const { data: { text } } = await worker.recognize(
        'https://tesseract.projectnaptha.com/img/eng_bw.png'
      );

      setOcrText(text);
      updateOcrUsage();

      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert('OCR Error', 'Failed to perform OCR. Please try again.');
    }
  };

  const renderAnnotations = () => {
    return annotations.map((annotation, index) => {
      if (annotation.type === 'text') {
        return (
          <Text
            key={index}
            style={{
              position: 'absolute',
              left: annotation.x,
              top: annotation.y,
              fontSize: 12,
              color: 'black',
            }}
          >
            {annotation.text}
          </Text>
        );
      } else if (annotation.type === 'rectangle') {
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: annotation.x,
              top: annotation.y,
              width: annotation.width,
              height: annotation.height,
              borderWidth: 1,
              borderColor: 'black',
            }}
          />
        );
      } else if (annotation.type === 'circle') {
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: annotation.x - annotation.radius,
              top: annotation.y - annotation.radius,
              width: annotation.radius * 2,
              height: annotation.radius * 2,
              borderRadius: annotation.radius,
              borderWidth: 1,
              borderColor: 'black',
            }}
          />
        );
      }
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolButton, tool === 'text' && styles.activeTool]}
          onPress={() => setTool('text')}
        >
          <Text style={styles.toolButtonText}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, tool === 'rectangle' && styles.activeTool]}
          onPress={() => setTool('rectangle')}
        >
          <Text style={styles.toolButtonText}>Rectangle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, tool === 'circle' && styles.activeTool]}
          onPress={() => setTool('circle')}
        >
          <Text style={styles.toolButtonText}>Circle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={handleOcr}
          disabled={ocrLimitReached}
        >
          <Text style={styles.toolButtonText}>OCR</Text>
        </TouchableOpacity>
      </View>

      {tool === 'text' && (
        <TextInput
          style={styles.textInput}
          placeholder="Enter text"
          value={textInput}
          onChangeText={setTextInput}
        />
      )}

      <View style={styles.canvasContainer}>
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === 5) { // STATE_END
              handleGestureEnd();
            }
          }}
        >
          <View style={styles.canvas}>
            {renderAnnotations()}
            {currentAnnotation && currentAnnotation.type === 'rectangle' && (
              <View
                style={{
                  position: 'absolute',
                  left: currentAnnotation.x,
                  top: currentAnnotation.y,
                  width: currentAnnotation.width,
                  height: currentAnnotation.height,
                  borderWidth: 1,
                  borderColor: 'blue',
                  borderStyle: 'dashed',
                }}
              />
            )}
            {currentAnnotation && currentAnnotation.type === 'circle' && (
              <View
                style={{
                  position: 'absolute',
                  left: currentAnnotation.x - currentAnnotation.radius,
                  top: currentAnnotation.y - currentAnnotation.radius,
                  width: currentAnnotation.radius * 2,
                  height: currentAnnotation.radius * 2,
                  borderRadius: currentAnnotation.radius,
                  borderWidth: 1,
                  borderColor: 'blue',
                  borderStyle: 'dashed',
                }}
              />
            )}
          </View>
        </PanGestureHandler>
      </View>

      {ocrText && (
        <View style={styles.ocrResult}>
          <Text style={styles.ocrTitle}>OCR Result:</Text>
          <Text style={styles.ocrText}>{ocrText}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Edit PDF" onPress={handleEdit} />
        <Button title="Save" onPress={handleSave} disabled={!editedPdf} />
      </View>
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
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  toolButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  activeTool: {
    backgroundColor: '#a0a0ff',
  },
  toolButtonText: {
    fontSize: 14,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 10,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  ocrResult: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  ocrTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ocrText: {
    fontSize: 14,
  },
});

export default PDFEditor;
