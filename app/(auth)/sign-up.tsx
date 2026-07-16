import { useSignUp } from '@clerk/expo'
import { Link, useRouter, type Href } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, TextInput, View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'

const SafeAreaView = styled(RNSafeAreaView)

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [globalError, setGlobalError] = useState('')

  const handleSubmit = async () => {
    setGlobalError('')

    const { error } = await signUp.password({
      emailAddress,
      password,
    })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
      setGlobalError(error.message || 'Invalid email or password.')
      return
    }

    await signUp.verifications.sendEmailCode()
  }

  const handleVerify = async () => {
    setGlobalError('')

    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
      setGlobalError(error.message || 'Verification failed.')
      return
    }

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url as Href)
          }
        },
      })
    } else {
      console.error('Sign-up attempt not complete:', signUp)
    }
  }

  const loading = fetchStatus === 'fetching'

  const showVerification = 
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0

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
            
            <Text className="auth-title">
              {showVerification ? 'Verify Account' : 'Create Account'}
            </Text>
            <Text className="auth-subtitle">
              {showVerification 
                ? 'Enter the verification code sent to your email.' 
                : 'Join SubHub to track and control all your subscriptions.'}
            </Text>
          </View>

          <View className="auth-card">
            {showVerification ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification Code</Text>
                  <TextInput
                    className={`auth-input ${errors.fields.code ? 'auth-input-error' : ''}`}
                    value={code}
                    placeholder="Enter verification code"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setCode}
                    keyboardType="numeric"
                  />
                  {errors.fields.code ? (
                    <Text className="auth-error">{errors.fields.code.message}</Text>
                  ) : null}
                </View>

                {globalError ? (
                  <Text className="auth-error text-center mt-2">{globalError}</Text>
                ) : null}

                {errors.global?.[0] ? (
                  <Text className="auth-error text-center mt-2">{errors.global[0].message}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${(loading || !code) ? 'auth-button-disabled' : ''}`}
                  onPress={handleVerify}
                  disabled={loading || !code}
                >
                  {loading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button mt-2"
                  onPress={() => signUp.verifications.sendEmailCode()}
                  disabled={loading}
                >
                  <Text className="auth-secondary-button-text">I need a new code</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={`auth-input ${errors.fields.emailAddress ? 'auth-input-error' : ''}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter email"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                  />
                  {errors.fields.emailAddress ? (
                    <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
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
                    <Text className="auth-button-text">Sign up</Text>
                  )}
                </Pressable>

                <View className="auth-link-row">
                  <Text className="auth-link-copy">Already have an account? </Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <Pressable>
                      <Text className="auth-link">Sign in</Text>
                    </Pressable>
                  </Link>
                </View>

                <View nativeID="clerk-captcha" />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}