import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { supabase } from './supabaseClient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const PageScreen = ({ route }) => {
  const navigation = useNavigation();
  const email = route?.params?.userData?.email;
  const [userName, setUserName] = useState(''); // Default to empty string

  useEffect(() => {
    const fetchUserName = async () => {
      if (!email) {
        console.error('Email is undefined'); // Debugging log
        setUserName('Guest'); // Fallback to Guest if email is undefined
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('name')
          .eq('email', email)
          .single();

        if (error) {
          console.error('Error fetching user name:', error);
          setUserName('Guest'); // Fallback to Guest if error occurs
        } else if (data && data.name) {
          console.log('Fetched user name:', data.name); // Debugging log
          setUserName(data.name);
        }
      } catch (fetchError) {
        console.error('Unexpected error fetching user name:', fetchError);
        setUserName('Guest'); // Fallback to Guest if unexpected error occurs
      }
    };

    fetchUserName();
  }, [email]);

  return (
    <ImageBackground
      source={require('./assets/images/p2.png')}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo} />
        </View>
        
        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          ยินดีต้อนรับ{"\n"}สู่ HarnKeng ,{"\n"}
          <Text style={styles.userName}>{userName} !</Text>
        </Text>

        {/* Expense Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ค่าใช้จ่ายทั้งหมด   <Text style={styles.amount}>25,000 ฿</Text>
          </Text>
          
          {/* Item 1 - Ticket */}
          <View style={styles.itemRow}>
            <Icon name="ticket-alt" size={28} color="#1E90FF" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>ทริปภูเก็ต</Text>
              <Text style={styles.itemSubtitle}>เที่ยวเป็นหมู่คณะ</Text>
            </View>
            <Text style={styles.itemAmount}>10,500 ฿</Text>
          </View>

          {/* Item 2 - Food */}
          <View style={styles.itemRow}>
            <Icon name="utensils" size={28} color="#FF5722" style={styles.itemIcon} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>ร้านอาหาร</Text>
              <Text style={styles.itemSubtitle}>คุณเป็นหมู่คณะ</Text>
            </View>
            <Text style={styles.itemAmount}>500 ฿</Text>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Page1Screen', { email })} // เปลี่ยนตรงนี้
        >
          <Text style={styles.buttonText}>ถัดไป</Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 6,
  },
  logo: { width: 110, height: 110, resizeMode: 'contain' },
  welcomeText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#333',
    marginBottom: 25,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  card: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
  },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#16A34A' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: { marginRight: 12 },
  itemTextContainer: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  itemSubtitle: { fontSize: 14, color: '#666' },
  itemAmount: { fontSize: 15, fontWeight: 'bold', color: '#16A34A' },
  button: {
    width: 220,
    height: 55,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
  },
  buttonText: { fontSize: 20, color: 'white', fontWeight: 'bold' },
});

export default PageScreen;
