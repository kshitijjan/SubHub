import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from '@clerk/expo'
import images from '@/constants/images'
import { posthog } from '@/lib/posthog'
import { useSubscriptions } from '@/lib/SubscriptionsContext'
import clsx from 'clsx'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { ActivityIndicator } from 'react-native'

const SafeAreaView = styled(RNSafeAreaView);

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];

const Settings = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const { globalCurrency, setGlobalCurrency } = useSubscriptions()
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      posthog.capture('user_signed_out')
      posthog.reset()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleImagePick = async () => {
    if (!user) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingImage(true)
        const asset = result.assets[0]
        
        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: 'base64',
        })
        
        const mimeType = asset.uri.endsWith('.png') ? 'image/png' : 'image/jpeg'
        const file = `data:${mimeType};base64,${base64}`

        await user.setProfileImage({
          file,
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-background p-5'>
      <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>
      
      {user ? (
        <View className="items-center bg-card rounded-3xl border border-border p-6 mb-6">
          <Pressable onPress={handleImagePick} disabled={isUploadingImage} className="relative mb-4">
            <Image 
              source={user.imageUrl ? { uri: user.imageUrl } : images.avatar} 
              className="w-20 h-20 rounded-full" 
            />
            {isUploadingImage && (
              <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-full">
                <ActivityIndicator color="#ffffff" size="small" />
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary w-6 h-6 rounded-full items-center justify-center border-2 border-card">
              <Text className="text-white font-bold text-xs">+</Text>
            </View>
          </Pressable>
          <Text className="text-xl font-sans-bold text-primary">
            {user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'}
          </Text>
          <Text className="text-sm font-sans-semibold text-muted-foreground mt-1">
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      ) : null}

      <View className="bg-card rounded-3xl border border-border p-6 mb-6">
        <Text className="text-lg font-sans-bold text-primary mb-4">Currency Settings</Text>
        <View className="flex-row flex-wrap gap-3" accessibilityRole="radiogroup">
          {CURRENCIES.map(c => (
            <Pressable 
              key={c}
              accessibilityRole="tab"
              accessibilityState={{ selected: globalCurrency === c }}
              onPress={() => {
                setGlobalCurrency(c);
                if (c !== globalCurrency) {
                  posthog.capture('currency_changed', { currency: c });
                }
              }}
              className={clsx("px-4 py-2 rounded-xl border border-border", globalCurrency === c && "bg-primary border-primary")}
            >
              <Text className={clsx("font-sans-semibold", globalCurrency === c ? "text-white" : "text-primary")}>{c}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-auto pb-20">
        <Pressable 
          className="items-center rounded-2xl bg-destructive py-4"
          onPress={handleSignOut}
        >
          <Text className="text-base font-sans-bold text-white">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Settings