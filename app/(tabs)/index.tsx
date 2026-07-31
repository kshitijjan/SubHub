import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { posthog } from '@/lib/posthog';
import { formatCurrency, isActiveInMonth } from "@/lib/utils";
import { useSubscriptions } from "@/lib/SubscriptionsContext";
import { useUser } from '@clerk/expo';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { useState, useMemo, useEffect } from "react";
import { FlatList, Image, Text, View, Pressable } from "react-native";
import { useRouter } from 'expo-router';
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import UpcomingRenewalsModal from "@/components/UpcomingRenewalsModal";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

//SafeAreaView is the 3rd party component and does not support style so
//nativewind need styled component to enable style support
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const router = useRouter();
  const { user } = useUser()
  const { subscriptions, addSubscription, globalCurrency } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<String | null>(null)
  const [isModalVisible, setModalVisible] = useState(false);
  const [isUpcomingModalVisible, setUpcomingModalVisible] = useState(false);
  const [randomSubIds, setRandomSubIds] = useState<string[]>([]);

  useEffect(() => {
    // Only pick random subscriptions once when data is loaded
    if (subscriptions.length > 0 && randomSubIds.length === 0) {
      const ids = [...subscriptions].sort(() => Math.random() - 0.5).slice(0, 5).map(s => s.id);
      setRandomSubIds(ids);
    }
  }, [subscriptions, randomSubIds.length]);

  const randomSubscriptions = useMemo(() => {
    if (randomSubIds.length === 0) return subscriptions.slice(0, 5);
    return randomSubIds.map(id => subscriptions.find(sub => sub.id === id)).filter(Boolean);
  }, [subscriptions, randomSubIds]);

  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();
  const activeSubsForMonth = subscriptions.filter(sub => isActiveInMonth(sub, currentMonth, currentYear));
  const totalBalance = activeSubsForMonth.reduce((acc, sub) => acc + sub.price, 0);
  
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const today = dayjs();
  const upcomingRenewalsThisMonth = activeSubscriptions
    .filter(sub => sub.renewalDate && dayjs(sub.renewalDate).isSame(today, 'month'))
    .map(sub => ({
      id: sub.id,
      name: sub.name,
      icon: sub.icon,
      price: sub.price,
      currency: sub.currency,
      daysLeft: dayjs(sub.renewalDate).diff(today, 'day'),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">

        <FlatList 
          ListHeaderComponent={(
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image 
                    source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                    className="home-avatar" 
                  />
                  <Text className="home-user-name">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || HOME_USER.name}
                  </Text>
                </View>

                <Pressable onPress={() => setModalVisible(true)}>
                  <Image source={icons.add} className="home-add-icon" />
                </Pressable>
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">This Month's Total</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency(totalBalance, globalCurrency)}
                  </Text>
                </View>
              </View>

              <View className="mb-5">
                <ListHeading title="Upcoming" onPress={() => setUpcomingModalVisible(true)} />
                <FlatList
                  data={upcomingRenewalsThisMonth.slice(0, 4)}
                  renderItem={({ item }) => (<UpcomingSubscriptionCard {...item} />)}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator = {false}
                  ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals</Text>}
                  />

              </View>
              <ListHeading title="All Subscriptions" onPress={() => router.push('/(tabs)/subscriptions')} />
            </>
          )}
          data={randomSubscriptions}
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
                  });
                }
              }}
              />
            )} 
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
            contentContainerClassName="pb-30"
          />
          
        {isModalVisible && (
          <CreateSubscriptionModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onAdd={addSubscription}
          />
        )}
        {isUpcomingModalVisible && (
          <UpcomingRenewalsModal
            visible={isUpcomingModalVisible}
            onClose={() => setUpcomingModalVisible(false)}
            renewals={upcomingRenewalsThisMonth}
          />
        )}
    </SafeAreaView>
  );
} 