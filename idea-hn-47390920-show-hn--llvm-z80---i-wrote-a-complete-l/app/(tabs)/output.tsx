import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type OutputTab = 'hex' | 'asm' | 'logs';

export default function OutputScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<OutputTab>('logs');

  const mockHexDump = `00000000  48 65 6c 6c 6f 2c 20 57  6f 72 6c 64 21 0a 00 00  |Hello, World!...|
00000010  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|`;

  const mockAssembly = `main:
    push   rbp
    mov    rbp, rsp
    lea    rdi, [rip + .L.str]
    call   puts
    xor    eax, eax
    pop    rbp
    ret

.L.str:
    .asciz "Hello, World!"`;

  const mockLogs = `[INFO] Starting compilation...
[INFO] Target: x86 (32-bit)
[INFO] Language: C
[INFO] Parsing source code...
[INFO] Generating intermediate representation...
[INFO] Optimizing code...
[INFO] Generating machine code...
[SUCCESS] Compilation completed successfully
[INFO] Output size: 8,432 bytes
[INFO] Time elapsed: 1.24s`;

  const renderContent = () => {
    switch (activeTab) {
      case 'hex':
        return (
          <Text style={[styles.outputText, isDark && styles.outputTextDark]}>
            {mockHexDump}
          </Text>
        );
      case 'asm':
        return (
          <Text style={[styles.outputText, isDark && styles.outputTextDark]}>
            {mockAssembly}
          </Text>
        );
      case 'logs':
        return (
          <Text style={[styles.outputText, isDark && styles.outputTextDark]}>
            {mockLogs}
          </Text>
        );
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>Output</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="share-outline" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'logs' && styles.tabActive,
            isDark && styles.tabDark,
            activeTab === 'logs' && isDark && styles.tabActiveDark,
          ]}
          onPress={() => setActiveTab('logs')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'logs' && styles.tabTextActive,
              isDark && styles.textDark,
            ]}>
            Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'hex' && styles.tabActive,
            isDark && styles.tabDark,
            activeTab === 'hex' && isDark && styles.tabActiveDark,
          ]}
          onPress={() => setActiveTab('hex')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'hex' && styles.tabTextActive,
              isDark && styles.textDark,
            ]}>
            Hex Dump
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'asm' && styles.tabActive,
            isDark && styles.tabDark,
            activeTab === 'asm' && isDark && styles.tabActiveDark,
          ]}
          onPress={() => setActiveTab('asm')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'asm' && styles.tabTextActive,
              isDark && styles.textDark,
            ]}>
            Assembly
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.outputContainer} contentContainerStyle={styles.outputContent}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  exportButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  tabDark: {
    backgroundColor: '#2a2a2a',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabActiveDark: {
    backgroundColor: '#0A84FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  outputContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  outputContent: {
    padding: 16,
  },
  outputText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#000',
    lineHeight: 18,
  },
  outputTextDark: {
    color: '#fff',
  },
});
