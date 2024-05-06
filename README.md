# Aptos Airdropper

### Steps
1. Add address and amount to [User List](./src/user-list.ts) file
2. Update the network in [Airdrop](./src/airdrop.ts) file
3. Update your private key [Env](./env.example) file
4. Set the txn type to `simulate` if you only want to simulate else use `execute` to execute the airdrop transaction

> **Note:**
> You can airdrop to up to 2580 addresses in a single transaction. If the user list contains more than 2580 addresses, the airdrop will be executed in multiple transactions, each with a maximum of 2580 addresses.
