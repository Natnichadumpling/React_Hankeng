import * as Crypto from 'expo-crypto';

export async function hashPassword(password) {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
}