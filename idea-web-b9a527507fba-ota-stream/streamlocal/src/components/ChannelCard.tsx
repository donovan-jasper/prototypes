import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface ChannelCardProps {
  channel: {
    id: string;
    name: string;
    logo: string;
    currentProgram: string;
    nextProgram: string;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, isFavorite, onToggleFavorite }) => {
  const navigation = useNavigation();

  return (
    <Card style={{ margin: 8 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Player', { channelId: channel.id })}>
        <Card.Cover source={{ uri: channel.logo }} />
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{channel.name}</Text>
            <IconButton
              icon={isFavorite ? 'star' : 'star-outline'}
              onPress={onToggleFavorite}
            />
          </View>
          <Text style={{ fontSize: 16 }}>{channel.currentProgram}</Text>
          <Text style={{ fontSize: 14, color: 'gray' }}>Next: {channel.nextProgram}</Text>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

export default ChannelCard;
