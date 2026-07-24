import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useMemo } from 'react'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from "@/lib/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.plan && sub.plan.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  return (
    <SafeAreaView className='flex-1 bg-background p-5'>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Text className='text-3xl font-bold text-primary mb-6'>Subscriptions</Text>
        
        <View className='bg-card mb-6 rounded-2xl px-4 py-3 border border-border'>
          <TextInput
            placeholder="Search subscriptions..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className='text-primary text-base'
          />
        </View>

        <FlatList
          data={filteredSubscriptions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Subscriptions