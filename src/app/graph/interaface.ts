interface IChartFilter {
  mode: 'range' | 'day' | 'month' | 'year';
  day: number;
  month: number;
  year: number;
  minDate: Date;
  maxDate: Date;
  information: string;
  type: string[];
  value: {
    min: string;
    max: string;
    equal: string;
  };
  category: string[];
  pocket: string[];
}

export type { IChartFilter };
