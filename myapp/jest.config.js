module.exports = {
  preset: 'react-native',  // ใช้ preset สำหรับ React Native
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',  // ใช้ babel-jest แปลงไฟล์ .js, .jsx, .ts, .tsx
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],  // กำหนดประเภทของไฟล์ที่ต้องการทดสอบ
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],  // การตั้งค่าเริ่มต้นสำหรับ react-native-gesture-handler
  transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|@react-native-picker|@react-native-community|@expo|expo|expo-crypto|expo-modules-core|react-native-vector-icons|@testing-library/react-native)/)',  // ไม่ข้ามการแปลงในบางไลบรารี
  ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
