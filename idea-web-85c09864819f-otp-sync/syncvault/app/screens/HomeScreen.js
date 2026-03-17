import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OTPList from '../components/OTPList';
import SMSList from '../components/SMSList';
import { generateOTP } from '../utils/otp';
import { getSMSS } from '../utils/sms';

const HomeScreen = () => {
  const [otps, setOtps] = useState([]);
  const [smss, setSmss] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const otps = await generateOTP();
      const smss = await getSMSS();
      setOtps(otps);
      setSmss(smss);
    };

    fetchData();

    // Update OTP codes every second
    const interval = setInterval(async () => {
      const updatedOtps = await generateOTP();
      setOtps(updatedOtps);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SyncVault</Text>
      <Text style={styles.sectionTitle}>OTPs</Text>
      <OTPList otps={otps} />
      <Text style={styles.sectionTitle}>SMSs</Text>
      <SMSList smss={smss} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default HomeScreen;
