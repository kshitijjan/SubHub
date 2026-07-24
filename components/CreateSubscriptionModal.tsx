import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';

const CATEGORIES = ["Entertainment", "AI Tools", "Developer Tools", "Design", "Productivity", "Cloud", "Music", "Other"];
const FREQUENCIES = ["Monthly", "Yearly"];

const CATEGORY_COLORS: Record<string, string> = {
  "Entertainment": "#ff7b7b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  "Design": "#f5c542",
  "Productivity": "#8fd1bd",
  "Cloud": "#a7c7e7",
  "Music": "#b19cd9",
  "Other": "#d3d3d3",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (subscription: any) => void;
}

export default function CreateSubscriptionModal({ visible, onClose, onAdd }: CreateSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [category, setCategory] = useState('Other');

  const handleClose = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('Other');
    onClose();
  };

  const isFormValid = name.trim() !== '' && parseFloat(price) > 0;

  const getIconForName = (subName: string) => {
    const normalizedName = subName.toLowerCase().trim();
    
    // UI icons to ignore when matching brands
    const ignoreKeys = ['home', 'wallet', 'setting', 'activity', 'add', 'back', 'menu', 'plus'];
    
    for (const [key, value] of Object.entries(icons)) {
      if (!ignoreKeys.includes(key) && normalizedName.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Generate a remote brand logo URI
    const domain = normalizedName.replace(/\s+/g, '') + '.com';
    return { uri: `https://logo.clearbit.com/${domain}` };
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    const startDate = dayjs().toISOString();
    const renewalDate = frequency === 'Monthly' 
      ? dayjs().add(1, 'month').toISOString() 
      : dayjs().add(1, 'year').toISOString();
    
    const newSub = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      price: parseFloat(price),
      currency: "USD",
      billing: frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: getIconForName(name),
      color: CATEGORY_COLORS[category] || "#d3d3d3",
    };

    onAdd(newSub);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="modal-overlay">
          <Pressable className="flex-1" onPress={handleClose} />
          
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable onPress={handleClose} className="modal-close">
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView className="modal-body" contentContainerClassName="gap-5 pb-10">
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Spotify"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  keyboardType="decimal-pad"
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {FREQUENCIES.map(freq => (
                    <Pressable 
                      key={freq}
                      onPress={() => setFrequency(freq)}
                      className={clsx("picker-option", frequency === freq && "picker-option-active")}
                    >
                      <Text className={clsx("picker-option-text", frequency === freq && "picker-option-text-active")}>
                        {freq}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx("category-chip", category === cat && "category-chip-active")}
                    >
                      <Text className={clsx("category-chip-text", category === cat && "category-chip-text-active")}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable 
                onPress={handleSubmit}
                disabled={!isFormValid}
                className={clsx("auth-button", !isFormValid && "auth-button-disabled")}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
