import { useSignIn } from '@clerk/expo'
import { Link, useRouter, type Href } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, TextInput, View, Text, ScrollView, ActivityIndicator, Linking } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'

const SafeAreaView = styled(RNSafeAreaView)

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [globalError, setGlobalError] = useState('')

  const handleSubmit = async () => {
    setGlobalError('')

    const { error } = await signIn.password({
      emailAddress,
      password,
    })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
      setGlobalError(error.message || 'Invalid email or password.')
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            if (typeof window !== 'undefined') {
              window.location.href = url
            } else {
              Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err))
            }
          } else {
            router.replace(url as Href)
          }
        },
      })
    } else {
      console.log('Sign-in status not complete:', signIn.status)
    }
  }

  const loading = fetchStatus === 'fetching'

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="auth-content">
          
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">SubHub</Text>
                <Text className="auth-wordmark-sub">Subscription Manager</Text>
              </View>
            </View>
            
            <Text className="auth-title">Welcome Back</Text>
            <Text className="auth-subtitle">Sign in to manage all your subscriptions in one place.</Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              
              <View className="auth-field">
                <Text className="auth-label">Email Address</Text>
                <TextInput
                  className={`auth-input ${errors.fields.identifier ? 'auth-input-error' : ''}`}
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter email"
                  placeholderTextColor="#9ca3af"
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                />
                {errors.fields.identifier ? (
                  <Text className="auth-error">{errors.fields.identifier.message}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={`auth-input ${errors.fields.password ? 'auth-input-error' : ''}`}
                  value={password}
                  placeholder="Enter password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={true}
                  onChangeText={setPassword}
                />
                {errors.fields.password ? (
                  <Text className="auth-error">{errors.fields.password.message}</Text>
                ) : null}
              </View>

              {globalError ? (
                <Text className="auth-error text-center mt-2">{globalError}</Text>
              ) : null}

              {errors.global?.[0] ? (
                <Text className="auth-error text-center mt-2">{errors.global[0].message}</Text>
              ) : null}

              <Pressable
                className={`auth-button ${(!emailAddress || !password || loading) ? 'auth-button-disabled' : ''}`}
                onPress={handleSubmit}
                disabled={!emailAddress || !password || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#081126" size="small" />
                ) : (
                  <Text className="auth-button-text">Continue</Text>
                )}
              </Pressable>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Don't have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Sign up</Text>
                </Pressable>
              </Link>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}