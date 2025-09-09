import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground, TextInput, Image, ScrollView } from 'react-native';
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
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
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

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, image_url');
      if (data) {
        setGroups(data);
        console.log('Fetched groups:', data); // Debugging log
      } else {
        console.error('Error fetching groups:', error); // Debugging log
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*');
      if (data) setGroupMembers(data);
    };
    fetchGroupMembers();
  }, []);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{userName} ยินดีต้อนรับสู่ HarnKeng</Text>
                <View style={{ marginBottom: 20 }} /> {/* Add spacing between welcome message and search bar */}
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
              </View>

              <View style={styles.groupSection}>
                {filteredGroups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.groupCard}
                    onPress={() => navigation.navigate('Group5Screen', { groupName: group.name })}
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
                ))}
              </View>
            </View>
          </ScrollView>
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
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  groupImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  placeholderText: {
    fontSize: 24,
    color: '#999',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
});

export default Group3Screen;