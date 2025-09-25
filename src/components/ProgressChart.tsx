import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - (theme.spacing[6] * 2);
const CHART_HEIGHT = 200;

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  color?: string;
  showTrend?: boolean;
  style?: any;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title,
  yAxisLabel,
  xAxisLabel,
  color = theme.colors.accent,
  showTrend = true,
  style,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const getMaxValue = () => {
    return Math.max(...data.map(point => point.value));
  };

  const getMinValue = () => {
    return Math.min(...data.map(point => point.value));
  };

  const getValueRange = () => {
    return getMaxValue() - getMinValue();
  };

  const getTrend = () => {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const maxValue = getMaxValue();
  const minValue = getMinValue();
  const valueRange = getValueRange();
  const trend = getTrend();

  const getPointPosition = (point: ChartDataPoint, index: number) => {
    const x = (index / (data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((point.value - minValue) / valueRange) * CHART_HEIGHT;
    return { x, y };
  };

  // const generatePath = () => {
  //   if (data.length < 2) return '';
  //   
  //   let path = `M 0 ${CHART_HEIGHT}`;
  //   
  //   data.forEach((point, index) => {
  //     const { x, y } = getPointPosition(point, index);
  //     if (index === 0) {
  //       path += ` L ${x} ${y}`;
  //     } else {
  //       path += ` L ${x} ${y}`;
  //     }
  //   });
  //   
  //   return path;
  // };

  // const generateAreaPath = () => {
  //   if (data.length < 2) return '';
  //   
  //   let path = `M 0 ${CHART_HEIGHT}`;
  //   
  //   data.forEach((point, index) => {
  //     const { x, y } = getPointPosition(point, index);
  //     path += ` L ${x} ${y}`;
  //   });
  //   
  //   path += ` L ${CHART_WIDTH} ${CHART_HEIGHT} Z`;
  //   return path;
  // };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showTrend && (
          <View style={styles.trendContainer}>
            <Text style={[
              styles.trendText,
              { color: trend >= 0 ? theme.colors.success : theme.colors.error }
            ]}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartContainer}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>{formatValue(maxValue)}</Text>
          <Text style={styles.yAxisLabel}>{formatValue((maxValue + minValue) / 2)}</Text>
          <Text style={styles.yAxisLabel}>{formatValue(minValue)}</Text>
        </View>

        {/* Chart Area */}
        <View style={styles.chartArea}>
          {/* Grid Lines */}
          <View style={styles.gridContainer}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View
                key={index}
                style={[
                  styles.gridLine,
                  { top: ratio * CHART_HEIGHT }
                ]}
              />
            ))}
          </View>

          {/* Data Points and Lines */}
          <View style={styles.dataContainer}>
            {data.map((point, index) => {
              const { x, y } = getPointPosition(point, index);
              return (
                <View key={index}>
                  {/* Data Point */}
                  <View
                    style={[
                      styles.dataPoint,
                      {
                        left: x - 4,
                        top: y - 4,
                        backgroundColor: color,
                      }
                    ]}
                  />
                  
                  {/* Value Label */}
                  <Text
                    style={[
                      styles.valueLabel,
                      {
                        left: x - 20,
                        top: y - 30,
                      }
                    ]}
                  >
                    {formatValue(point.value)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X-Axis Labels */}
      <View style={styles.xAxisContainer}>
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * CHART_WIDTH;
          return (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                { left: x - 20 }
              ]}
            >
              {formatDate(point.date)}
            </Text>
          );
        })}
      </View>

      {/* Axis Labels */}
      {yAxisLabel && (
        <Text style={styles.axisLabel}>{yAxisLabel}</Text>
      )}
      {xAxisLabel && (
        <Text style={[styles.axisLabel, styles.xAxisLabelText]}>{xAxisLabel}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  trendContainer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.small,
  },
  trendText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    marginBottom: theme.spacing[4],
  },
  yAxisContainer: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[1],
  },
  yAxisLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.3,
  },
  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    ...theme.shadows.small,
  },
  valueLabel: {
    position: 'absolute',
    ...theme.typography.caption,
    color: theme.colors.text,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[1],
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
    minWidth: 40,
    textAlign: 'center',
  },
  xAxisContainer: {
    flexDirection: 'row',
    height: 30,
    position: 'relative',
  },
  xAxisLabel: {
    position: 'absolute',
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    minWidth: 40,
  },
  axisLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing[2],
  },
  xAxisLabelText: {
    textAlign: 'left',
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ProgressChart;
