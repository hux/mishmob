import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Title, 
  Paragraph, 
  HelperText,
  RadioButton,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../services/api';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'volunteer',
    zipCode: ''
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType,
        zip_code: formData.zipCode || undefined
      });

      setSuccess(true);
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never)
          }
        ]
      );
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Title style={styles.title}>Create Account</Title>
            <Paragraph style={styles.subtitle}>
              Join MishMob to connect with meaningful volunteer opportunities
            </Paragraph>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) => updateField('username', text)}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.username}
              autoCapitalize="none"
              disabled={loading}
            />
            <HelperText type="error" visible={!!fieldErrors.username}>
              {fieldErrors.username}
            </HelperText>

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
            />
            <HelperText type="error" visible={!!fieldErrors.email}>
              {fieldErrors.email}
            </HelperText>

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <TextInput
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  mode="outlined"
                  style={styles.input}
                  error={!!fieldErrors.firstName}
                  disabled={loading}
                />
                <HelperText type="error" visible={!!fieldErrors.firstName}>
                  {fieldErrors.firstName}
                </HelperText>
              </View>
              <View style={styles.nameField}>
                <TextInput
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  mode="outlined"
                  style={styles.input}
                  error={!!fieldErrors.lastName}
                  disabled={loading}
                />
                <HelperText type="error" visible={!!fieldErrors.lastName}>
                  {fieldErrors.lastName}
                </HelperText>
              </View>
            </View>

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.password}
              secureTextEntry
              disabled={loading}
            />
            <HelperText type="error" visible={!!fieldErrors.password}>
              {fieldErrors.password}
            </HelperText>

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.confirmPassword}
              secureTextEntry
              disabled={loading}
            />
            <HelperText type="error" visible={!!fieldErrors.confirmPassword}>
              {fieldErrors.confirmPassword}
            </HelperText>

            <View style={styles.userTypeSection}>
              <Paragraph style={styles.sectionLabel}>I want to:</Paragraph>
              <RadioButton.Group
                onValueChange={value => updateField('userType', value)}
                value={formData.userType}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="volunteer" disabled={loading} />
                  <Paragraph>Volunteer for opportunities</Paragraph>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="host" disabled={loading} />
                  <Paragraph>Host volunteer opportunities</Paragraph>
                </View>
              </RadioButton.Group>
            </View>

            <TextInput
              label="ZIP Code (Optional)"
              value={formData.zipCode}
              onChangeText={(text) => updateField('zipCode', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              maxLength={10}
              disabled={loading}
            />

            {error ? (
              <HelperText type="error" visible={true} style={styles.generalError}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.loginButton}
              disabled={loading}
            >
              Already have an account? Log In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={success}
        onDismiss={() => setSuccess(false)}
        duration={3000}
      >
        Registration successful! Please log in.
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  userTypeSection: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
  },
  loginButton: {
    marginTop: 12,
  },
  generalError: {
    marginTop: 8,
    fontSize: 14,
  },
});