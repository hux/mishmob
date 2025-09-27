import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Vibration,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { colors, typography } from '../../styles/theme';

interface CheckInResult {
  success: boolean;
  message: string;
  user_name?: string;
  user_email?: string;
  event_title?: string;
}

interface ScanResult {
  type: string;
  data: string;
}

export const EventScannerScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId, eventTitle } = route.params as {
    eventId: string;
    eventTitle: string;
  };

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');
      
      if (locationStatus !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access helps verify check-ins. You can still scan without it.'
        );
      }
    })();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch (error) {
      console.log('Location error:', error);
    }
    return null;
  };

  const handleBarCodeScanned = async ({ type, data }: ScanResult) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);
    Vibration.vibrate(100);

    try {
      const location = await getLocation();
      
      const response = await api.post('/events/check-in', {
        qr_token: data,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      const result: CheckInResult = response.data;
      setLastResult(result);
      setScanCount(scanCount + 1);
      setResultModal(true);

      if (result.success) {
        // Success feedback
        Vibration.vibrate([0, 100, 100, 100]);
      } else {
        // Error feedback
        Vibration.vibrate(500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Check-in failed';
      setLastResult({
        success: false,
        message: errorMessage,
      });
      setResultModal(true);
      Vibration.vibrate(500);
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResultModal(false);
    setLastResult(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.eventName}>{eventTitle}</Text>
            <Text style={styles.scanCount}>Scanned: {scanCount}</Text>
          </View>
          <TouchableOpacity
            style={styles.torchButton}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Ionicons
              name={torchOn ? 'flash' : 'flash-off'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Scan Area */}
        <View style={styles.scanArea}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.processingText}>Validating...</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.footer}>
          <Text style={styles.instructions}>
            Position QR code within the frame to scan
          </Text>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={resultModal}
        onRequestClose={resetScanner}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            lastResult?.success ? styles.successModal : styles.errorModal
          ]}>
            <Ionicons
              name={lastResult?.success ? 'checkmark-circle' : 'close-circle'}
              size={64}
              color={lastResult?.success ? colors.success.main : colors.error}
            />
            
            <Text style={styles.modalTitle}>
              {lastResult?.success ? 'Check-in Successful' : 'Check-in Failed'}
            </Text>
            
            <Text style={styles.modalMessage}>{lastResult?.message}</Text>
            
            {lastResult?.success && (
              <View style={styles.attendeeInfo}>
                <Text style={styles.attendeeName}>{lastResult.user_name}</Text>
                <Text style={styles.attendeeEmail}>{lastResult.user_email}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.modalButton,
                lastResult?.success ? styles.successButton : styles.errorButton
              ]}
              onPress={resetScanner}
            >
              <Text style={styles.modalButtonText}>Scan Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body1,
    color: colors.white,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  eventName: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
  },
  scanCount: {
    ...typography.caption,
    color: colors.white,
    marginTop: 4,
  },
  torchButton: {
    padding: 8,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.white,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    top: '20%',
    left: 0,
  },
  cornerTR: {
    borderLeftWidth: 0,
    borderRightWidth: 3,
    left: undefined,
    right: 0,
  },
  cornerBL: {
    borderTopWidth: 0,
    borderBottomWidth: 3,
    top: undefined,
    bottom: '20%',
  },
  cornerBR: {
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    left: undefined,
    right: 0,
    top: undefined,
    bottom: '20%',
  },
  processingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    ...typography.body2,
    color: colors.white,
    marginTop: 12,
  },
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructions: {
    ...typography.body1,
    color: colors.white,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    minWidth: 300,
  },
  successModal: {
    borderWidth: 2,
    borderColor: colors.success.main,
  },
  errorModal: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  attendeeInfo: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    width: '100%',
  },
  attendeeName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  attendeeEmail: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  successButton: {
    backgroundColor: colors.success.main,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    ...typography.button,
    color: colors.white,
  },
});