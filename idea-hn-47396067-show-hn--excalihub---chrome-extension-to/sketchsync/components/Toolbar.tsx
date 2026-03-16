import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useDrawingStore } from '@/store/useDrawingStore';

const tools = [
  { name: 'pen', icon: 'pencil' },
  { name: 'eraser', icon: 'eraser' },
  { name: 'rectangle', icon: 'square' },
  { name: 'circle', icon: 'circle' },
  { name: 'line', icon: 'minus' },
];

const colors = ['black', 'red', 'blue', 'green', 'yellow'];

export function Toolbar() {
  const { currentTool, setCurrentTool, currentColor, setCurrentColor, undo, redo } = useDrawingStore();

  return (
    <View style={styles.container}>
      <View style={styles.tools}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.name}
            style={[
              styles.toolButton,
              currentTool === tool.name && styles.activeTool,
            ]}
            onPress={() => setCurrentTool(tool.name)}
          >
            {/* Replace with actual icons */}
            <View style={styles.icon} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.colors}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              currentColor === color && styles.activeColor,
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={undo}>
          {/* Undo icon */}
          <View style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={redo}>
          {/* Redo icon */}
          <View style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  tools: {
    flexDirection: 'row',
    marginRight: 10,
  },
  toolButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  activeTool: {
    backgroundColor: '#007AFF',
  },
  colors: {
    flexDirection: 'row',
    marginRight: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeColor: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  icon: {
    width: 20,
    height: 20,
    backgroundColor: '#ccc',
  },
});
