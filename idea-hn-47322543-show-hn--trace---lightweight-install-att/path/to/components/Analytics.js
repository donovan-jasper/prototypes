import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { db } from '../services/AnalyticsService';

const Analytics = () => {
  const [installCount, setInstallCount] = useState(0);
  const [deepLinkCount, setDeepLinkCount] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const installCount = await db.getInstallCount();
        const deepLinkCount = await db.getDeepLinkCount();
        setInstallCount(installCount);
        setDeepLinkCount(deepLinkCount);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <View>
      <Text>Analytics</Text>
      <Text>Install Count: {installCount}</Text>
      <Text>Deep Link Count: {deepLinkCount}</Text>
    </View>
  );
};

export default Analytics;
