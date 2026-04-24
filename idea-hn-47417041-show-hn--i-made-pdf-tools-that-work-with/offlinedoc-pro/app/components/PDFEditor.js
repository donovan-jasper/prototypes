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

  const handlePinchGesture = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newScale = scale * event.nativeEvent.scale;
      setScale(newScale);
    }
  };

  const handlePanGesture = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newTranslateX = lastTranslateX + event.nativeEvent.translationX;
      const newTranslateY = lastTranslateY + event.nativeEvent.translationY;
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
    } else if (event.nativeEvent.state === State.END) {
      setLastTranslateX(translateX);
      setLastTranslateY(translateY);
    }
  };

  const handleOCR = async () => {
    if (ocrLimitReached) {
      Alert.alert('OCR Limit Reached', 'You have reached your daily OCR limit. Please upgrade to use more.');
      return;
    }

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(pdfData);
      await worker.terminate();
      setOcrText(text);
      updateOcrUsage();
    } catch (error) {
      Alert.alert('OCR Error', 'Failed to perform OCR. Please try again.');
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
            fontSize={12}
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
          fontSize={12}
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
        <TouchableOpacity onPress={() => setTool('text')} style={[styles.toolButton, tool === 'text' && styles.activeTool]}>
          <Text>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTool('rectangle')} style={[styles.toolButton, tool === 'rectangle' && styles.activeTool]}>
          <Text>Rectangle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTool('circle')} style={[styles.toolButton, tool === 'circle' && styles.activeTool]}>
          <Text>Circle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOCR} style={styles.toolButton}>
          <Text>OCR</Text>
        </TouchableOpacity>
      </View>

      {tool === 'text' && (
        <TextInput
          style={styles.textInput}
          placeholder="Enter text annotation"
          value={textInput}
          onChangeText={setTextInput}
        />
      )}

      <PinchGestureHandler onGestureEvent={handlePinchGesture}>
        <PanGestureHandler onGestureEvent={handlePanGesture}>
          <View style={styles.pdfContainer}>
            <Pdf
              ref={pdfRef}
              source={{ uri: `data:application/pdf;base64,${pdfData.toString('base64')}` }}
              style={styles.pdf}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={(error) => {
                console.log(error);
              }}
              scale={scale}
              horizontal={true}
              enablePaging={true}
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
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.END) {
                  handleGestureEnd();
                }
              }}
            >
              <View style={StyleSheet.absoluteFill} />
            </PanGestureHandler>
          </View>
        </PanGestureHandler>
      </PinchGestureHandler>

      {ocrText && (
        <ScrollView style={styles.ocrResult}>
          <Text>{ocrText}</Text>
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Edit PDF" onPress={handleEdit} />
        <Button title="Save" onPress={handleSave} />
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
    marginRight: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeTool: {
    backgroundColor: '#bbb',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
  ocrResult: {
    height: 150,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default PDFEditor;
