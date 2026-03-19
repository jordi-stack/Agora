import { PLASMA } from '../config/chains.js'
import { SAFETY } from '../config/safety.js'

const MAX_RETRIES = 3

export async function transferUSDT0(fromAccount, toAddress, amountHuman, reason) {
  if (amountHuman > SAFETY.maxSingleTx) {
    throw new Error(`Amount ${amountHuman} exceeds max single tx ${SAFETY.maxSingleTx}`)
  }

  if (amountHuman <= 0) {
    throw new Error(`Invalid amount: ${amountHuman}`)
  }

  const amountBaseUnits = BigInt(Math.round(amountHuman * 1e6))

  let lastError = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[tx] Attempt ${attempt}/${MAX_RETRIES}: Transfer ${amountHuman} USDT0 to ${toAddress.slice(0, 10)}...`)

      const result = await fromAccount.transfer({
        token: PLASMA.usdt0,
        recipient: toAddress,
        amount: amountBaseUnits,
      })

      const receipt = {
        hash: result.hash,
        from: await fromAccount.getAddress(),
        to: toAddress,
        amount: amountHuman,
        timestamp: Date.now(),
        reason,
        explorer: PLASMA.explorerTx(result.hash),
      }

      console.log(`[tx] ✅ Success: ${receipt.explorer}`)
      return receipt
    } catch (err) {
      lastError = err
      console.error(`[tx] ❌ Attempt ${attempt} failed: ${err.message}`)
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000 * attempt))
      }
    }
  }

  throw new Error(`Transfer failed after ${MAX_RETRIES} attempts: ${lastError.message}`)
}
