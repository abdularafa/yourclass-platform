import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@yourclass/ui-tokens';

export default function OtpVerificationScreen({ phone }: { phone: string }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpString }),
      });
      const data = await response.json();
      if (data.success) {
        // Navigate to home
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>
      
      <View style={styles.otpContainer}>
        {otp.map((_, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={otp[index]}
            onChangeText={(text) => {
              const newOtp = [...otp];
              newOtp[index] = text;
              setOtp(newOtp);
              if (text && index < 5) {
                // Focus next input
              }
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.base, padding: spacing.xl, justifyContent: 'center' },
  title: { fontSize: typography.sizes.h1, fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: typography.sizes.body, color: colors.text.secondary, marginBottom: spacing.xxl, textAlign: 'center' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.xxl },
  otpInput: { width: 48, height: 56, backgroundColor: colors.background.surface, borderRadius: 6, borderWidth: 1, borderColor: colors.border.subtle, textAlign: 'center', fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.text.primary, marginHorizontal: spacing.xs },
  button: { backgroundColor: colors.primary.default, height: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.primary.disabled },
  buttonText: { fontSize: typography.sizes.body, fontWeight: typography.weights.medium, color: colors.text.primary },
  resendButton: { marginTop: spacing.xl, alignItems: 'center' },
  resendText: { fontSize: typography.sizes.body, color: colors.primary.default },
});
