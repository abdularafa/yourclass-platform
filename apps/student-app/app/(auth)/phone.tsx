import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

export default function PhoneInputScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await response.json();
      if (data.success) {
        // Navigate to OTP screen
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor={colors.text.disabled}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOTP} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.sizes.body, color: colors.text.secondary, marginBottom: spacing.xxl },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.surface, borderRadius: 6, borderWidth: 1, borderColor: colors.border.subtle, paddingHorizontal: spacing.md, marginBottom: spacing.xl },
  countryCode: { fontSize: typography.sizes.body, color: colors.text.primary, marginRight: spacing.sm },
  input: { flex: 1, height: 44, fontSize: typography.sizes.body, color: colors.text.primary },
  button: { backgroundColor: colors.primary.default, height: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.primary.disabled },
  buttonText: { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.text.primary },
});
