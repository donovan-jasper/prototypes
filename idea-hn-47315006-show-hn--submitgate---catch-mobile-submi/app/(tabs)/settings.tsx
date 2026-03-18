import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';

export default function SettingsScreen() {
  const { isPremium } = useStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={[styles.badge, isPremium ? styles.premiumBadge : styles.freeBadge]}>
                <Text style={[styles.badgeText, isPremium ? styles.premiumBadgeText : styles.freeBadgeText]}>
                  {isPremium ? 'Premium' : 'Free'}
                </Text>
              </View>
            </View>

            {!isPremium && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.upgradeButton}>
                  <Ionicons name="star" size={20} color="#FFFFFF" style={styles.upgradeIcon} />
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
                <Text style={styles.priceText}>$6.99/month or $49.99/year</Text>

                <View style={styles.benefitsContainer}>
                  <View style={styles.benefit}>
                    <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                    <Text style={styles.benefitText}>Unlimited scans</Text>
                  </View>
                  <View style={styles.benefit}>
                    <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                    <Text style={styles.benefitText}>Advanced compliance checks</Text>
                  </View>
                  <View style={styles.benefit}>
                    <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                    <Text style={styles.benefitText}>PDF report exports</Text>
                  </View>
                  <View style={styles.benefit}>
                    <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                    <Text style={styles.benefitText}>Unlimited scan history</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2026.03.18</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#3C3C43',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    backgroundColor: '#FFD60A',
  },
  freeBadge: {
    backgroundColor: '#E5E5EA',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  premiumBadgeText: {
    color: '#000000',
  },
  freeBadgeText: {
    color: '#3C3C43',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
  benefitsContainer: {
    marginTop: 20,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 15,
    color: '#3C3C43',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#3C3C43',
  },
  infoValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
