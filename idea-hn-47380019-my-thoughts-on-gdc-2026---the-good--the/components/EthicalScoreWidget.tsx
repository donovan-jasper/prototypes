import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  score: number;
}

export default function EthicalScoreWidget({ score }: Props) {
  const getScoreLevel = () => {
    if (score >= 80) return 'Exemplary';
    if (score >= 60) return 'Ethical';
    if (score >= 40) return 'Improving';
    return 'Beginner';
  };

  return (
    <TouchableOpacity style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 20, 
      backgroundColor: '#e3f2fd', 
      borderRadius: 10 
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{score}%</Text>
      <Text>Ethical Score</Text>
      <Text>({getScoreLevel()})</Text>
    </TouchableOpacity>
  );
}
