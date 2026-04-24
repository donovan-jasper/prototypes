import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { formatTime } from '../utils/time';

interface TimerProps {
  widgetId: string;
}

const Timer: React.FC<TimerProps> = ({ widgetId }) => {
  const { currentTheme } = useAppStore();
  const [time, setTime] = useState(25 * 60); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState(25);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(preset * 60);
  };

  const handlePresetChange = (minutes: number) => {
    setPreset(minutes);
    setTime(minutes * 60);
    if (!isRunning) {
      setTime(minutes * 60);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.widgetBackground }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>Pomodoro Timer</Text>

      <View style={styles.timeDisplay}>
        <Text style={[styles.timeText, { color: currentTheme.text }]}>
          {formatTime(time)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: currentTheme.text }]}
          onPress={handleStartStop}
        >
          <Text style={[styles.controlButtonText, { color: currentTheme.widgetBackground }]}>
            {isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: currentTheme.text }]}
          onPress={handleReset}
        >
          <Text style={[styles.controlButtonText, { color: currentTheme.widgetBackground }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presets}>
        {[5, 15, 25, 50].map(minutes => (
          <TouchableOpacity
            key={minutes}
            style={[
              styles.presetButton,
              preset === minutes && { backgroundColor: currentTheme.text },
              { borderColor: currentTheme.text }
            ]}
            onPress={() => handlePresetChange(minutes)}
          >
            <Text style={[
              styles.presetText,
              preset === minutes && { color: currentTheme.widgetBackground },
              { color: currentTheme.text }
            ]}>
              {minutes}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timeDisplay: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
  },
});

export default Timer;
