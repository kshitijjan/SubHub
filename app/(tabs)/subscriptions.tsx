import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useState, useMemo } from 'react'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from '@/components/SubscriptionCard';
import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import { useSubscriptions } from "@/lib/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions, deleteSubscription, updateSubscription } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<any | null>(null);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.plan && sub.plan.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, subscriptions]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const success = await deleteSubscription(id);
            if (success && expandedId === id) {
              setExpandedId(null);
            }
          }
        }
      ]
    );
  };

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
              onDeletePress={() => handleDelete(item.id, item.name)}
              onEditPress={() => setEditingSubscription(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        />
      </KeyboardAvoidingView>
      <EditSubscriptionModal
        visible={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        subscription={editingSubscription}
        onEdit={updateSubscription}
      />
    </SafeAreaView>
  )
}

export default Subscriptions