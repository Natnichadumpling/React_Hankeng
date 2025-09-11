import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders HomeScreen correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    expect(getByText('สมัครใช้งาน')).toBeTruthy();
    expect(getByText('เข้าสู่ระบบ')).toBeTruthy();
  });
});
