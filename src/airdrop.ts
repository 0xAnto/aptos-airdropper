import { userList } from "./user-list";
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import 'dotenv/config'

const CHUNK_SIZE = 2580;

const buildAndExecuteTransaction = async (
  aptos: Aptos,
  anto: Account,
  addresses: string[],
  amounts: number[],
  type: string
) => {
console.log("Chunk length", addresses.length)
  const transaction = await aptos.transaction.build.simple({
    sender: anto.accountAddress,
    data: {
      function: "0x1::aptos_account::batch_transfer",
      functionArguments: [addresses, amounts],
    },
  });

  if (type === "simulate") {
    const simulation = await aptos.transaction.simulate.simple({
      signerPublicKey: anto.publicKey,
      transaction,
    });
    console.log("simulation result", simulation);
  } else if (type === "execute") {
    const committedTxn = await aptos.transaction.signAndSubmitTransaction({
      transaction,
      signer: anto,
    });

    const txnReceipt = (await aptos.transaction.waitForTransaction({
      transactionHash: committedTxn.hash,
      options: {
        checkSuccess: true,
        waitForIndexer: false,
      },
    })) as UserTransactionResponse;
    console.log("txnReceipt", txnReceipt);
  } else {
    throw new Error("Invalid type");
  }
};

const main = async (type: string) => {
  
  type User = {
    address: string;
    amount: number;
  };

  const aptosConfig = new AptosConfig({
    network: Network.TESTNET,
  });

  const aptos = new Aptos(aptosConfig);
  const privateKey = process.env.PRIVATE_KEY as string
  const anto = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      privateKey
    ),
  });

  const addresses = userList.map(({ address }: User) => address);
  const amounts = userList.map(({ amount }: User) => amount);

  console.log("Total address length", addresses.length);

  if (addresses.length !== amounts.length) {
    throw new Error("Addresses and amounts must be equal");
  }

  if (addresses.length > CHUNK_SIZE) {
    const numChunks = Math.ceil(addresses.length / CHUNK_SIZE);

    const chunkPromises = Array.from({ length: numChunks }, (_, i) => {
      const start = i * CHUNK_SIZE;
      const end = (i + 1) * CHUNK_SIZE;
      const chunkAddresses = addresses.slice(start, end);
      const chunkAmounts = amounts.slice(start, end);

      return buildAndExecuteTransaction(
        aptos,
        anto,
        chunkAddresses,
        chunkAmounts,
        type
      );
    });

    await Promise.all(chunkPromises);
  } else {
    await buildAndExecuteTransaction(aptos, anto, addresses, amounts, type);
  }
};

main("simulate");
