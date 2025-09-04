import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground, TextInput } from 'react-native';
import TabBar from './components/TabBar'; // Import the TabBar component

const bottomTabs = [
  { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
  { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: true, navigateTo: 'Group3Screen' },
  { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
  { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' },
];

const Group3Screen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [userName, setUserName] = useState('');
  const route = useRoute();
  const email = route?.params?.email;

  const handleJoinGroup = () => {
    navigation.navigate('Group5Screen'); // Navigate to Group5Screen
  };

  useEffect(() => {
    const fetchUserName = async () => {
      if (!email) return;
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .single();
      if (data && data.name) setUserName(data.name);
      else setUserName(email);
    };
    fetchUserName();
  }, [email]);

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.header}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="ค้นหา"
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                  <TouchableOpacity onPress={() => navigation.navigate('ProScreen')}>
                    <Text style={styles.diamondIcon}>💎</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.headerTitle}>{userName} ยินดีต้อนรับสู่ HarnKeng</Text>
              <Text style={styles.subTitle}>ตอนนี้คุณยังไม่เข้ากลุ่ม</Text>
            </View>

            <View style={styles.groupSection}>
              <Text style={styles.infoText}>
                กลุ่มนี้จะใช้สำหรับการแจ้งการทำงานด้านต่างๆ
                เพื่อใช้ในการรายงานและสอบถามข้อมูล
              </Text>

              <TouchableOpacity
                style={styles.joinGroupButton}
                onPress={handleJoinGroup}
                activeOpacity={0.7}
              >
                <Text style={styles.joinGroupText}>เริ่มกลุ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
      
      {/* TabBar อยู่นอก ImageBackground และ SafeAreaView */}
      <TabBar bottomTabs={bottomTabs} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  searchContainer: {
    marginBottom: 20,
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eaf0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  diamondIcon: {
    fontSize: 16,
    color: '#4a90e2',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  groupSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  joinGroupButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinGroupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Group3Screen;