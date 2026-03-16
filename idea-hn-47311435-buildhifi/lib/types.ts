export interface Component {
  id: number;
  name: string;
  type: string;
  brand: string;
  price: number;
  specs: {
    impedance?: number;
    powerWatts?: number;
    maxPowerWatts?: number;
    outputOhms?: number;
    inputs?: string[];
    outputs?: string[];
  };
  upc?: string;
}

export interface Build {
  id: number;
  name: string;
  created_at: string;
  components: Component[];
}

export interface ValidationResult {
  isValid: boolean;
  suggestions: string[];
}
