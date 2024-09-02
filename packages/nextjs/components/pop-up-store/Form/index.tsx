import { ChangeEvent, useCallback } from "react";

export const TextInput = ({
  type,
  name,
  value,
  placeholder,
  onChange,
  isDarkMode,
}: {
  type: React.HTMLInputTypeAttribute;
  name: string;
  value: string | number;
  placeholder: string;
  onChange: (newValue: string, newName: string) => void;
  isDarkMode: boolean;
}) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value, e.target.name);
    },
    [onChange],
  );

  return (
    <div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
        className={`w-full ${
          isDarkMode ? "border border-white " : "border border-black"
        } rounded-none py-3 px-4  bg-base-200  text-md focus:outline-none  transition-all duration-500`}
        autoComplete="off"
      />
    </div>
  );
};

export const TextSelect = ({
  name,
  value,
  placeholder,
  onChange,
  isDarkMode,
  tokens,
}: {
  name: string;
  value: string | number;
  placeholder: string;
  onChange: (newValue: string, newName: string) => void;
  isDarkMode: boolean;
  tokens:
    | readonly {
        tokenName: string;
        tokenAddress: string;
      }[]
    | undefined;
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value, e.target.name);
    },
    [onChange],
  );

  const options = tokens?.slice();

  options?.push({ tokenName: "Ethereum", tokenAddress: "" });

  return (
    <div>
      <select
        //type={type}
        name={name}
        //placeholder={placeholder}
        onChange={handleChange}
        value={value}
        className={`w-full ${
          isDarkMode ? "border border-white " : "border border-black"
        } rounded-none py-3 px-4 bg-base-200  text-md focus:outline-none  transition-all duration-500`}
        autoComplete="off"
      >
        <option value="">{placeholder}</option>
        {options &&
          options.map(({ tokenName }, index) => (
            <option value={index} key={index}>
              {tokenName}
            </option>
          ))}
      </select>
    </div>
  );
};
