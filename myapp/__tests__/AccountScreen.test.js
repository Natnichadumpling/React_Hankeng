import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AccountScreen from '../AccountScreen';

// Mock supabase client to prevent real network calls
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { name: 'Test User', email: 'test@example.com' }, error: null })
        })
      })
    })
  }
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: jest.fn().mockReturnValue({
    params: { email: 'test@example.com', userName: 'Test User' },
  }),
}));

describe('AccountScreen', () => {
  it('renders AccountScreen correctly', async () => {
    render(
      <NavigationContainer>
        <AccountScreen />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(screen.getByText('บัญชี')).toBeTruthy();
      expect(screen.getByText('ออกจากระบบ')).toBeTruthy();
      expect(screen.getByText('การตั้งค่าบัญชี')).toBeTruthy();
    });
  });
});
