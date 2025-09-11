module.exports = function(api) {
  api.cache(true);  // เปิดใช้ cache เพื่อเพิ่มประสิทธิภาพในการคอมไพล์

  return {
    presets: [
      'babel-preset-expo',  // ใช้ preset ของ Expo สำหรับ React Native
    ],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',  // ใช้ plugin สำหรับ Flow
    ],
  };
};
