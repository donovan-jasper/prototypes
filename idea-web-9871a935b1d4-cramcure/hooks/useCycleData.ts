import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { predictNextPeriodWithOvulation, PatternAnalysis } from '@/services/cyclePredictor';
import { Cycle } from '@/types/cycle';

export const useCycleData = () => {
  const { getCycles } = useDatabase();
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [nextPeriodPrediction, setNextPeriodPrediction] = useState<Date | null>(null);
  const [ovulationDate, setOvulationDate] = useState<Date | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCycleData = async () => {
      try {
        setIsLoading(true);
        const cycles = await getCycles();

        if (cycles.length > 0) {
          // Set current cycle (most recent one)
          setCurrentCycle(cycles[0]);

          // Get predictions and pattern analysis
          const { predictedStart, ovulationDate, patternAnalysis } =
            predictNextPeriodWithOvulation(cycles);

          setNextPeriodPrediction(predictedStart);
          setOvulationDate(ovulationDate);
          setPatternAnalysis(patternAnalysis);
        }
      } catch (error) {
        console.error('Error loading cycle data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCycleData();
  }, [getCycles]);

  return {
    currentCycle,
    nextPeriodPrediction,
    ovulationDate,
    patternAnalysis,
    isLoading,
  };
};
