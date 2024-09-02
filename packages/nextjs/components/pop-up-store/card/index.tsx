import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const GetBalanceCard = ({ tokenName, tokenIndex }: { tokenName: string; tokenIndex: number }) => {
  const tokenIndex_ = BigInt(tokenIndex || 0);
  const { data: balance } = useScaffoldReadContract({
    contractName: "PopUpStore",
    functionName: "getTokenBalance",
    args: [tokenIndex_],
  });

  return (
    <div className="">
      <span className="ml-3 text-[14px] font-heading ">{balance ? formatEther(balance) : "0.0000"}</span>
      <span className="text-[11.2px] font-heading ml-1 uppercase">{tokenName}</span>
    </div>
  );
};
