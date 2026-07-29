import { View, Text } from 'react-native';
import React from 'react';
import { useSubscriptions } from '@/lib/SubscriptionsContext';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';

const ExpensesCard = () => {
  const { subscriptions, globalCurrency } = useSubscriptions();
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalBalance = activeSubscriptions.reduce((acc, sub) => {
    const price = sub.billing?.toLowerCase() === 'yearly' ? sub.price / 12 : sub.price;
    return acc + price;
  }, 0);

  return (
    <View className="bg-card rounded-3xl p-5 mb-5 border border-border">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-xl font-sans-bold text-primary">Expenses</Text>
        <Text className="text-xl font-sans-bold text-primary">-{formatCurrency(totalBalance, globalCurrency)}</Text>
      </View>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-base font-sans-medium text-muted-foreground">{dayjs().format('MMMM YYYY')}</Text>
      </View>
    </View>
  );
};

export default ExpensesCard;
