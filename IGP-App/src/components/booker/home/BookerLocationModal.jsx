// src/components/booker/home/BookerLocationModal.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

export default function BookerLocationModal({
  visible,
  initialStreet = '',
  initialCity = '',
  onClose = () => {},
  onSave = () => {},
}) {
  const { theme } = useTheme();

  const [streetAddress, setStreetAddress] = useState(initialStreet);
  const [cityState, setCityState] = useState(initialCity);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStreetAddress(initialStreet || '');
      setCityState(initialCity || '');
    }
  }, [visible]);

  const handleDetect = async () => {
    setIsDetecting(true);
    await new Promise(r => setTimeout(r, 900));
    setStreetAddress('Near City Mall, Street 2');
    setCityState('Pune, Maharashtra');
    setIsDetecting(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheetContainer}>
            <View style={[styles.sheet, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.grab, { backgroundColor: theme.colors.border }]} />

              <Text style={[styles.title, { color: theme.colors.text }]}>
                Set your location
              </Text>

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Street / Address
              </Text>
              <View style={[styles.inputBox, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <TextInput
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  placeholder="House no, street, landmark"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>

              <Text style={[styles.label, { marginTop: 10, color: theme.colors.textSecondary }]}>
                City, State
              </Text>
              <View style={[styles.inputBox, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <TextInput
                  value={cityState}
                  onChangeText={setCityState}
                  placeholder="City, State"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>

              <TouchableOpacity
                style={[styles.detectBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleDetect}
              >
                <Ionicons name="locate" size={16} color="#fff" />
                <Text style={styles.detectText}>
                  {isDetecting ? 'Detecting...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.cancel, { backgroundColor: theme.colors.inputBg }]}
                  onPress={onClose}
                >
                  <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.save, { backgroundColor: theme.colors.primary }]}
                  onPress={() => onSave({ streetAddress, cityState })}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheetContainer: { paddingBottom: Platform.OS === 'ios' ? 34 : 18 },
  sheet: { marginHorizontal: 10, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18 },
  grab: { width: 40, height: 4, borderRadius: 4, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  label: { fontSize: 12, marginBottom: 6 },
  inputBox: { borderWidth: 1, borderRadius: 10 },
  input: { padding: 12 },
  detectBtn: { marginTop: 14, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center' },
  detectText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 16 },
  cancel: { flex: 1, padding: 12, borderRadius: 10, marginRight: 10, alignItems: 'center' },
  save: { flex: 1, padding: 12, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
