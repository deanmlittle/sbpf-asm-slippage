.globl entrypoint
entrypoint:
    ldxdw r3, [r1+0x2918]   // Get amount from IX data
    ldxdw r4, [r1+0x00a0]   // Get amount from token account
    jge r3, r4, end           // Skip to exit if balance is valid
    lddw r1, e              // Load error if slippage is exceeded
    lddw r2, 26             // Load length of error message
    call sol_log_           // Log out error message
    lddw r0, 1              // Return error code 1
end:
    exit
.extern sol_log_ sol_set_return_data
.rodata
    e: .ascii "PicoIX: Slippage execeeded"