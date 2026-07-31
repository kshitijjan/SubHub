import { View, Text } from 'react-native';
import React from 'react';
import { useSubscriptions } from '@/lib/SubscriptionsContext';
import { formatCurrency, isActiveInMonth } from '@/lib/utils';
import dayjs from 'dayjs';

interface ExpensesCardProps {
  selectedMonth: number;
}

const ExpensesCard = ({ selectedMonth }: ExpensesCardProps) => {
  const { subscriptions, globalCurrency } = useSubscriptions();
  
  const activeSubsForMonth = subscriptions.filter(sub => isActiveInMonth(sub, selectedMonth, dayjs().year()));

  const totalBalance = activeSubsForMonth.reduce((acc, sub) => acc + sub.price, 0);

  // We want to show "Month Year" for the selected month.
  const monthString = dayjs().month(selectedMonth).format('MMMM YYYY');

  return (
    <View className="bg-card rounded-3xl p-5 mb-5 border border-border">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-xl font-sans-bold text-primary">Expenses</Text>
        <Text className="text-xl font-sans-bold text-primary">-{formatCurrency(totalBalance, globalCurrency)}</Text>
      </View>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-base font-sans-medium text-muted-foreground">{monthString}</Text>
      </View>
    </View>
  );
};

export default ExpensesCard;
