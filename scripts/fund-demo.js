import 'dotenv/config'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const SEED = process.env.WDK_SEED
const RPC = process.env.CHAIN_RPC || 'https://sepolia.drpc.org'
const USDT0 = '0xd077a400968890eacc75cdc901f0356c943e4fdb'

async function main() {
  const manager = new WalletManagerEvm(SEED, { provider: RPC })

  const treasury = await manager.getAccount(0)
  const demoBuyer = await manager.getAccount(2)

  const treasuryAddr = await treasury.getAddress()
  const demoBuyerAddr = await demoBuyer.getAddress()

  console.log('Treasury:', treasuryAddr)
  console.log('Demo Buyer:', demoBuyerAddr)

  // Transfer 0.1 USDT0 from Treasury to Demo Buyer
  const amount = BigInt(100000) // 0.1 USDT0 (6 decimals)

  console.log('\nTransferring 0.1 USDT0 to Demo Buyer...')
  const result = await treasury.transfer({
    token: USDT0,
    recipient: demoBuyerAddr,
    amount,
  })

  console.log('✅ TX Hash:', result.hash)
  console.log('Explorer:', `https://sepolia.etherscan.io/tx/${result.hash}`)
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
