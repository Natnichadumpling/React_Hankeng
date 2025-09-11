import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ScrollView, 
  TextInput,
  Image,
  Dimensions,
  Platform 
} from 'react-native';
import TabBar from './components/TabBar';
import { supabase } from './supabaseClient';

const { width, height } = Dimensions.get('window');

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
  const [groupTypes, setGroupTypes] = useState([]);
  const [selectedGroupType, setSelectedGroupType] = useState('');

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
        console.log('Fetched activities:', data);
        setActivities(data || []);
      }
      setIsLoading(false);
    };
    fetchActivities();
  }, []);

  React.useEffect(() => {
    const fetchGroupTypes = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('group_activity_type')
        .distinct();
      if (error) {
        console.log('Error fetching group types:', error.message);
      } else {
        setGroupTypes(data.map((item) => item.group_activity_type));
      }
    };
    fetchGroupTypes();
  }, []);

  const filteredActivities = activities.filter(activity =>
    activity.type === 'create_group' &&
    (activity.group_activity_type || '').toLowerCase().normalize('NFC').includes(searchText.toLowerCase().normalize('NFC')) &&
    (selectedGroupType === '' || activity.group_activity_type === selectedGroupType)
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    } else if (diffHours < 168) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Header without Back Button */}
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>กิจกรรม</Text>
              <Text style={styles.headerSubtitle}>ติดตามกิจกรรมของคุณ</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.proButton}
              onPress={() => navigation.navigate('ProScreen')}
            >
          
            </TouchableOpacity>
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
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Text style={styles.clearIcon}>×</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => navigation.navigate('ProScreen')}>
                <Text style={styles.diamondIcon}>💎</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Filter Section */}
          {groupTypes.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>ประเภทกลุ่ม</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedGroupType === '' && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedGroupType('')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedGroupType === '' && styles.filterChipTextActive,
                    ]}
                  >
                    ทั้งหมด
                  </Text>
                </TouchableOpacity>
                
                {groupTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterChip,
                      selectedGroupType === type && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedGroupType(type === selectedGroupType ? '' : type)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedGroupType === type && styles.filterChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Activities Section */}
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
              <View style={styles.activityCount}>
                <Text style={styles.activityCountText}>
                  {filteredActivities.length}
                </Text>
              </View>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                  <Text style={styles.loadingText}>กำลังโหลด...</Text>
                  <View style={styles.loadingDots}>
                    <View style={[styles.loadingDot, styles.loadingDot1]} />
                    <View style={[styles.loadingDot, styles.loadingDot2]} />
                    <View style={[styles.loadingDot, styles.loadingDot3]} />
                  </View>
                </View>
              </View>
            ) : filteredActivities.length > 0 ? (
              <View style={styles.activitiesContainer}>
                {filteredActivities.map((activity, index) => (
                  <TouchableOpacity 
                    key={activity.id} 
                    style={[styles.activityCard, { marginTop: index > 0 ? 12 : 0 }]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.activityCardInner}>
                      <View style={styles.activityIconContainer}>
                        <View style={styles.activityIconBackground}>
                          <Image 
                            source={activity.type === 'create_group' ? 
                              require('./assets/images/logo2.png') : 
                              require('./assets/images/logo1.png')} 
                            style={styles.activityIconImage} 
                          />
                        </View>
                      </View>
                      
                      <View style={styles.activityContent}>
                        <Text style={styles.activityDescription}>
                          {activity.description}
                        </Text>
                        
                        <View style={styles.activityDetails}>
                          <View style={styles.activityDetailRow}>
                            <Text style={styles.activityDetailLabel}>ชื่อกลุ่ม:</Text>
                            <Text style={styles.activityDetailValue}>
                              {activity.group_name || 'ไม่ระบุ'}
                            </Text>
                          </View>
                          
                          <View style={styles.activityDetailRow}>
                            <Text style={styles.activityDetailLabel}>ประเภท:</Text>
                            <View style={styles.activityTypeTag}>
                              <Text style={styles.activityTypeTagText}>
                                {activity.group_activity_type || 'ไม่ระบุ'}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <Text style={styles.activityTime}>
                          {formatDate(activity.created_at)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>ไม่พบกิจกรรม</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchText || selectedGroupType ? 
                      'ลองปรับเงื่อนไขการค้นหาใหม่' : 
                      'ยังไม่มีกิจกรรมใดๆ'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ImageBackground>
      
      <TabBar bottomTabs={bottomTabs} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  headerOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  proButton: {
    padding: 4,
  },
  proIcon: {
    fontSize: 18,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 18,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 22,
    color: '#94a3b8',
    fontWeight: '300',
    paddingHorizontal: 8,
  },
  diamondIcon: {
    fontSize: 22,
    color: '#f59e0b',
    marginLeft: 8,
  },
  scrollContent: {
    flex: 1,
  },
  filterSection: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  filterScrollContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 60,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activitiesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  activityCount: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  activityCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  activityCardInner: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 8,
  },
  activityDetails: {
    gap: 6,
    marginBottom: 8,
  },
  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activityDetailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 6,
  },
  activityDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  activityTypeTag: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  activityTypeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: width * 0.8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ActivityScreen;
