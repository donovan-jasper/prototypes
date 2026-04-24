import React, { useState, useRef, useEffect } from 'react';
import { View, Button, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, Alert, ScrollView } from 'react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Circle, Rect, Path, Text as SvgText } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { createWorker } from 'tesseract.js';
import Pdf from 'react-native-pdf';

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
    if (editedPdf) {
      try {
        const fileUri = FileSystem.documentDirectory + 'edited.pdf';
        await FileSystem.writeAsStringAsync(fileUri, editedPdf, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Save to SQLite
        const fileData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await saveFile('edited.pdf', fileData);
        onSave(fileData);
        Alert.alert('Success', 'PDF saved successfully!');
      } catch (error) {
        console.error('Save Error:', error);
        Alert.alert('Error', 'Failed to save PDF');
      }
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

  const handleGestureStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (currentAnnotation) {
        setAnnotations([...annotations, currentAnnotation]);
        setCurrentAnnotation(null);
      }
    }
  };

  const handlePinchGesture = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setScale(scale * event.nativeEvent.scale);
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

  const renderAnnotations = () => {
    return annotations.map((annotation, index) => {
      if (annotation.type === 'text') {
        return (
          <SvgText
            key={`text-${index}`}
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
            key={`rect-${index}`}
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
            key={`circle-${index}`}
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

  const renderCurrentAnnotation = () => {
    if (!currentAnnotation) return null;

    if (currentAnnotation.type === 'text') {
      return (
        <SvgText
          x={currentAnnotation.x}
          y={currentAnnotation.y}
          fontSize="12"
          fill="black"
        >
          {currentAnnotation.text}
        </SvgText>
      );
    } else if (currentAnnotation.type === 'rectangle') {
      return (
        <Rect
          x={currentAnnotation.x}
          y={currentAnnotation.y}
          width={currentAnnotation.width}
          height={currentAnnotation.height}
          stroke="black"
          strokeWidth="1"
          fill="none"
        />
      );
    } else if (currentAnnotation.type === 'circle') {
      return (
        <Circle
          cx={currentAnnotation.x + currentAnnotation.radius}
          cy={currentAnnotation.y + currentAnnotation.radius}
          r={currentAnnotation.radius}
          stroke="black"
          strokeWidth="1"
          fill="none"
        />
      );
    }
    return null;
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
          style={[styles.toolButton, tool === 'eraser' && styles.activeTool]}
          onPress={() => setTool('eraser')}
        >
          <Text style={styles.toolButtonText}>Eraser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={handleOCR}
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

      <View style={styles.pdfContainer}>
        <PinchGestureHandler
          onGestureEvent={handlePinchGesture}
          onHandlerStateChange={handlePinchGesture}
        >
          <PanGestureHandler
            onGestureEvent={handlePanGesture}
            onHandlerStateChange={handlePanGesture}
          >
            <View style={styles.pdfWrapper}>
              <Pdf
                ref={pdfRef}
                source={{ uri: `data:application/pdf;base64,${pdfData}` }}
                style={styles.pdf}
                scale={scale}
                horizontal={true}
                enablePaging={true}
                spacing={10}
              />
              <Svg
                ref={svgRef}
                style={StyleSheet.absoluteFill}
                width={width}
                height={height}
              >
                {renderAnnotations()}
                {renderCurrentAnnotation()}
              </Svg>
              <PanGestureHandler
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleGestureStateChange}
              >
                <View style={StyleSheet.absoluteFill} />
              </PanGestureHandler>
            </View>
          </PanGestureHandler>
        </PinchGestureHandler>
      </View>

      {ocrText && (
        <ScrollView style={styles.ocrResult}>
          <Text>{ocrText}</Text>
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Apply Changes" onPress={handleEdit} />
        <Button title="Save PDF" onPress={handleSave} />
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
    borderBottomColor: '#ccc',
  },
  toolButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeTool: {
    backgroundColor: '#4CAF50',
  },
  toolButtonText: {
    color: '#fff',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    margin: 10,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdfWrapper: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
  ocrResult: {
    maxHeight: 150,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default PDFEditor;
