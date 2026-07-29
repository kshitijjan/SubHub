import { View, Text } from 'react-native';
import React from 'react';
import clsx from 'clsx';

import { useSubscriptions } from '@/lib/SubscriptionsContext';
import dayjs from 'dayjs';

const InsightsChart = () => {
  const { subscriptions } = useSubscriptions();
  const startOfWeek = dayjs().startOf('week').add(1, 'day'); // Monday
  
  const DUMMY_DATA = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayStr, index) => {
    const dayDate = startOfWeek.add(index, 'day');
    const value = subscriptions
      .filter(sub => sub.status === 'active' && dayjs(sub.renewalDate).isSame(dayDate, 'day'))
      .reduce((sum, sub) => sum + sub.price, 0);
    return { day: dayStr, value, highlighted: dayjs().isSame(dayDate, 'day') };
  });
  return (
    <View className="bg-card rounded-3xl p-5 mb-5 border border-border">
      {/* Container for Y axis labels and chart area */}
      <View className="flex-row">
        {/* Y-axis labels */}
        <View className="justify-between h-48 py-2 pr-2 border-r border-transparent">
          {[45, 35, 25, 5, 0].map((val, idx) => (
            <Text key={idx} className="text-muted-foreground text-xs font-sans-medium w-6 text-right">
              {val}
            </Text>
          ))}
        </View>

        {/* Chart area */}
        <View className="flex-1 relative h-48 ml-2">
          {/* Horizontal lines */}
          <View className="absolute inset-0 justify-between py-2">
            {[45, 35, 25, 5, 0].map((_, idx) => (
              <View key={idx} className="w-full h-[1px] border-b border-black/10 border-dashed" />
            ))}
          </View>

          {/* Bars */}
          <View className="flex-1 flex-row items-end justify-between pb-2 z-10 px-2">
            {DUMMY_DATA.map((item, index) => {
              const heightPercentage = (item.value / 45) * 100;
              return (
                <View key={index} className="items-center relative h-full justify-end">
                  <View 
                    className={clsx(
                      "w-3.5 rounded-full",
                      item.highlighted ? "bg-accent" : "bg-primary"
                    )} 
                    style={{ height: `${heightPercentage}%` }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View className="flex-row justify-between ml-10 px-2 mt-2">
        {DUMMY_DATA.map((item, index) => (
          <Text key={index} className="text-muted-foreground text-xs font-sans-medium text-center w-8">
            {item.day}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default InsightsChart;
