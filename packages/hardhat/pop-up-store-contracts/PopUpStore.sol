//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

// Import the Chainlink Aggregator interface
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract PopUpStore {
	// State Variables
	address public immutable owner;

	AggregatorV3Interface internal dataFeed;

	struct TokenArray {
		string tokenName;
		address tokenAddress;
	}

	mapping(string => uint256) public itemPrice;

	TokenArray[] public tokensArray;

	// Events: a way to emit log statements from smart contract that can be listened to by external parties
	event PaymentReceive(
		address indexed payersAddress,
		string txDetails,
		string tokenName,
		string indexed itemId,
		uint256 amount,
		address tokenAddress,
		uint256 timestamp
	);

	// Events: emit when payment token is added
	event tokenAdded(
		string indexed tokenName,
		address indexed tokenAddress,
		uint256 timestamp
	);

	// Events: emit when payment token is remove
	event tokenRemove(
		string indexed tokenName,
		address indexed tokenAddress,
		uint256 timestamp
	);

	// Events: emit when token is withdrawn
	event tokenWithdrawn(
		string indexed tokenName,
		uint256 amount,
		uint256 timestamp
	);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(
		address _owner,
		address _aggregator_address,
		string memory _token_name,
		address _token_address
	) {
		owner = _owner;
		dataFeed = AggregatorV3Interface(_aggregator_address);
		tokensArray.push(
			TokenArray({ tokenName: _token_name, tokenAddress: _token_address })
		);
	}

	/**
	 * Returns the latest answer for eth price.
	 */
	function getChainlinkDataFeedLatestAnswer() public view returns (int) {
		// prettier-ignore
		(
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
		return answer;
	}

	// Modifier: used to define a set of rules that must be met before or after a function is executed
	// Check the withdraw() function
	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	/**
	 * Function that allows anyone to pay for an item
	 *
	 * @param _amount (unit256 memory) - amount pegged to USD to be paid by user
	 * @param _token_index (string memory) - token index of the token the contracts receive payment in
	 * @param _itemId (string memory) - itemId to be paid for
	 */

	function payWithToken(
		uint256 _amount,
		uint256 _token_index,
		string memory _itemId
	) public {
		require(_token_index < tokensArray.length, "Token not found");
		require(_amount >= itemPrice[_itemId], "Insufficient _amount");

		TokenArray memory token_ = tokensArray[_token_index];

		IERC20 token = IERC20(token_.tokenAddress);

		//transfer token
		require(
			token.transferFrom(msg.sender, address(this), _amount),
			"payment reverted"
		);

		// emit: keyword used to trigger an event
		emit PaymentReceive(
			msg.sender,
			"Payment Received",
			token_.tokenName,
			_itemId,
			_amount,
			token_.tokenAddress,
			block.timestamp
		);
	}

	/**
	 * Function that allows anyone to pay for an item with ETH
	 * @param _itemId (string memory) - itemId to be paid for
	 */

	function payWithEth(string memory _itemId) public payable {
		require(msg.value > 0, "Value can not be zero");

		int ethPrice = getChainlinkDataFeedLatestAnswer();
		uint256 price = itemPrice[_itemId];

		uint256 valueInEth = safeDivision(price, ethPrice);

		require(msg.value >= valueInEth, "Insufficient msg.value");

		// emit: keyword used to trigger an event
		emit PaymentReceive(
			msg.sender,
			"Payment Received",
			"ETH",
			_itemId,
			msg.value,
			msg.sender,
			block.timestamp
		);
	}

	function safeDivision(uint256 a, int256 b) public pure returns (uint256) {
		require(b > 0, "Division by zero or negative number"); // Ensure b is positive
		uint256 result = a / uint256(b);
		return result;
	}

	/**
	 * Function that allows the owner to withdraw token in the contract
	 * The function can only be called by the owner of the contract as defined by the isOwner modifier
	 */
	function withdrawToken(
		uint256 _token_index,
		uint256 _amount
	) public isOwner {
		require(_token_index < tokensArray.length, "Token not found");
		require(_amount > 0, "cannot withdraw 0 token");

		TokenArray memory token_ = tokensArray[_token_index];

		IERC20 token = IERC20(token_.tokenAddress);

		//withdraw token
		require(token.transfer(msg.sender, _amount), "payment reverted");

		// emit event for token withdraw
		emit tokenWithdrawn(token_.tokenName, _amount, block.timestamp);
	}

	/**
	 * Function to check the token balance of this contract
	 *
	 * @param _token_index (string memory) - name of token to check balance
	 */
	function getTokenBalance(
		uint256 _token_index
	) public view returns (uint256) {
		require(_token_index < tokensArray.length, "Token not found");

		TokenArray memory token_ = tokensArray[_token_index];

		IERC20 token = IERC20(token_.tokenAddress);

		return token.balanceOf(address(this));
	}

	/**
	 * Function to add tokens payment can be recieve in
	 *
	 * @param _token_name (string memory) - name of token to check balance
	 * @param _token_address (address memory) - name of token to check balance
	 */
	function addPaymentToken(
		string memory _token_name,
		address _token_address
	) public isOwner {
		require(_token_address != address(0), "Token not found");

		tokensArray.push(
			TokenArray({ tokenName: _token_name, tokenAddress: _token_address })
		);

		// emit when token is added
		emit tokenAdded(_token_name, _token_address, block.timestamp);
	}

	/**
	 * Function to add tokens payment can be recieve in
	 *
	 * @param _token_index (address memory) - index of token to delete
	 */
	function removePaymentToken(uint256 _token_index) public isOwner {
		require(_token_index < tokensArray.length, "Token does not exist");

		// Swap the token to delete with the last token
		tokensArray[_token_index] = tokensArray[tokensArray.length - 1];

		TokenArray memory token_ = tokensArray[tokensArray.length - 1];

		tokensArray.pop();

		// emit when token is added
		emit tokenRemove(
			token_.tokenName,
			token_.tokenAddress,
			block.timestamp
		);
	}

	/**
	 * Function to set price of item
	 * @param _item_id id of item
	 * @param _price price of item
	 */
	function setPrice(string memory _item_id, uint256 _price) public isOwner {
		require(_price > 0, "Price can not be zero");

		itemPrice[_item_id] = _price;
	}

	/**
	 * Function to get all the values of the tokensArray
	 */

	function getPaymentTokens() public view returns (TokenArray[] memory) {
		return tokensArray;
	}

	/**
	 * Function that allows the owner to withdraw all the Ether in the contract
	 * The function can only be called by the owner of the contract as defined by the isOwner modifier
	 */
	function withdrawEth(uint256 _amount) public isOwner {
		require(_amount > 0, "cannot withdraw 0 ETH");
		(bool success, ) = owner.call{ value: _amount }("");
		require(success, "Failed to send Ether");
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
