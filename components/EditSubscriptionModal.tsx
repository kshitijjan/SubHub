import { icons } from '@/constants/icons';
import { posthog } from '@/lib/posthog';
import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSubscriptions } from '@/lib/SubscriptionsContext';

const DEFAULT_CATEGORIES = ["Entertainment", "AI Tools", "Developer Tools", "Design", "Productivity", "Cloud", "Music"];
const FREQUENCIES = ["Monthly", "Yearly"];
const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Netbanking", "Other"];

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

interface EditSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: (id: string, updates: any) => Promise<boolean> | void;
  subscription: any;
}

export default function EditSubscriptionModal({ visible, onClose, onEdit, subscription }: EditSubscriptionModalProps) {
  const { subscriptions, globalCurrency } = useSubscriptions();
  const dynamicCategories = Array.from(new Set(
    subscriptions
      .map(sub => sub.category)
      .filter(cat => typeof cat === 'string' && cat && !DEFAULT_CATEGORIES.includes(cat) && cat !== 'Other')
  ));

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [category, setCategory] = useState('Other');
  
  // New fields
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [customCategory, setCustomCategory] = useState('');
  const [startDateSelection, setStartDateSelection] = useState<'Today' | 'Custom'>('Today');
  
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [renewalDate, setRenewalDate] = useState(new Date(dayjs().add(1, 'month').toISOString()));
  const [showRenewalDatePicker, setShowRenewalDatePicker] = useState(false);

  const allCategories = [...DEFAULT_CATEGORIES, ...dynamicCategories, "Other"];

  React.useEffect(() => {
    if (subscription && visible) {
      setName(subscription.name || '');
      setPrice(subscription.price?.toString() || '');
      setFrequency(subscription.billing || 'Monthly');
      setPaymentMethod(subscription.paymentMethod || subscription.payment_method || 'UPI');
      
      const isDefaultCat = DEFAULT_CATEGORIES.includes(subscription.category) || dynamicCategories.includes(subscription.category);
      if (subscription.category) {
        if (isDefaultCat) {
          setCategory(subscription.category);
          setCustomCategory('');
        } else {
          setCategory('Other');
          setCustomCategory(subscription.category);
        }
      } else {
        setCategory('Other');
        setCustomCategory('');
      }

      if (subscription.startDate) {
        const sd = dayjs(subscription.startDate);
        if (sd.isSame(dayjs(), 'day')) {
          setStartDateSelection('Today');
        } else {
          setStartDateSelection('Custom');
        }
        setCustomStartDate(sd.toDate());
      } else {
        setStartDateSelection('Today');
        setCustomStartDate(new Date());
      }

      if (subscription.renewalDate) {
        setRenewalDate(dayjs(subscription.renewalDate).toDate());
      } else {
        setRenewalDate(new Date(dayjs().add(1, 'month').toISOString()));
      }
    }
  }, [subscription, visible]);

  const handleClose = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('Other');
    setPaymentMethod('UPI');
    setCustomCategory('');
    setStartDateSelection('Today');
    setCustomStartDate(new Date());
    setRenewalDate(new Date(dayjs().add(1, 'month').toISOString()));
    setShowStartDatePicker(false);
    setShowRenewalDatePicker(false);
    onClose();
  };

  const numericPrice = Number(price);
  const isFormValid = name.trim() !== '' && Number.isFinite(numericPrice) && numericPrice > 0;

  const getIconForName = (subName: string) => {
    const normalizedName = subName.toLowerCase().trim();
    const ignoreKeys = ['home', 'wallet', 'setting', 'activity', 'add', 'back', 'menu', 'plus'];
    for (const [key, value] of Object.entries(icons)) {
      if (!ignoreKeys.includes(key) && normalizedName.includes(key.toLowerCase())) {
        return key;
      }
    }
    return '';
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    let finalCategory = category;
    if (category === 'Other' && customCategory.trim() !== '') {
      finalCategory = customCategory.trim();
    }

    let finalStartDate = dayjs().toISOString();
    if (startDateSelection === 'Custom') {
      finalStartDate = customStartDate.toISOString();
    }
    
    const updates = {
      name: name.trim(),
      price: numericPrice,
      currency: globalCurrency,
      billing: frequency,
      category: finalCategory,
      paymentMethod,
      startDate: finalStartDate,
      renewalDate: renewalDate.toISOString(),
      icon_name: getIconForName(name),
      color: CATEGORY_COLORS[finalCategory] || CATEGORY_COLORS[category] || "#d3d3d3",
    };

    const success = await onEdit(subscription.id, updates);

    if (success !== false) {
      posthog.capture('subscription_updated', {
        subscription_id: subscription.id,
        subscription_name: name.trim(), 
        subscription_price: numericPrice,
        subscription_frequency: frequency, 
        subscription_category: finalCategory,
        payment_method: paymentMethod
      });

      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="modal-overlay">
          <Pressable className="flex-1" onPress={handleClose} />
          
          <View className="modal-container h-[85%]">
            <View className="modal-header">
              <Text className="modal-title">Edit Subscription</Text>
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
                      onPress={() => {
                        setFrequency(freq);
                        const baseDate = startDateSelection === 'Custom' ? dayjs(customStartDate) : dayjs();
                        if (freq === 'Monthly') {
                          setRenewalDate(new Date(baseDate.add(1, 'month').toISOString()));
                        } else {
                          setRenewalDate(new Date(baseDate.add(1, 'year').toISOString()));
                        }
                      }}
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
                <Text className="auth-label">Start Date</Text>
                <View className="picker-row mb-3">
                  <Pressable 
                    onPress={() => setStartDateSelection('Today')}
                    className={clsx("picker-option", startDateSelection === 'Today' && "picker-option-active")}
                  >
                    <Text className={clsx("picker-option-text", startDateSelection === 'Today' && "picker-option-text-active")}>
                      Today
                    </Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setStartDateSelection('Custom')}
                    className={clsx("picker-option", startDateSelection === 'Custom' && "picker-option-active")}
                  >
                    <Text className={clsx("picker-option-text", startDateSelection === 'Custom' && "picker-option-text-active")}>
                      Custom Date
                    </Text>
                  </Pressable>
                </View>
                {startDateSelection === 'Custom' && (
                  <View>
                    {Platform.OS === 'android' ? (
                      <Pressable onPress={() => setShowStartDatePicker(true)} className="auth-input justify-center">
                        <Text>{customStartDate.toDateString()}</Text>
                      </Pressable>
                    ) : (
                      <DateTimePicker
                        value={customStartDate}
                        mode="date"
                        display="spinner"
                        textColor="#000000"
                        onChange={(e, date) => {
                          if (date) setCustomStartDate(date);
                        }}
                      />
                    )}
                    {showStartDatePicker && Platform.OS === 'android' && (
                      <DateTimePicker
                        value={customStartDate}
                        mode="date"
                        display="default"
                        onChange={(e, date) => {
                          setShowStartDatePicker(false);
                          if (date) setCustomStartDate(date);
                        }}
                      />
                    )}
                  </View>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Renewal Date</Text>
                {Platform.OS === 'android' ? (
                  <Pressable onPress={() => setShowRenewalDatePicker(true)} className="auth-input justify-center">
                    <Text>{renewalDate.toDateString()}</Text>
                  </Pressable>
                ) : (
                  <View className="items-start">
                    <DateTimePicker
                      value={renewalDate}
                      mode="date"
                      display="spinner"
                      textColor="#000000"
                      onChange={(e, date) => {
                        if (date) setRenewalDate(date);
                      }}
                    />
                  </View>
                )}
                {showRenewalDatePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={renewalDate}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                      setShowRenewalDatePicker(false);
                      if (date) setRenewalDate(date);
                    }}
                  />
                )}
                <Text className="text-xs text-gray-500 mt-2 ml-1">
                  You will be notified 5 days before this date.
                </Text>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Payment Method</Text>
                <View className="category-scroll">
                  {PAYMENT_METHODS.map(method => (
                    <Pressable
                      key={method}
                      onPress={() => setPaymentMethod(method)}
                      className={clsx("category-chip", paymentMethod === method && "category-chip-active")}
                    >
                      <Text className={clsx("category-chip-text", paymentMethod === method && "category-chip-text-active")}>
                        {method}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {allCategories.map((cat, i) => (
                    <Pressable
                      key={`${cat}-${i}`}
                      onPress={() => setCategory(cat)}
                      className={clsx("category-chip", category === cat && "category-chip-active")}
                    >
                      <Text className={clsx("category-chip-text", category === cat && "category-chip-text-active")}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {category === 'Other' && (
                  <TextInput
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="Enter custom category"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    className="auth-input mt-2"
                  />
                )}
              </View>

              <Pressable 
                onPress={handleSubmit}
                disabled={!isFormValid}
                className={clsx("auth-button", !isFormValid && "auth-button-disabled")}
              >
                <Text className="auth-button-text">Update Subscription</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
