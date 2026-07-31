import { View, Text, Image, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { icons } from '@/constants/icons'
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils'
import clsx from 'clsx'
import { useSubscriptions } from '@/lib/SubscriptionsContext'

const SubscriptionCard = ({ name, price, currency, icon, billing, color, category, plan, renewalDate, expanded, onPress, paymentMethod, startDate, status, onDeletePress, onEditPress }: SubscriptionCardProps) => {
  const { globalCurrency } = useSubscriptions();
  const [imgError, setImgError] = useState(false);

  const fallbackUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;

  return (
    <Pressable onPress={onPress} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')} style={!expanded && color ? { backgroundColor: color}: undefined }>
      <View className='sub-head'>
        <View className='sub-main'>
            <Image 
              source={imgError ? { uri: fallbackUri } : icon} 
              onError={() => setImgError(true)}
              className='sub-icon' 
            />
            <View className='sub-copy'>
                <Text numberOfLines={1} className='sub-title'>
                    {name}
                </Text>
                <Text numberOfLines={1} ellipsizeMode='tail' className='sub-meta'>
                    {category?.trim() || plan?.trim() || renewalDate ? formatSubscriptionDateTime(renewalDate): ''}
                </Text>
            </View>
        </View>

        <View className='sub-price-box'>
            <Text className='sub-price'>{formatCurrency(price, globalCurrency)}</Text>
            <Text className='sub-billing'>{billing}</Text>
        </View>
      </View>  

    {expanded && (
        <View className='sub-bdy'>
            <View className='sub-details'>
                <View className='sub-row'>
                    <View className='sub-row-copy'>
                        <Text className='sub-label'>Payment: </Text>
                        <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>
                            {paymentMethod?.trim() || 'Not provided'}
                        </Text>
                    </View>
                </View>
                <View className='sub-row'>
                    <View className='sub-row-copy'>
                        <Text className='sub-label'>Category: </Text>
                        <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>
                            {category?.trim() || plan?.trim() || 'Not provided'}
                        </Text>
                    </View>
                </View>
                <View className='sub-row'>
                    <View className='sub-row-copy'>
                        <Text className='sub-label'>Started: </Text>
                        <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>
                            {startDate ? formatSubscriptionDateTime(startDate) : 'Not provided'}
                        </Text>
                    </View>
                </View>
                <View className='sub-row'>
                    <View className='sub-row-copy'>
                        <Text className='sub-label'>Renewal Date: </Text>
                        <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>
                            {renewalDate ? formatSubscriptionDateTime(renewalDate) : 'Not provided'}
                        </Text>
                    </View>
                </View>
                <View className='sub-row'>
                    <View className='sub-row-copy'>
                        <Text className='sub-label'>Status: </Text>
                        <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>
                            {status ? formatStatusLabel(status) : 'Not provided'}
                        </Text>
                    </View>
                </View>
            </View>

            {(onEditPress || onDeletePress) && (
                <View className='mt-4 flex-row justify-end space-x-3'>
                    {onEditPress && (
                        <Pressable onPress={onEditPress} className='px-3 py-2 bg-blue-50 rounded-full flex-row items-center border border-blue-100 mr-2'>
                            <Ionicons name="pencil-outline" size={16} color="#3b82f6" />
                            <Text className='text-blue-500 ml-1 text-xs font-medium'>Edit</Text>
                        </Pressable>
                    )}
                    {onDeletePress && (
                        <Pressable onPress={onDeletePress} className='px-3 py-2 bg-red-50 rounded-full flex-row items-center border border-red-100'>
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                            <Text className='text-red-500 ml-1 text-xs font-medium'>Delete</Text>
                        </Pressable>
                    )}
                </View>
            )}

        </View>
    )}

      
    </Pressable>
  )
}

export default SubscriptionCard