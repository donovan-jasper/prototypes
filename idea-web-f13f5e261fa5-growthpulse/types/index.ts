export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: string;
}

export interface HealthData {
  id: string;
  type: string;
  value: number;
  date: Date;
}
