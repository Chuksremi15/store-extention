"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { NextPage } from "next";
import { useTheme } from "next-themes";
import { formatEther } from "viem";
import { TextSelect } from "~~/components/pop-up-store/Form";
import { Button } from "~~/components/pop-up-store/button";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

const Page: NextPage = () => {
  const params = useParams<{ tag: string; itemId: string }>();

  const itemObj = {
    name: "Vamtac Graphic Tees Mens Vintage Oversized T Shirts",
    imgurl: "/store/shirt.jpg",
    description:
      "Soft and comfortable: Made of 100% pure cotton, this t shirt is soft, lightweight and comfortable to wear. The natural material is breathable, helping to regulate body temperature and preventing sweat buildup.",
  };

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { writeContractAsync: writeYourContractAsyncStore } = useScaffoldWriteContract("PopUpStore");
  const { writeContractAsync: writeYourContractAsyncToken } = useScaffoldWriteContract("USDT");
  const { data: popUpStoreData, isLoading: deployedContractLoading } = useDeployedContractInfo("PopUpStore");

  const { data: tokens } = useScaffoldReadContract({
    contractName: "PopUpStore",
    functionName: "getPaymentTokens",
  });

  const { data: productPrice, isLoading: productPriceLoading } = useScaffoldReadContract({
    contractName: "PopUpStore",
    functionName: "itemPrice",
    args: [params.itemId],
  });

  const [addTokenLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentForm, setPaymentForm] = useState<{ tokenIndex: string }>({
    tokenIndex: "",
  });

  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  const onTokenChange = (value: string, formKey: string) => {
    setPaymentForm(form => ({ ...form, [formKey]: value }));
  };

  const handlePayment = async () => {
    setPaymentLoading(true);

    try {
      console.log("form values: ", paymentForm);

      if (tokens && Number(paymentForm.tokenIndex) === tokens?.length) {
        console.log("paying with eth");

        const priceInEth = Number(formatEther(productPrice!)) / nativeCurrencyPrice;

        console.log("Price in Eth: ", priceInEth * (101 / 100));
        console.log(" scaled Eth price: ", priceInEth * 1e18);

        await writeYourContractAsyncStore({
          functionName: "payWithEth",
          args: [params.itemId],
          value: BigInt(priceInEth * 1e18),
        });

        setPaymentLoading(false);
      } else {
        if (paymentForm.tokenIndex) {
          await writeYourContractAsyncToken({
            functionName: "approve",
            args: [popUpStoreData?.address, productPrice],
          });

          await writeYourContractAsyncStore({
            functionName: "payWithToken",
            args: [productPrice, BigInt(paymentForm.tokenIndex), params.itemId],
          });

          notification.success(<div className="text-xl font-body">Payment successful</div>, {
            icon: "🎉",
          });

          setPaymentLoading(false);
        }
      }
    } catch (e) {
      console.error("Error setting:", e);
      setPaymentLoading(false);
    }
  };

  if (deployedContractLoading && productPriceLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-8">
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 ">
        <div className="relative w-full h-[300px] lg:h-[400px]">
          <img className="w-full h-full object-cover" alt="art work" width={400} height={400} src={itemObj.imgurl} />
        </div>
        <div className="">
          <h4 className="font-heading text-xl opacity-80">{itemObj.name}</h4>
          <p className="font-body text-2xl">
            $ {productPrice && Number(formatEther(productPrice)) > 0 ? formatEther(productPrice) : "0"}
          </p>
          <p className="text-body text-lg">About this item</p>
          <p className="text-body">{itemObj.description}</p>

          <div className="flex flex-col gap-y-2">
            <TextSelect
              placeholder="Select token to pay with"
              name="tokenIndex"
              isDarkMode={isDarkMode}
              value={paymentForm.tokenIndex}
              onChange={onTokenChange}
              tokens={tokens}
            />
            <Button text="Pay Now" loading={addTokenLoading} action={() => handlePayment()} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
