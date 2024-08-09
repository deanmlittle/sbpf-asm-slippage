
import { Connection, Keypair, SendOptions, SendTransactionError, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
import { createAssociatedTokenAccountIdempotentInstruction, createInitializeMint2Instruction, createMintToInstruction, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { BN, min } from "bn.js"
import programSeed from "../deploy/sbpf-asm-slippage-keypair.json"

const programKeypair = Keypair.fromSecretKey(new Uint8Array(programSeed))
const program = programKeypair.publicKey
const signerSeed = JSON.parse(process.env.SIGNER!)
const signer = Keypair.fromSecretKey(new Uint8Array(signerSeed))

const connection = new Connection("http://127.0.0.1:8899", {
    commitment: "confirmed"
})

const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
        signature,
        ...block,
    })
    return signature
}

const log = async (signature: string): Promise<string> => {
    console.log(`Transaction successful! https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`)
    return signature
}

const signAndSend = async(tx: Transaction, signers: Keypair[] = [signer], options?: SendOptions): Promise<string> => {
    const block = await connection.getLatestBlockhash()
    tx.recentBlockhash = block.blockhash
    tx.lastValidBlockHeight = block.lastValidBlockHeight
    const signature = await connection.sendTransaction(tx, signers, options)
    return signature
}

describe('picoIX tests', () => {
    const mint = new Keypair();
    const ata = getAssociatedTokenAddressSync(mint.publicKey, signer.publicKey)

    it('Mint a token', async () => {
        let lamports = await getMinimumBalanceForRentExemptMint(connection);
        const tx = new Transaction()
        tx.instructions = [
            SystemProgram.createAccount({
                fromPubkey: signer.publicKey,
                newAccountPubkey: mint.publicKey,
                lamports,
                space: MINT_SIZE,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(mint.publicKey, 6, signer.publicKey, null, TOKEN_PROGRAM_ID),
            createAssociatedTokenAccountIdempotentInstruction(signer.publicKey, ata, signer.publicKey, mint.publicKey),
            createMintToInstruction(mint.publicKey, ata, signer.publicKey, 1_000_000_000)
        ]
        await signAndSend(tx, [signer, mint], { skipPreflight: true }).then(confirm).then(log)
    })

    it('Check balance equal', async () => {
        const tx = new Transaction()
        const minimum_balance = new BN(1_000_000_000)
        tx.instructions = [
            new TransactionInstruction({
                keys: [{
                    pubkey: ata,
                    isSigner: false,
                    isWritable: false
                }],
                programId: program,
                data: minimum_balance.toArrayLike(Buffer, "le", 8)
            })
        ]
        await signAndSend(tx).then(confirm).then(log)
    });

    it('Check balance greater', async () => {
        const tx = new Transaction()
        const minimum_balance = new BN(2_000_000_000)
        tx.instructions = [
            new TransactionInstruction({
                keys: [{
                    pubkey: ata,
                    isSigner: false,
                    isWritable: false
                }],
                programId: program,
                data: minimum_balance.toArrayLike(Buffer, "le", 8)
            })
        ]
        await signAndSend(tx).then(confirm).then(log)
    });

    it('Check balance lesser', async () => {
        const tx = new Transaction()
        const minimum_balance = new BN(1337)
        tx.instructions = [
            new TransactionInstruction({
                keys: [{
                    pubkey: ata,
                    isSigner: false,
                    isWritable: false
                }],
                programId: program,
                data: minimum_balance.toArrayLike(Buffer, "le", 8)
            })
        ]
        try {
            await signAndSend(tx).then(confirm).then(log)
        } catch(e) {
            if ((e as SendTransactionError).logs?.findIndex((l) => l == "Program log: PicoIX: Slippage execeeded") === -1) {
                throw new Error("Unkown error")
            };
        }
    });
});
