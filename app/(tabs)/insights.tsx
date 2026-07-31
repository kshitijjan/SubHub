import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/lib/SubscriptionsContext';
import { icons } from '@/constants/icons';
import InsightsChart from '@/components/InsightsChart';
import ExpensesCard from '@/components/ExpensesCard';
import { useRouter } from 'expo-router';
import { posthog } from '@/lib/posthog';
import { isActiveInMonth } from '@/lib/utils';

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { subscriptions } = useSubscriptions();
  const router = useRouter();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<String | null>(null);
  
  const currentMonth = dayjs().month();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const activeSubsForMonth = subscriptions.filter(sub => isActiveInMonth(sub, selectedMonth, dayjs().year()));


  return (
    <SafeAreaView className='flex-1 bg-background p-5'>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="size-12 items-center justify-center rounded-full border border-black/10 bg-transparent"
              >
                <Image source={icons.back} className="size-6" resizeMode="contain" />
              </TouchableOpacity>
              <Text className="text-2xl font-sans-bold text-primary">Monthly Insights</Text>
              <TouchableOpacity className="size-12 items-center justify-center rounded-full border border-black/10 bg-transparent">
                {/* using the more horizontal dots if it was available, falling back to menu or just text */}
                <Image source={icons.menu} className="size-6" resizeMode="contain" />
              </TouchableOpacity>
            </View>

            {/* Upcoming Section */}
            <ListHeading title="Upcoming" />
            <InsightsChart selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />

            {/* Expenses Card */}
            <ExpensesCard selectedMonth={selectedMonth} />

            {/* History Section */}
            <ListHeading title="History" />
          </>
        )}
        data={activeSubsForMonth}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id));
              
              if (isExpanding) {
                posthog.capture('subscription_expanded', {
                  subscription_id: item.id ?? '',
                  category: item.category ?? '',
                  billing_interval: item.billing?.toLowerCase() ?? '',
                  subscription_status: item.status ?? '',
                  source_screen: 'insights'
                });
              }
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}

export default Insights;