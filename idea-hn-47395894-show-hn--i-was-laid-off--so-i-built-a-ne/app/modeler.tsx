import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card, Divider } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import PremiumGate from '../components/PremiumGate';
import { calculateEquityValue, calculateTaxImpact, calculateAMT, calculateScenarioValues } from '../lib/calculations';
import { useEquityStore } from '../store/equityStore';
import ScenarioChart from '../components/ScenarioChart';

interface ScenarioForm {
  valuation: string;
  saleType: 'ipo' | 'acquisition' | 'secondary';
  holdingPeriod: 'short' | 'long';
  annualIncome: string;
  exercisePrice: string;
}

export default function ScenarioModeler() {
  const [results, setResults] = useState<{
    equityValue: number;
    taxImpact: number;
    amtImpact: number;
    chartData: { x: number; y: number }[];
  } | null>(null);

  const { equities } = useEquityStore();

  const { control, handleSubmit, watch } = useForm<ScenarioForm>({
    defaultValues: {
      valuation: '10000000',
      saleType: 'ipo',
      holdingPeriod: 'short',
      annualIncome: '100000',
      exercisePrice: '10'
    }
  });

  const saleType = watch('saleType');

  const onSubmit = (data: ScenarioForm) => {
    const valuation = parseFloat(data.valuation);
    const annualIncome = parseFloat(data.annualIncome);
    const exercisePrice = parseFloat(data.exercisePrice);

    // Calculate based on user's actual equity positions
    let totalEquityValue = 0;
    let totalTaxImpact = 0;
    let totalAmtImpact = 0;

    equities.forEach(equity => {
      const equityValue = calculateEquityValue(equity.shares, equity.strikePrice, valuation / 1000000);
      const taxImpact = calculateTaxImpact(equityValue, data.holdingPeriod, annualIncome);
      const amtImpact = calculateAMT(equity.shares, exercisePrice, valuation / 1000000);
      totalEquityValue += equityValue;
      totalTaxImpact += taxImpact;
      totalAmtImpact += amtImpact;
    });

    // Generate chart data based on user's equity
    const valuationRange = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4];
    const chartData = calculateScenarioValues(
      equities.map(e => ({
        shares: e.shares,
        strikePrice: e.strikePrice,
        currentPrice: e.currentPrice
      })),
      valuationRange
    );

    setResults({
      equityValue: totalEquityValue,
      taxImpact: totalTaxImpact,
      amtImpact: totalAmtImpact,
      chartData
    });
  };

  return (
    <PremiumGate feature="Scenario Modeler">
      <ScrollView style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Scenario Modeler
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Equity Scenario</Text>

            <Controller
              control={control}
              name="valuation"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Company Valuation ($)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="saleType"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={[
                    { value: 'ipo', label: 'IPO' },
                    { value: 'acquisition', label: 'Acquisition' },
                    { value: 'secondary', label: 'Secondary Sale' }
                  ]}
                  style={styles.segmented}
                />
              )}
            />

            {saleType === 'secondary' && (
              <>
                <Controller
                  control={control}
                  name="holdingPeriod"
                  render={({ field: { onChange, value } }) => (
                    <SegmentedButtons
                      value={value}
                      onValueChange={onChange}
                      buttons={[
                        { value: 'short', label: 'Short-term' },
                        { value: 'long', label: 'Long-term' }
                      ]}
                      style={styles.segmented}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="exercisePrice"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="Exercise Price ($)"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  )}
                />
              </>
            )}

            <Controller
              control={control}
              name="annualIncome"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Annual Income ($)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
            >
              Calculate Scenario
            </Button>
          </Card.Content>
        </Card>

        {results && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">Results</Text>

                <View style={styles.resultRow}>
                  <Text variant="bodyLarge">Equity Value:</Text>
                  <Text variant="bodyLarge" style={styles.resultValue}>
                    ${results.equityValue.toLocaleString()}
                  </Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.resultRow}>
                  <Text variant="bodyLarge">Tax Impact:</Text>
                  <Text variant="bodyLarge" style={styles.resultValue}>
                    ${results.taxImpact.toLocaleString()}
                  </Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.resultRow}>
                  <Text variant="bodyLarge">AMT Impact:</Text>
                  <Text variant="bodyLarge" style={styles.resultValue}>
                    ${results.amtImpact.toLocaleString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">Valuation Scenario</Text>
                <ScenarioChart data={results.chartData} />
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  segmented: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  resultValue: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
});
