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
import QRCodeScanner from 'react-native-qrcode-scanner';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CommonIcon, Icon } from '../../components/common/Icon';
import { ticketsApi } from '../../services/api';
import { colors, typography } from '../../styles/theme';

interface TicketScanResult {
  success: boolean;
  message: string;
  volunteer_name?: string;
  volunteer_email?: string;
  event_title?: string;
  check_in_time?: string;
  ticket_id?: string;
}

interface ScanResult {
  data: string;
  type?: string;
  bounds?: any;
  rawData?: string;
}

export const TicketScannerScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId, eventTitle } = route.params as {
    eventId?: string;
    eventTitle?: string;
  };

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [lastResult, setLastResult] = useState<TicketScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [sessionScans, setSessionScans] = useState<TicketScanResult[]>([]);

  useEffect(() => {
    (async () => {
      const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
      const locationStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      setHasPermission(cameraStatus === RESULTS.GRANTED);
      
      if (locationStatus !== RESULTS.GRANTED) {
        Alert.alert(
          'Location Permission',
          'Location access helps verify check-ins. You can still scan without it.'
        );
      }
    })();
  }, []);

  const getLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location error:', error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const handleBarCodeScanned = async ({ data }: ScanResult) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);
    Vibration.vibrate(100);

    try {
      const location = await getLocation();
      
      // Call the ticket scanning API
      const response = await ticketsApi.scanTicket({
        qr_token: data,
        event_id: eventId,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      const result: TicketScanResult = response.data || response;
      setLastResult(result);
      setScanCount(scanCount + 1);
      setResultModal(true);

      // Add to session scans for tracking
      setSessionScans(prev => [...prev, result]);

      if (result.success) {
        // Success feedback
        Vibration.vibrate([0, 100, 100, 100]);
      } else {
        // Error feedback
        Vibration.vibrate(500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Ticket scan failed';
      const errorResult: TicketScanResult = {
        success: false,
        message: errorMessage,
      };
      setLastResult(errorResult);
      setResultModal(true);
      setSessionScans(prev => [...prev, errorResult]);
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

  const getSuccessCount = () => {
    return sessionScans.filter(scan => scan.success).length;
  };

  const getFailureCount = () => {
    return sessionScans.filter(scan => !scan.success).length;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <CommonIcon type="camera" size={64} color={colors.error} />
        <Text style={styles.errorText}>Camera access required</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera permissions to scan tickets
        </Text>
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
      <QRCodeScanner
        onRead={scanned ? () => {} : handleBarCodeScanned}
        flashMode={torchOn ? 'torch' : 'off'}
        showMarker={false}
        cameraStyle={StyleSheet.absoluteFillObject}
        containerStyle={StyleSheet.absoluteFillObject}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <CommonIcon type="back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.screenTitle}>Ticket Scanner</Text>
            {eventTitle && <Text style={styles.eventName}>{eventTitle}</Text>}
            <View style={styles.statsRow}>
              <Text style={styles.statText}>✓ {getSuccessCount()}</Text>
              <Text style={styles.statText}>✗ {getFailureCount()}</Text>
              <Text style={styles.statText}>Total: {scanCount}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.torchButton}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Icon
              library="Ionicons"
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
              <Text style={styles.processingText}>Validating ticket...</Text>
            </View>
          )}
          
          {!processing && !scanned && (
            <View style={styles.scanInstructions}>
              <Icon
                library="MaterialCommunityIcons"
                name="qrcode-scan"
                size={48}
                color={colors.white}
              />
              <Text style={styles.scanInstructionsText}>
                Scan volunteer ticket QR code
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.instructions}>
            Position the volunteer's QR code within the frame to verify their ticket
          </Text>
          {scanCount > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setScanCount(0);
                setSessionScans([]);
                resetScanner();
              }}
            >
              <Text style={styles.resetButtonText}>Reset Session</Text>
            </TouchableOpacity>
          )}
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
            <Icon
              library="Ionicons"
              name={lastResult?.success ? 'checkmark-circle' : 'close-circle'}
              size={64}
              color={lastResult?.success ? colors.success.main : colors.error}
            />
            
            <Text style={styles.modalTitle}>
              {lastResult?.success ? 'Ticket Verified' : 'Verification Failed'}
            </Text>
            
            <Text style={styles.modalMessage}>{lastResult?.message}</Text>
            
            {lastResult?.success && (
              <View style={styles.volunteerInfo}>
                <Text style={styles.volunteerName}>{lastResult.volunteer_name}</Text>
                <Text style={styles.volunteerEmail}>{lastResult.volunteer_email}</Text>
                {lastResult.check_in_time && (
                  <Text style={styles.checkInTime}>
                    Checked in: {new Date(lastResult.check_in_time).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            )}
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  lastResult?.success ? styles.successButton : styles.errorButton
                ]}
                onPress={resetScanner}
              >
                <Text style={styles.modalButtonText}>Scan Next</Text>
              </TouchableOpacity>
              
              {!lastResult?.success && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={resetScanner}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
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
  loadingText: {
    ...typography.body1,
    color: colors.white,
    marginTop: 16,
  },
  errorText: {
    ...typography.h3,
    color: colors.white,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    ...typography.body2,
    color: colors.white,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 24,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  screenTitle: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
  },
  eventName: {
    ...typography.body2,
    color: colors.white,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  statText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
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
  scanInstructions: {
    position: 'absolute',
    alignItems: 'center',
    bottom: -60,
  },
  scanInstructionsText: {
    ...typography.body2,
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  instructions: {
    ...typography.body1,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  resetButtonText: {
    ...typography.body2,
    color: colors.white,
    fontWeight: '600',
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
    maxWidth: 400,
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
    textAlign: 'center',
  },
  modalMessage: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  volunteerInfo: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    width: '100%',
  },
  volunteerName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  volunteerEmail: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  checkInTime: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flex: 1,
  },
  successButton: {
    backgroundColor: colors.success.main,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.text.secondary,
    flex: 1,
  },
  modalButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
  },
});