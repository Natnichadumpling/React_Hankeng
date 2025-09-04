import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, Image, ActivityIndicator, Animated, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RateAppScreen = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [starAnim] = useState([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]);

  const handleRate = async () => {
    if (rated || rating === 0) {
      setErrorMsg('กรุณาเลือกคะแนนก่อนส่ง');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('app_ratings')
      .insert([{ rating, created_at: new Date().toISOString() }]);

    setLoading(false);
    if (!error) {
      setRated(true);
      setShowModal(true);
    } else {
      setErrorMsg('เกิดข้อผิดพลาดในการส่งคะแนน');
    }
  };

  const animateStar = (idx) => {
    Animated.sequence([
      Animated.timing(starAnim[idx], { toValue: 1.5, duration: 150, useNativeDriver: true }),
      Animated.timing(starAnim[idx], { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  return (
    <ImageBackground
      source={require('./assets/images/p.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* AppBar ที่มีแค่ลูกศรย้อนกลับ */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#00bfff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.appBarTitle}>ให้คะแนน</Text> {/* ลบอิโมจิที่เป็นคำว่า "ให้คะแนน" */}
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star, idx) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  if (rated) return;
                  setRating(star);
                  animateStar(idx);
                }}
                disabled={loading || rated}
                activeOpacity={0.7}
              >
                <Animated.Text style={[
                  styles.star,
                  rating >= star && styles.starActive,
                  { transform: [{ scale: starAnim[idx] }] }
                ]}>★</Animated.Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.desc}>แตะดาวเพื่อเลือกคะแนน แล้วกดส่ง</Text>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRate}
            disabled={loading || rated || rating === 0}
          >
            <Text style={styles.submitText}>
              {rated ? 'ส่งแล้ว' : 'ส่งคะแนน'}
            </Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator color="#FFD700" style={{ marginTop: 10 }} />}
          {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      </View>

      {/* Modal ขอบคุณ */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>ขอบคุณค่ะ 🎉</Text>
            <Text style={styles.modalText}>ขอบคุณสำหรับการให้คะแนน!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconButton: {
    position: 'absolute',
    left: 16,
    top: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Kanit',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    height: 110,
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  star: {
    fontSize: 44,
    color: '#ccc',
    marginHorizontal: 8,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  starActive: {
    color: '#00bfff', // เปลี่ยนเป็นสีฟ้า
    textShadowColor: '#00bfff', // เปลี่ยนเป็นสีฟ้า
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  desc: {
    fontSize: 15,
    color: '#232323',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Kanit',
  },
  submitButton: {
    backgroundColor: '#00bfff', // เปลี่ยนเป็นสีฟ้า
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Kanit',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Kanit',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00bfff', // เปลี่ยนเป็นสีฟ้า
    marginBottom: 12,
    fontFamily: 'Kanit',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',  // จัดให้ข้อความอยู่ตรงกลาง
    fontFamily: 'Kanit',
  },
  modalButton: {
    backgroundColor: '#00bfff', // เปลี่ยนเป็นสีฟ้า
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RateAppScreen;
