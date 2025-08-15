import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Page1Screen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('./assets/images/p2.png')} // Path to your background image
      style={styles.container} // Apply background image to the container
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Page2Screen')}
        >
          <Text style={styles.buttonText}>เสร็จสิ้น</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  innerContainer: {
    width: '100%',
    justifyContent: 'flex-start', // Align content to the top
    alignItems: 'center',
    paddingTop: 150, // Added padding to move the button down
  },
  button: {
    width: 200, // Button width
    height: 50, // Button height
    backgroundColor: '#515351', // Button color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Button border radius
  },
  buttonText: {
    fontSize: 20, // Button text size
    color: 'white', // Button text color
  },
});

export default Page1Screen;
