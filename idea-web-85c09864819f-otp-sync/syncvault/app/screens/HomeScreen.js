import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../../App';
import OTPList from '../components/OTPList';
import SMSScreen from './SMSScreen';
import { generateTOTP, getTimeRemaining } from '../utils/otp';
import { startSMSListener } from '../utils/smsListener';

const HomeScreen = ({ navigation }) => {
  const [otpAccounts, setOtpAccounts] = useState([]);
  const [otps, setOtps] = useState([]);
  const [activeTab, setActiveTab] = useState('otp');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'otpAccounts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOtpAccounts(accounts);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    startSMSListener();
  }, []);

  useEffect(() => {
    const updateOTPs = () => {
      const updatedOtps = otpAccounts.map(account => ({
        id: account.id,
        name: account.name,
        code: generateTOTP(account.secret),
        timeRemaining: getTimeRemaining(),
      }));
      setOtps(updatedOtps);
    };

    updateOTPs();
    const interval = setInterval(updateOTPs, 1000);

    return () => clearInterval(interval);
  }, [otpAccounts]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SyncVault</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'otp' && styles.activeTab]}
          onPress={() => setActiveTab('otp')}
        >
          <Text style={[styles.tabText, activeTab === 'otp' && styles.activeTabText]}>
            OTP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sms' && styles.activeTab]}
          onPress={() => setActiveTab('sms')}
        >
          <Text style={[styles.tabText, activeTab === 'sms' && styles.activeTabText]}>
            SMS
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'otp' ? (
        <>
          <Text style={styles.sectionTitle}>OTP Accounts</Text>
          
          {otps.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No OTP accounts yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first account</Text>
            </View>
          ) : (
            <OTPList otps={otps} />
          )}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddOTP')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </>
      ) : (
        <SMSScreen />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  signOutText: {
    fontSize: 16,
    color: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default HomeScreen;
