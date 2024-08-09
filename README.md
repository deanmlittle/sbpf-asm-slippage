# sbpf-asm-slippage

A simple, single instruction program to assert the balance of a token account is ≥ an amount in instruction data. Useful for patching slippage in frontends/wallets for _certain DeFi contracts with malfunctioning/non-existant slippage_ (ahem, iykyk) by placing this IX as a veto at the end of the transaction.

Written with ❤️ in sBPF ASM for maximum efficiency with minimal footprint.

##### Costs
Size:    `~1.3kb`
Compute: `4cus` (pass case)
IX data: `8b`

Mainnet CA: `sbpf-asm-slippageDtv5JQT6LSmxRscz6ACiDuur5ZDcRnE8JFYmw8dj`

Created with [sbpf](https://github.com/deanmlittle/sbpf)