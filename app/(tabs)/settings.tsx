import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from '@clerk/expo'
import images from '@/constants/images'
import { posthog } from '@/lib/posthog'

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth()
  const { user } = useUser()

  const handleSignOut = async () => {
    try {
      await signOut()
      posthog.capture('user_signed_out')
      posthog.reset()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-background p-5'>
      <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>
      
      {user ? (
        <View className="items-center bg-card rounded-3xl border border-border p-6 mb-6">
          <Image 
            source={user.imageUrl ? { uri: user.imageUrl } : images.avatar} 
            className="w-20 h-20 rounded-full mb-4" 
          />
          <Text className="text-xl font-sans-bold text-primary">
            {user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'}
          </Text>
          <Text className="text-sm font-sans-semibold text-muted-foreground mt-1">
            {user.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      ) : null}

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