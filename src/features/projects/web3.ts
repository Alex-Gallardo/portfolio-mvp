import { type ProjectListItem } from "./types";

const WEB3_KEYWORDS = [
  "web3",
  "solidity",
  "blockchain",
  "nft",
  "ethers",
  "smart contract",
  "wallet",
];

/** True si algún tag del stack coincide (case-insensitive) con una palabra clave Web3. */
export function isWeb3Project(project: ProjectListItem): boolean {
  return project.stack.some((s) => WEB3_KEYWORDS.some((k) => s.toLowerCase().includes(k)));
}
