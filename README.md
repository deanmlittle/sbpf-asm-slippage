# sbpf-asm-slippage

A simple, single instruction program to assert the balance of a token account is ≥ an amount in instruction data. Useful for patching slippage in frontends/wallets for _certain DeFi contracts with malfunctioning/non-existant slippage_ (ahem, iykyk) by placing this IX as a veto at the end of the contract.

Written with ❤️ in sBPF ASM for maximum efficiency. Only costs `4cus` and `8 bytes` of IX data.

Mainnet CA: `sbpf-asm-slippageDtv5JQT6LSmxRscz6ACiDuur5ZDcRnE8JFYmw8dj`

Created with [sbpf](https://github.com/deanmlittle/sbpf)