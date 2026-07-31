import { useSignIn } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, TextInput, View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'
import { posthog } from '@/lib/posthog'

const SafeAreaView = styled(RNSafeAreaView)

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn() as any
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async () => {
    setGlobalError('')
    setLoading(true)

    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
      })
      if (createError) throw createError

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode()
      if (sendError) throw sendError

      setSuccessfulCreation(true)
    } catch (err: any) {
      console.error('Error creating reset code:', err)
      posthog.captureException(err)
      setGlobalError(err.errors?.[0]?.message || err.message || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setGlobalError('')
    setLoading(true)

    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      })
      if (verifyError) throw verifyError

      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      })
      if (submitError) throw submitError

      if (signIn.status === 'complete') {
        await signIn.finalize()
        posthog.capture('user_password_reset')
        router.replace('/(tabs)')
      } else {
        setGlobalError('Password reset incomplete.')
      }
    } catch (err: any) {
      console.error('Error resetting password:', err)
      posthog.captureException(err)
      setGlobalError(err.errors?.[0]?.message || err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
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
            
            <Text className="auth-title">Reset Password</Text>
            <Text className="auth-subtitle">
              {successfulCreation ? 'Enter the code sent to your email and your new password.' : 'Enter your email address to receive a reset code.'}
            </Text>
          </View>

          <View className="auth-card">
            {!successfulCreation ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className="auth-input"
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter email"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                  />
                </View>

                {globalError ? (
                  <Text className="auth-error text-center mt-2">{globalError}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${(!emailAddress || loading) ? 'auth-button-disabled' : ''}`}
                  onPress={handleSendCode}
                  disabled={!emailAddress || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Send Code</Text>
                  )}
                </Pressable>

                <View className="auth-link-row mt-6">
                  <Link href="/(auth)/sign-in" asChild>
                    <Pressable>
                      <Text className="auth-link">Back to Sign In</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification Code</Text>
                  <TextInput
                    className="auth-input"
                    value={code}
                    placeholder="Enter verification code"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setCode}
                    keyboardType="numeric"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">New Password</Text>
                  <TextInput
                    className="auth-input"
                    value={password}
                    placeholder="Enter new password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                  />
                </View>

                {globalError ? (
                  <Text className="auth-error text-center mt-2">{globalError}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${(!code || !password || loading) ? 'auth-button-disabled' : ''}`}
                  onPress={handleResetPassword}
                  disabled={!code || !password || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Reset Password</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
