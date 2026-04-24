import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, TextInput, Card, Avatar, IconButton } from 'react-native-paper';

interface ComponentTemplate {
  type: string;
  defaultProps: Record<string, any>;
  defaultPosition?: {
    width?: string | number;
    height?: string | number;
  };
  render: (props: Record<string, any>) => React.ReactNode;
  category: string;
  description: string;
}

export function useComponentTemplates(): ComponentTemplate[] {
  return [
    {
      type: 'button',
      defaultProps: {
        label: 'Button',
        variant: 'contained',
        color: '#6200ee',
      },
      defaultPosition: {
        width: 150,
        height: 50,
      },
      render: (props) => (
        <Button
          mode={props.variant || 'contained'}
          style={{ backgroundColor: props.color || '#6200ee' }}
        >
          {props.label || 'Button'}
        </Button>
      ),
      category: 'basic',
      description: 'A clickable button with customizable text and style',
    },
    {
      type: 'text',
      defaultProps: {
        content: 'Sample text',
        variant: 'bodyMedium',
        color: '#000000',
      },
      render: (props) => (
        <Text
          variant={props.variant || 'bodyMedium'}
          style={{ color: props.color || '#000000' }}
        >
          {props.content || 'Sample text'}
        </Text>
      ),
      category: 'basic',
      description: 'Display text with different styles and colors',
    },
    {
      type: 'input',
      defaultProps: {
        label: 'Input',
        placeholder: 'Enter text...',
        mode: 'outlined',
      },
      defaultPosition: {
        width: '100%',
        height: 60,
      },
      render: (props) => (
        <TextInput
          label={props.label || 'Input'}
          placeholder={props.placeholder || 'Enter text...'}
          mode={props.mode || 'outlined'}
        />
      ),
      category: 'forms',
      description: 'Text input field for user data entry',
    },
    {
      type: 'card',
      defaultProps: {
        title: 'Card Title',
        content: 'Card content goes here',
        elevation: 2,
      },
      defaultPosition: {
        width: '100%',
        height: 150,
      },
      render: (props) => (
        <Card elevation={props.elevation || 2}>
          <Card.Title title={props.title || 'Card Title'} />
          <Card.Content>
            <Text>{props.content || 'Card content goes here'}</Text>
          </Card.Content>
        </Card>
      ),
      category: 'layout',
      description: 'Container for grouping related content with elevation',
    },
    {
      type: 'image',
      defaultProps: {
        source: 'https://via.placeholder.com/150',
        resizeMode: 'cover',
      },
      defaultPosition: {
        width: 150,
        height: 150,
      },
      render: (props) => (
        <Image
          source={{ uri: props.source || 'https://via.placeholder.com/150' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode={props.resizeMode || 'cover'}
        />
      ),
      category: 'media',
      description: 'Display an image with customizable source and resize mode',
    },
    {
      type: 'header',
      defaultProps: {
        title: 'App Header',
        showBackButton: true,
      },
      defaultPosition: {
        width: '100%',
        height: 60,
      },
      render: (props) => (
        <View style={styles.header}>
          {props.showBackButton && (
            <IconButton icon="arrow-left" size={24} />
          )}
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {props.title || 'App Header'}
          </Text>
        </View>
      ),
      category: 'navigation',
      description: 'App header with title and optional back button',
    },
    {
      type: 'footer',
      defaultProps: {
        items: [
          { label: 'Home', icon: 'home' },
          { label: 'Profile', icon: 'account' },
        ],
      },
      defaultPosition: {
        width: '100%',
        height: 60,
      },
      render: (props) => (
        <View style={styles.footer}>
          {props.items?.map((item: any, index: number) => (
            <View key={index} style={styles.footerItem}>
              <IconButton icon={item.icon} size={24} />
              <Text style={styles.footerLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      ),
      category: 'navigation',
      description: 'Bottom navigation bar with icons and labels',
    },
    {
      type: 'feed',
      defaultProps: {
        itemType: 'post',
        showActions: true,
      },
      defaultPosition: {
        width: '100%',
        height: 'auto',
      },
      render: (props) => (
        <View style={styles.feed}>
          {[1, 2, 3].map((item) => (
            <Card key={item} style={styles.feedItem}>
              <Card.Title
                title="User Name"
                subtitle="2 hours ago"
                left={(props) => <Avatar.Text size={40} label="UN" />}
              />
              <Card.Content>
                <Text>This is a sample {props.itemType || 'post'} content.</Text>
              </Card.Content>
              {props.showActions && (
                <Card.Actions>
                  <IconButton icon="heart" size={20} />
                  <IconButton icon="comment" size={20} />
                  <IconButton icon="share" size={20} />
                </Card.Actions>
              )}
            </Card>
          ))}
        </View>
      ),
      category: 'social',
      description: 'Feed of items with user avatars and action buttons',
    },
    {
      type: 'profile_header',
      defaultProps: {
        name: 'User Name',
        bio: 'User bio goes here',
        showEditButton: true,
      },
      defaultPosition: {
        width: '100%',
        height: 150,
      },
      render: (props) => (
        <View style={styles.profileHeader}>
          <Avatar.Text size={80} label="UN" style={styles.profileAvatar} />
          <Text variant="headlineSmall" style={styles.profileName}>
            {props.name || 'User Name'}
          </Text>
          <Text style={styles.profileBio}>{props.bio || 'User bio goes here'}</Text>
          {props.showEditButton && (
            <Button mode="outlined" style={styles.editButton}>
              Edit Profile
            </Button>
          )}
        </View>
      ),
      category: 'social',
      description: 'Profile header with avatar, name, bio, and edit button',
    },
    {
      type: 'product_grid',
      defaultProps: {
        columns: 2,
        showPrice: true,
      },
      defaultPosition: {
        width: '100%',
        height: 'auto',
      },
      render: (props) => (
        <View style={styles.productGrid}>
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} style={styles.productCard}>
              <Card.Cover source={{ uri: 'https://via.placeholder.com/150' }} />
              <Card.Content>
                <Text variant="titleMedium">Product {item}</Text>
                {props.showPrice && (
                  <Text variant="bodyMedium" style={styles.productPrice}>
                    $19.99
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      ),
      category: 'ecommerce',
      description: 'Grid of products with images and prices',
    },
  ];
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
  },
  feed: {
    padding: 8,
  },
  feedItem: {
    marginBottom: 8,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 16,
  },
  profileAvatar: {
    marginBottom: 8,
  },
  profileName: {
    marginBottom: 4,
  },
  profileBio: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  editButton: {
    marginTop: 8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  productCard: {
    width: '48%',
    marginBottom: 8,
  },
  productPrice: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
