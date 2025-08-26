import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';

function AnimalsList() {
  const [data, setData] = useState();
  useFocusEffect(useCallback(() => {
    const fetchAnimals = async () => {
      const { data, error } = await supabase.from('animals').select()
      if (error) {
        console.error('Error', error);
        return;
      }

      console.log('Animals data', data);
      setData(data)
    }
    fetchAnimals()
  }, []));

  return <View>
    {(data || []).map((animal) => (
      <View key={animal.id}>
        <Text>{animal.name} มี {animal.legs} ขา</Text>
        <Image source={{ uri: animal.picture }} style={{ width: 200, height: 200 }} />
      </View>
    ))}
  </View>
}

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <AnimalsList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 70,
    paddingTop: 50,
    position: 'absolute',
    width: '100%',
  },
  logoContainer: {
    height: 150,
    width: 150,
    backgroundColor: 'white',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    height: 120,
    width: 120,
    resizeMode: 'cover',
  },
  spacer: {
    height: 150,
  },
  spacerSmall: {
    height: 30, // Reduced the height for better positioning
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  footerLink: {
    fontSize: 14,
    color: 'rgb(2, 99, 53)',
    fontWeight: '500',
  },
  footerText: {
    color: 'grey',
    fontSize: 14,
  },
});

export default HomeScreen;
