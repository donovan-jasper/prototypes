import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface SkillTreeProps {
  skills: Array<{ id: string; name: string; x: number; y: number; unlocked: boolean }>;
  connections: Array<{ from: string; to: string }>;
}

const SkillTree: React.FC<SkillTreeProps> = ({ skills, connections }) => {
  return (
    <View style={{ flex: 1 }}>
      <Svg height="100%" width="100%">
        {connections.map((connection, index) => {
          const fromSkill = skills.find(skill => skill.id === connection.from);
          const toSkill = skills.find(skill => skill.id === connection.to);
          if (fromSkill && toSkill) {
            return (
              <Line
                key={index}
                x1={fromSkill.x}
                y1={fromSkill.y}
                x2={toSkill.x}
                y2={toSkill.y}
                stroke="black"
                strokeWidth="2"
              />
            );
          }
          return null;
        })}
        {skills.map((skill) => (
          <Circle
            key={skill.id}
            cx={skill.x}
            cy={skill.y}
            r="20"
            fill={skill.unlocked ? 'green' : 'gray'}
          />
        ))}
      </Svg>
      {skills.map((skill) => (
        <View key={skill.id} style={{ position: 'absolute', left: skill.x - 20, top: skill.y - 20 }}>
          <Text>{skill.name}</Text>
        </View>
      ))}
    </View>
  );
};

export default SkillTree;
