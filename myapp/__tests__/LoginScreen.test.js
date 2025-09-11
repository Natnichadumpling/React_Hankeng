// Mock all possible alert references before imports
global.alert = jest.fn();
if (typeof window !== 'undefined') window.alert = global.alert;
if (typeof globalThis !== 'undefined') globalThis.alert = global.alert;
import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { NavigationContainer } from '@react-navigation/native';

describe('LoginScreen', () => {
  beforeEach(() => {
    global.alert = jest.fn(); // Reset mock before each test
  });

  it('renders LoginScreen correctly', () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
    expect(screen.getByPlaceholderText('ที่อยู่อีเมล')).toBeTruthy();
    expect(screen.getByPlaceholderText('รหัสผ่าน')).toBeTruthy();
  });

  it('should show alert if fields are empty', async () => {
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
    // Explicitly clear both fields
    fireEvent.changeText(screen.getByPlaceholderText('ที่อยู่อีเมล'), '');
    fireEvent.changeText(screen.getByPlaceholderText('รหัสผ่าน'), '');
    const loginButton = screen.getByTestId('loginButton');
    // Debug log for field values
    console.log('Email field value:', screen.getByPlaceholderText('ที่อยู่อีเมล').props.value);
    console.log('Password field value:', screen.getByPlaceholderText('รหัสผ่าน').props.value);
    await act(async () => {
      fireEvent.press(loginButton);
    });
    // Wait for alert to be called
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });
});
