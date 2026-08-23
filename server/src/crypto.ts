import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { env } from "./env.js"

function credentialsKey(): Buffer {
  const raw = env.modelCredentialsKey

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex")
  }

  return createHash("sha256").update(raw).digest()
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", credentialsKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":")

  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid ciphertext")
  }

  const decipher = createDecipheriv("aes-256-gcm", credentialsKey(), Buffer.from(ivB64, "base64"))
  decipher.setAuthTag(Buffer.from(tagB64, "base64"))

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8")
}

export function secretLast4(secret: string): string {
  return secret.slice(-4)
}
