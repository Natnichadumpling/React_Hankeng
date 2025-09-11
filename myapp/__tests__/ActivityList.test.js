import React from 'react';
import { render } from '@testing-library/react-native';
import ActivityList from '../components/ActivityList';

describe('ActivityList', () => {
  it('renders ActivityList correctly', () => {
    const activities = [
      { id: 1, title: 'Run', time: '08:00' },
      { id: 2, title: 'Swim', time: '09:00' }
    ];
    const { getByText } = render(<ActivityList activities={activities} />);
    
    // ตรวจสอบว่า "Run" และ "Swim" ปรากฏใน list
    expect(getByText('Run')).toBeTruthy();
    expect(getByText('Swim')).toBeTruthy();
    expect(getByText('08:00')).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
  });
});
