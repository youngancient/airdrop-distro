// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

contract FreeToken {
    mapping(address => uint) public balances;
    address public owner;
    string internal name;
    string internal symbol;
    uint256 internal currentSupply;

    uint256 constant MAX_SUPPLY = 1_000_000 * 1e18;

    constructor(string memory _name, string memory _symbol) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
    }

    // Anyone can mint
    function mintToken(uint amount, address to) external {
        // cannot mint to zero address
        require(to != address(0), "Cannot mint to Zero address");
        // cannot mint 0 tokens
        require(amount > 0, "Cannot mint 0 tokens");
        // cannot mint above max supply
        require(
            amount + currentSupply <= MAX_SUPPLY,
            "Cannot exceed max_supply"
        );
        balances[to] += amount;
    }

    // Allow transfer of dummy between addresses
    function transferToken(uint amount, address to) external {
        require(amount > 0, "Cannot transfer 0 tokens");
        require(balances[msg.sender] > amount, "Insufficient balance");
        require(to != msg.sender, "Invalid request");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    // get token detail
    function getTokenDetail()
        external
        view
        returns (
            string memory _name,
            string memory _symbol,
            uint256 _currentSupply,
            uint256 _maxSupply
        )
    {
        return (name, symbol, currentSupply, MAX_SUPPLY);
    }
}
