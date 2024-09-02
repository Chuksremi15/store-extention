import { ReactNode } from "react";
import { formatEther } from "viem";

export const tableHeaders = ["S/N", "Address", "Amount", "Token", "Date"];

export const PaymentEventTable = ({
  headerContent,
  children,
}: {
  headerContent: string[];
  children: Iterable<ReactNode>;
}) => {
  return (
    <table>
      <thead>
        <tr className="bg-base-300 border-b">
          {headerContent.map((title, index) => (
            <th scope="col" key={index} className="text-start p-4 text-base font-body whitespace-nowrap">
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export const TableBody = ({
  args,
  index,
}: {
  args: {
    payersAddress?: string | undefined;
    txDetails?: string | undefined;
    itemId?: string | undefined;
    amount?: bigint | undefined;
    tokenName?: string | undefined;
    tokenAddress?: string | undefined;
    timestamp?: bigint | undefined;
  };
  index: number;
}) => {
  const date = new Date(Number(args.timestamp) * 1000);
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();

  const amount = args.amount && formatEther(args.amount);

  return (
    <tr className="border-b " key={index}>
      <td className="p-4 font-body">{index + 1}</td>
      <td className="p-4 font-body">{args.payersAddress}</td>
      <td className="p-4  font-body">${amount}</td>
      <td className="p-4  font-body">{args.tokenName}</td>
      <td className="p-4 font-body">
        {dateString} {" at "} {timeString}
      </td>
    </tr>
  );
};
