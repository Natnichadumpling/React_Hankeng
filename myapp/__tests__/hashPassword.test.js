
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(() => Promise.resolve('mocked_hash')),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' }
}));

const { hashPassword } = require('../utils/hashPassword');

describe('hashPassword', () => {
  it('should hash password correctly', async () => {
    const password = 'mySecret123';
    const hash = await hashPassword(password);
    expect(hash).toBe('mocked_hash');
  });
});
