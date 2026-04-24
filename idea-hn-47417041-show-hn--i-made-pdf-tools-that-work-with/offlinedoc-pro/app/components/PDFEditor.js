import React, { useState, useRef } from 'react';
import { View, Button, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Svg, { Circle, Rect, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const PDFEditor = ({ pdfData, onSave }) => {
  const [editedPdf, setEditedPdf] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [tool, setTool] = useState('text');
  const svgRef = useRef(null);

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
        <Button title="Text" onPress={() => setTool('text')} />
        <Button title="Rectangle" onPress={() => setTool('rectangle')} />
        <Button title="Circle" onPress={() => setTool('circle')} />
        <Button title="Edit PDF" onPress={handleEdit} />
        <Button title="Save PDF" onPress={handleSave} />
      </View>

      {tool === 'text' && (
        <TextInput
          style={styles.textInput}
          placeholder="Enter text annotation"
          value={textInput}
          onChangeText={setTextInput}
        />
      )}

      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onEnded={handleGestureEnd}
      >
        <View style={styles.canvas}>
          {renderAnnotations()}
          {currentAnnotation && currentAnnotation.type === 'text' && (
            <Text
              style={{
                position: 'absolute',
                left: currentAnnotation.x,
                top: currentAnnotation.y,
                fontSize: 12,
                color: 'black',
              }}
            >
              {currentAnnotation.text}
            </Text>
          )}
          {currentAnnotation && currentAnnotation.type === 'rectangle' && (
            <View
              style={{
                position: 'absolute',
                left: currentAnnotation.x,
                top: currentAnnotation.y,
                width: currentAnnotation.width,
                height: currentAnnotation.height,
                borderWidth: 1,
                borderColor: 'black',
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
                borderColor: 'black',
              }}
            />
          )}
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5,
  },
});

export default PDFEditor;
