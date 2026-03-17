import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { useForm, Controller } from 'react-hook-form';
import PremiumGate from '../components/PremiumGate';
import { calculateEquityValue, calculateTaxImpact } from '../lib/calculations';

interface ScenarioForm {
  valuation: string;
  saleType: 'ipo' | 'acquisition' | 'secondary';
  holdingPeriod: 'short' | 'long';
  annualIncome: string;
}

export default function ScenarioModeler() {
  const [results, setResults] = useState<{
    equityValue: number;
    taxImpact: number;
    chartData: { x: number; y: number }[];
  } | null>(null);

  const { control, handleSubmit, watch } = useForm<ScenarioForm>({
    defaultValues: {
      valuation: '10000000',
      saleType: 'ipo',
      holdingPeriod: 'short',
      annualIncome: '100000'
    }
  });

  const saleType = watch('saleType');

  const onSubmit = (data: ScenarioForm) => {
    const valuation = parseFloat(data.valuation);
    const annualIncome = parseFloat(data.annualIncome);

    // Simulate scenario calculation
    const equityValue = calculateEquityValue(1000, 10, valuation / 1000000);
    const taxImpact = calculateTaxImpact(equityValue, data.holdingPeriod, annualIncome);

    // Generate chart data
    const chartData = Array.from({ length: 10 }, (_, i) => {
      const x = i + 1;
      const y = calculateEquityValue(1000, 10, (valuation / 1000000) * (1 + i * 0.1));
      return { x, y };
    });

    setResults({ equityValue, taxImpact, chartData });
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
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Results</Text>

              <View style={styles.resultRow}>
                <Text variant="bodyLarge">Equity Value:</Text>
                <Text variant="bodyLarge" style={styles.resultValue}>
                  ${results.equityValue.toLocaleString()}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text variant="bodyLarge">Estimated Tax:</Text>
                <Text variant="bodyLarge" style={styles.resultValue}>
                  ${results.taxImpact.toLocaleString()}
                </Text>
              </View>

              <Text variant="bodyMedium" style={styles.chartTitle}>
                Equity Value Projection
              </Text>

              <VictoryChart
                theme={VictoryTheme.material}
                height={300}
                width={350}
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
              >
                <VictoryAxis
                  dependentAxis
                  tickFormat={(x) => `$${x / 1000}k`}
                />
                <VictoryAxis
                  tickFormat={(x) => `${x * 10}%`}
                />
                <VictoryLine
                  data={results.chartData}
                  style={{
                    data: { stroke: '#4CAF50' },
                    parent: { border: '1px solid #ccc' }
                  }}
                />
              </VictoryChart>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    marginBottom: 24,
    textAlign: 'center'
  },
  card: {
    marginBottom: 16
  },
  input: {
    marginBottom: 16
  },
  segmented: {
    marginBottom: 16
  },
  button: {
    marginTop: 8
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  resultValue: {
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  chartTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  }
});
