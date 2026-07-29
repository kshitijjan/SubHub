import React from 'react';
import { Modal, View, Text, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import UpcomingSubscriptionCard from './UpcomingSubscriptionCard';
import clsx from 'clsx';

interface UpcomingRenewalsModalProps {
  visible: boolean;
  onClose: () => void;
  renewals: UpcomingSubscription[];
}

export default function UpcomingRenewalsModal({ visible, onClose, renewals }: UpcomingRenewalsModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="modal-overlay">
          <Pressable className="flex-1" onPress={onClose} />
          
          <View className="modal-container h-[85%]">
            <View className="modal-header">
              <Text className="modal-title">Upcoming Renewals</Text>
              <Pressable onPress={onClose} className="modal-close">
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <View className="modal-body flex-1">
                <FlatList
                    data={renewals}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="mb-4">
                            <UpcomingSubscriptionCard {...item} />
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals</Text>}
                    contentContainerClassName="pb-10"
                />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
