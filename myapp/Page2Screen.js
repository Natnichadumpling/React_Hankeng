import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import { supabase } from './supabaseClient';
import { useNavigation } from '@react-navigation/native';
import TabBar from './components/TabBar'; // Import TabBar

const Page2Screen = ({ route }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [userName, setUserName] = useState('');
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const email = route?.params?.email || '';
    const fetchUserName = async () => {
      if (!email) return;
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .single();
      if (data && data.name) setUserName(data.name);
    };
    fetchUserName();
  }, [route]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*');
      if (data) setGroups(data);
    };
    fetchGroups();
  }, []);

  const latestGroups = [...groups]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 2);

  const handleGroupPress = (group) => {
    console.log('Navigating to Group5Screen with group:', group); // Debugging log
    navigation.navigate('Group5Screen', {
      groupName: group.name, // ส่งชื่อกลุ่มไปยัง Group5Screen
    });
  };

  const bottomTabs = [
    { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: true, navigateTo: 'Page2Screen' },
    { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
    { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
    { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' },
  ];

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>สวัสดี !</Text>
              <Text style={styles.nameText}>{userName || '...'}</Text>
            </View>
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>กลุ่ม</Text>
            {latestGroups.length === 0 ? (
              <Text style={{ color: '#999', fontSize: 14 }}>ไม่พบกลุ่ม</Text>
            ) : (
              latestGroups.map((group, idx) => (
                <TouchableOpacity
                  key={group.id || idx}
                  style={styles.groupCard}
                  onPress={() => handleGroupPress(group)}
                >
                  {group.image_url ? (
                    <Image
                      source={{ uri: group.image_url }}
                      style={styles.groupImage}
                    />
                  ) : (
                    <View style={styles.groupImagePlaceholder}>
                      <Text style={styles.placeholderText}>🖼️</Text>
                    </View>
                  )}
                  <Text style={styles.groupName}>{group.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </ImageBackground>
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
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  mainCard: {
    backgroundColor: '#e8f4f8',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  groupImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 24,
  },
  groupName: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
});

export default Page2Screen;