import { useSignIn } from '@clerk/expo'
import { Link } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, TextInput, View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'
import { posthog } from '@/lib/posthog'

const SafeAreaView = styled(RNSafeAreaView)

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showMfa, setShowMfa] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const handleSubmit = async () => {
    setGlobalError('')

    const { error } = await signIn.password({
      emailAddress,
      password,
    })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
      posthog.captureException(error)
      setGlobalError(error.message || 'Invalid email or password.')
      return
    }

    if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
      const factor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === 'email_code' || f.strategy === 'phone_code'
      )
      if (factor) {
        let sendResult;
        if (factor.strategy === 'email_code') {
          sendResult = await signIn.mfa.sendEmailCode()
        } else {
          sendResult = await signIn.mfa.sendPhoneCode()
        }

        if (sendResult?.error) {
          posthog.captureException(sendResult.error)
          setGlobalError(sendResult.error.message || 'Failed to send verification code.')
          return
        }
        setShowMfa(true)
      } else {
        setGlobalError('Second-factor verification required, but no email/SMS methods are set up.')
      }
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize()
      posthog.capture('user_signed_in', { authentication_method: 'password' })
    } else {
      console.log('Sign-in status not complete:', signIn.status)
    }
  }

  const handleVerifyMfa = async () => {
    setGlobalError('')

    const factor = signIn.supportedSecondFactors?.find(
      (f) => f.strategy === 'email_code' || f.strategy === 'phone_code'
    )
    if (!factor) return

    let verifyResult;
    if (factor.strategy === 'email_code') {
      verifyResult = await signIn.mfa.verifyEmailCode({ code })
    } else {
      verifyResult = await signIn.mfa.verifyPhoneCode({ code })
    }

    if (verifyResult.error) {
      console.error(JSON.stringify(verifyResult.error, null, 2))
      posthog.captureException(verifyResult.error)
      setGlobalError(verifyResult.error.message || 'Verification failed.')
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize()
      posthog.capture('user_signed_in', { authentication_method: 'password_mfa' })
    }
  }

  const loading = fetchStatus === 'fetching'

  if (showMfa) {
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
              
              <Text className="auth-title">Verify Device</Text>
              <Text className="auth-subtitle">Clerk requires additional verification for new devices. Please enter the verification code sent to your email/phone.</Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                
                <View className="auth-field">
                  <Text className="auth-label">Verification Code</Text>
                  <TextInput
                    className="auth-input"
                    value={code}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setCode}
                    keyboardType="number-pad"
                  />
                </View>

                {globalError ? (
                  <Text className="auth-error text-center mt-2">{globalError}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${(!code || loading) ? 'auth-button-disabled' : ''}`}
                  onPress={handleVerifyMfa}
                  disabled={!code || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

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
              <Text className="auth-link-copy">Don&apos;t have an account?</Text>
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