import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Card, Title, Paragraph, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verificationApi } from '../../services/api';

type VerificationStep = 'intro' | 'captureId' | 'captureSelfie' | 'processing' | 'result';
type CaptureType = 'id' | 'selfie';

interface VerificationResult {
  similarity: number;
  isVerified: boolean;
  message: string;
}

export default function IdVerificationScreen({ navigation }: any) {
  const [step, setStep] = useState<VerificationStep>('intro');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [selfieAttempts, setSelfieAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState<any>(null);
  const [captureType, setCaptureType] = useState<CaptureType>('id');

  const handleStartVerification = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required for ID verification.');
        return;
      }
    }
    setStep('captureId');
    setCaptureType('id');
  };

  const handleCapture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync({ base64: true });
      
      if (captureType === 'id') {
        setIdImage(photo.uri);
        setStep('captureSelfie');
        setCaptureType('selfie');
      } else {
        setSelfieImage(photo.uri);
        setSelfieAttempts(selfieAttempts + 1);
        setStep('processing');
        await verifyImages(idImage!, photo.uri);
      }
    }
  };

  const verifyImages = async (idImageUri: string, selfieImageUri: string) => {
    setLoading(true);
    try {
      // Call backend API
      const result = await verificationApi.verifyIdentity(idImageUri, selfieImageUri);
      setVerificationResult(result);
      setStep('result');
    } catch (error) {
      Alert.alert('Verification Error', 'Failed to verify identity. Please try again.');
      setStep('intro');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryVerification = () => {
    if (selfieAttempts < 3) {
      setStep('captureSelfie');
      setSelfieImage(null);
    } else {
      Alert.alert(
        'Verification Failed',
        'Maximum attempts reached. Please contact support for manual verification.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const renderIntro = () => (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Identity Verification</Title>
          <Paragraph style={styles.description}>
            To become a verified volunteer, we need to verify your identity. This helps ensure
            the safety of our community.
          </Paragraph>
          <Paragraph style={styles.instructions}>
            You'll need to:
          </Paragraph>
          <View style={styles.stepList}>
            <Text style={styles.stepItem}>1. Take a photo of your government-issued ID</Text>
            <Text style={styles.stepItem}>2. Take a selfie for comparison</Text>
            <Text style={styles.stepItem}>3. Wait for automated verification</Text>
          </View>
          <Paragraph style={styles.privacy}>
            Your photos are processed securely and deleted after verification.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleStartVerification} style={styles.button}>
            Start Verification
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={(ref) => setCamera(ref)}
      >
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraText}>
            {captureType === 'id' 
              ? 'Position your ID within the frame' 
              : 'Take a clear selfie'}
          </Text>
          <View style={styles.frameGuide} />
        </View>
      </CameraView>
      <Button 
        mode="contained" 
        onPress={handleCapture} 
        style={styles.captureButton}
        icon="camera"
      >
        Capture {captureType === 'id' ? 'ID' : 'Selfie'}
      </Button>
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.processingText}>Verifying your identity...</Text>
      <ProgressBar progress={0.5} color="#3B82F6" style={styles.progressBar} />
    </View>
  );

  const renderResult = () => (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{verificationResult?.isVerified ? 'Verification Successful!' : 'Verification Failed'}</Title>
          <Paragraph style={styles.resultText}>
            {verificationResult?.message}
          </Paragraph>
          {verificationResult?.isVerified && (
            <View style={styles.successContainer}>
              <Text style={styles.similarityText}>
                Match Confidence: {(verificationResult.similarity * 100).toFixed(1)}%
              </Text>
            </View>
          )}
          {!verificationResult?.isVerified && selfieAttempts < 3 && (
            <Paragraph style={styles.retryText}>
              You have {3 - selfieAttempts} attempts remaining.
            </Paragraph>
          )}
        </Card.Content>
        <Card.Actions>
          {verificationResult?.isVerified ? (
            <Button mode="contained" onPress={() => navigation.navigate('Profile')}>
              Continue to Profile
            </Button>
          ) : selfieAttempts < 3 ? (
            <Button mode="contained" onPress={handleRetryVerification}>
              Try Again
            </Button>
          ) : (
            <Button mode="outlined" onPress={() => navigation.goBack()}>
              Go Back
            </Button>
          )}
        </Card.Actions>
      </Card>
    </ScrollView>
  );

  if (!permission) {
    return <View />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {step === 'intro' && renderIntro()}
      {(step === 'captureId' || step === 'captureSelfie') && renderCamera()}
      {step === 'processing' && renderProcessing()}
      {step === 'result' && renderResult()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    margin: 8,
  },
  description: {
    marginVertical: 16,
    fontSize: 16,
    color: '#4B5563',
  },
  instructions: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  stepList: {
    marginVertical: 12,
  },
  stepItem: {
    fontSize: 15,
    color: '#4B5563',
    marginVertical: 4,
    paddingLeft: 16,
  },
  privacy: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  button: {
    marginTop: 16,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  frameGuide: {
    width: 300,
    height: 200,
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  captureButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 24,
    fontSize: 18,
    color: '#4B5563',
  },
  progressBar: {
    width: 200,
    marginTop: 16,
  },
  resultText: {
    marginVertical: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  similarityText: {
    color: '#065F46',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retryText: {
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
});