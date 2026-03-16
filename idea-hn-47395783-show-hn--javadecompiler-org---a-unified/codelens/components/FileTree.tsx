import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const FileTree = ({ files }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (path) => {
    setExpanded({ ...expanded, [path]: !expanded[path] });
  };

  const renderItem = ({ item }) => {
    if (item.type === 'file') {
      return (
        <TouchableOpacity style={{ padding: 8 }}>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View>
          <TouchableOpacity onPress={() => toggleExpand(item.path)} style={{ padding: 8 }}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
          {expanded[item.path] && (
            <FlatList
              data={item.children}
              keyExtractor={(child) => child.path}
              renderItem={renderItem}
            />
          )}
        </View>
      );
    }
  };

  return (
    <View style={{ width: 200, borderRightWidth: 1, borderRightColor: '#ccc' }}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={renderItem}
      />
    </View>
  );
};

export default FileTree;
