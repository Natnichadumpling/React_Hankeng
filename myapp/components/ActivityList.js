// components/ActivityList.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActivityList = ({ activities }) => {
  return (
    <View style={styles.container}>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default ActivityList;
