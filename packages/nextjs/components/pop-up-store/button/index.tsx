export const Button = ({
  text,
  loading = false,
  action,
  isDarkMode,
}: {
  text: string;
  loading?: boolean;
  action?: () => Promise<void> | (() => void);
  isDarkMode: boolean;
}) => {
  return (
    <div
      onClick={action}
      className={`flex items-center justify-center border cursor-pointer ${
        isDarkMode ? " border-white hover:bg-white hover:text-black" : " border-black hover:bg-black hover:text-white"
      } font-heading w-full h-10 text-md  transition-all duration-500`}
    >
      {loading ? (
        <div>
          <span className="w-6 loading loading-spinner"></span>
        </div>
      ) : (
        text
      )}
    </div>
  );
};
