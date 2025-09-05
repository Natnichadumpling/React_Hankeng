import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ScrollView, 
  TextInput,
  Image 
} from 'react-native';
import TabBar from './components/TabBar'; // นำเข้า TabBar
import { supabase } from './supabaseClient';

// activities จะถูกดึงจากฐานข้อมูล

const bottomTabs = [
  { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
  { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
  { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: true, navigateTo: 'ActivityScreen' },
  { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' },
];

const ActivityScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ดึงกิจกรรมจากฐานข้อมูล Supabase
  React.useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.log('Error fetching activities:', error.message);
        setActivities([]);
      } else {
        setActivities(data || []);
      }
      setIsLoading(false);
    };
    fetchActivities();
  }, []);

  // ฟังก์ชันกรองกิจกรรมตาม searchText
  // กรองเฉพาะกิจกรรมการสร้างกลุ่ม
  const filteredActivities = activities.filter(activity =>
    activity.type === 'create_group' &&
    (activity.description || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>กิจกรรม</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหากิจกรรม..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity onPress={() => navigation.navigate('ProScreen')}>
                <Text style={styles.diamondIcon}>💎</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activities List */}
          <View style={styles.activitiesContainer}>
            <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
            
            {isLoading ? (
              <View style={styles.noActivities}><Text style={styles.noActivitiesText}>กำลังโหลด...</Text></View>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Image 
                      source={activity.type === 'create_group' ? require('./assets/images/logo2.png') : require('./assets/images/logo1.png')} 
                      style={styles.activityIconImage} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{activity.description}</Text>
                    <Text style={styles.activityTime}>{activity.created_at ? new Date(activity.created_at).toLocaleString('th-TH') : ''}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noActivities}>
                <Text style={styles.noActivitiesText}>ไม่พบกิจกรรมที่ค้นหา</Text>
              </View>
            )}
          </View>

          {/* Bottom spacing for TabBar */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ImageBackground>
      
      {/* Bottom Navigation Bar */}
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
    backgroundColor: '#f5f6fa',
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
    paddingTop: 30, // ปรับลด paddingTop เพื่อลูกศรและชื่อ "กิจกรรม" ขึ้นข้างบน
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34, // เท่ากับ backButton เพื่อให้ title อยู่กลาง
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  activitiesContainer: {
    backgroundColor: '#e8f4f8',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2c5aa0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  noActivities: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default ActivityScreen;
