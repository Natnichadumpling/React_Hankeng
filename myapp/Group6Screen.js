import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const Group6Screen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hello</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
});

export default Group6Screen;
