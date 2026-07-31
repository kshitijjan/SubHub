import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { BarChart } from 'react-native-gifted-charts';

import { useSubscriptions } from '@/lib/SubscriptionsContext';
import { isActiveInMonth } from '@/lib/utils';
import dayjs from 'dayjs';

interface InsightsChartProps {
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

const InsightsChart = ({ selectedMonth, onSelectMonth }: InsightsChartProps) => {
  const { subscriptions } = useSubscriptions();
  
  const currentMonth = dayjs().month();
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Only show bars up to the current month
  const months = allMonths.slice(0, currentMonth + 1);
  
  const barData = months.map((monthStr, index) => {
    const activeSubsForMonth = subscriptions.filter(sub => isActiveInMonth(sub, index, dayjs().year()));

    const value = activeSubsForMonth.reduce((sum, sub) => sum + sub.price, 0);
      
    const isSelected = index === selectedMonth;
    return { 
      value: value, 
      label: monthStr, 
      frontColor: isSelected ? '#ea7a53' : '#081126',
      onPress: () => onSelectMonth(index),
      topLabelComponent: () => (
        <View className="w-8 -ml-2 items-center justify-center">
          <Text className="text-[10px] font-sans-medium text-primary text-center">
            {value > 0 ? Math.round(value) : ''}
          </Text>
        </View>
      )
    };
  });

  const maxValueFromData = Math.max(...barData.map(d => d.value));
  // Add 15% extra headroom to avoid top label clipping.
  const maxValue = Math.max(maxValueFromData, 45) * 1.15; 


  // Dynamically calculate spacing based on number of visible items
  const screenWidth = Dimensions.get('window').width;
  const availableWidth = screenWidth - 120; 
  const barWidth = 14;
  const numItems = barData.length;
  // Distribute spacing but cap it so bars don't look too far apart if there are only a few months
  const spacing = numItems > 0 ? Math.min((availableWidth - (numItems * barWidth)) / numItems, 35) : 15;

  return (
    <View className="bg-card rounded-3xl p-5 mb-5 border border-border">
      <View className="ml-[-10px] mt-2">
        <BarChart
          data={barData}
          barWidth={barWidth}
          spacing={spacing}
          roundedTop
          roundedBottom
          rulesType="dashed"
          rulesColor="rgba(0, 0, 0, 0.1)"
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: 12, fontFamily: 'sans-medium' }}
          noOfSections={4}
          maxValue={maxValue}
          initialSpacing={15}
          xAxisLabelTextStyle={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center', fontSize: 11, fontFamily: 'sans-medium' }}
        />
      </View>
    </View>
  );
};

export default InsightsChart;
