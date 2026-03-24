import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const TaskExecutor = () => {
  const [tasks, setTasks] = useState([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const executeTasks = async () => {
      if (running) return;
      setRunning(true);
      // Execute tasks here
      setRunning(false);
    };
    executeTasks();
  }, [tasks, running]);

  const handleAddTask = (task) => {
    setTasks([...tasks, task]);
  };

  return (
    <View>
      <Text>Task Executor</Text>
      {tasks.map((task, index) => (
        <Text key={index}>{task}</Text>
      ))}
      <TouchableOpacity onPress={() => handleAddTask('New Task')}>
        <Text>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskExecutor;
