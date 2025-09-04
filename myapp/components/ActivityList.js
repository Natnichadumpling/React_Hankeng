import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ActivityList = ({ activities }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityRow}>
          <Image source={activity.icon} style={styles.activityIcon} />
          <Text style={styles.activityText}>{activity.text}</Text> {/* ห่อข้อความด้วย <Text> */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  activityIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  activityText: {
    fontSize: 15,
    color: '#222',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default ActivityList;
