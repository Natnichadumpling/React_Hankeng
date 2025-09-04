import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, TextInput, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';

const RateAppScreen = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [starAnim] = useState([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);



  const handleRate = async (star) => {
    if (rated) return;
    setRating(star);
    setLoading(true);
    setErrorMsg('');
    // Animation
    Animated.sequence([
      Animated.timing(starAnim[star-1], { toValue: 1.5, duration: 150, useNativeDriver: true }),
      Animated.timing(starAnim[star-1], { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
    // ส่งคะแนนไปที่ฐานข้อมูล
    const { error } = await supabase
      .from('app_ratings')
      .insert([{ rating: star, comment, created_at: new Date().toISOString() }]);
    setLoading(false);
    if (!error) {
      setRated(true);
    } else {
      setErrorMsg('เกิดข้อผิดพลาดในการส่งคะแนน');
    }
  };

  return (
    <ImageBackground
      source={require('./assets/images/p.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>ให้คะแนน HarnKeng</Text>

        <View style={styles.starsRow}>
          {[1,2,3,4,5].map((star, idx) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRate(star)}
              disabled={loading || rated}
              activeOpacity={0.7}
            >
              <Animated.Text style={[styles.star, rating >= star && styles.starActive, {transform:[{scale: starAnim[idx]}]}]}>★</Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.desc}>แตะดาวเพื่อให้คะแนนแอพ</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="แสดงความคิดเห็น (ถ้ามี)"
          value={comment}
          onChangeText={setComment}
          editable={!rated}
        />
        {loading && <ActivityIndicator color="#FFD700" style={{marginTop:10}} />}
        {rated && <Text style={styles.thankText}>ขอบคุณสำหรับการให้คะแนนและความคิดเห็น!</Text>}
        {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    height: 110,
    width: 110,
    backgroundColor: 'white',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 3,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c5aa0',
    textAlign: 'center',
  },
  avgText: {
    fontSize: 16,
    color: '#232323',
    marginBottom: 18,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'center',
  },
  star: {
    fontSize: 44,
    color: '#ccc',
    marginHorizontal: 8,
    textShadowColor: '#fff',
    textShadowOffset: {width:1, height:1},
    textShadowRadius: 2,
  },
  starActive: {
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: {width:2, height:2},
    textShadowRadius: 6,
  },
  desc: {
    fontSize: 15,
    color: '#232323',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  commentInput: {
    width: '100%',
    maxWidth: 320,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 18,
    fontSize: 15,
    color: '#232323',
  },
  thankText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RateAppScreen;
