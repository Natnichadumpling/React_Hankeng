// components/SearchBar.js
import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

const SearchBar = ({ searchText, setSearchText, onDiamondPress }) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหากลุ่ม..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText} // Update the search text
      />
      <Text style={styles.diamondIcon} onPress={onDiamondPress}>
        💎
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  diamondIcon: {
    fontSize: 20,
    marginLeft: 10,
    color: '#555',
  },
});

export default SearchBar;
