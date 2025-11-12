// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ConfidentialToken
 * @notice Privacy-preserving ERC20 token using Zama fhEVM v0.9
 * @dev Implements encrypted balances and optional encrypted total supply using euint128 for standard ERC20 compatibility
 */
contract ConfidentialToken is GatewayCaller {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals;
    
    // Encrypted total supply (optional) - using euint128 to support 18 decimal tokens
    euint128 private _encryptedTotalSupply;
    bool public isSupplyEncrypted;
    
    // Public total supply (when not encrypted)
    uint256 public totalSupply;
    
    // Encrypted balances for each address - using euint128 for full ERC20 range
    mapping(address => euint128) private _encryptedBalances;
    
    // Encrypted allowances: owner => spender => amount
    mapping(address => mapping(address => euint128)) private _encryptedAllowances;
    
    // Owner of the contract
    address public owner;
    
    // Events
    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);
    event TotalSupplyRevealed(uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    /**
     * @notice Constructor to create a new confidential token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _decimals Number of decimals
     * @param _totalSupply Initial total supply
     * @param _encryptSupply Whether to encrypt the total supply
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        bool _encryptSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        isSupplyEncrypted = _encryptSupply;
        
        if (_encryptSupply) {
            // Store encrypted total supply using euint128
            _encryptedTotalSupply = TFHE.asEuint128(_totalSupply);
            TFHE.allowThis(_encryptedTotalSupply);
        } else {
            // Store public total supply
            totalSupply = _totalSupply;
        }
        
        // Mint all tokens to creator using euint128
        euint128 initialBalance = TFHE.asEuint128(_totalSupply);
        _encryptedBalances[msg.sender] = initialBalance;
        TFHE.allowThis(initialBalance);
        TFHE.allow(initialBalance, msg.sender);
        
        emit Transfer(address(0), msg.sender);
    }
    
    /**
     * @notice Get encrypted balance of an account
     * @param account The address to query
     * @return Encrypted balance
     */
    function balanceOf(address account) public view returns (euint128) {
        return _encryptedBalances[account];
    }
    
    /**
     * @notice Transfer tokens to another address
     * @param to Recipient address
     * @param amount Encrypted amount to transfer
     */
    function transfer(address to, einput amount, bytes calldata inputProof) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        
        // Convert input to encrypted amount using euint128
        euint128 transferAmount = TFHE.asEuint128(amount, inputProof);
        
        // Check sender has enough balance
        ebool canTransfer = TFHE.le(transferAmount, _encryptedBalances[msg.sender]);
        _transfer(msg.sender, to, transferAmount, canTransfer);
        
        return true;
    }
    
    /**
     * @notice Internal transfer function
     */
    function _transfer(
        address from,
        address to,
        euint128 amount,
        ebool isTransferAllowed
    ) internal {
        // Subtract from sender (only if transfer is allowed)
        euint128 amountToSub = TFHE.select(isTransferAllowed, amount, TFHE.asEuint128(0));
        _encryptedBalances[from] = TFHE.sub(_encryptedBalances[from], amountToSub);
        
        // Add to recipient (only if transfer is allowed)
        euint128 amountToAdd = TFHE.select(isTransferAllowed, amount, TFHE.asEuint128(0));
        _encryptedBalances[to] = TFHE.add(_encryptedBalances[to], amountToAdd);
        
        // Allow both parties to view their new balances
        TFHE.allow(_encryptedBalances[from], from);
        TFHE.allow(_encryptedBalances[to], to);
        TFHE.allowThis(_encryptedBalances[from]);
        TFHE.allowThis(_encryptedBalances[to]);
        
        emit Transfer(from, to);
    }
    
    /**
     * @notice Approve spender to spend tokens
     * @param spender Address authorized to spend
     * @param amount Encrypted amount to approve
     */
    function approve(address spender, einput amount, bytes calldata inputProof) public returns (bool) {
        euint128 approvalAmount = TFHE.asEuint128(amount, inputProof);
        
        _encryptedAllowances[msg.sender][spender] = approvalAmount;
        TFHE.allow(approvalAmount, spender);
        TFHE.allowThis(approvalAmount);
        
        emit Approval(msg.sender, spender);
        return true;
    }
    
    /**
     * @notice Transfer tokens on behalf of another address
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Encrypted amount to transfer
     */
    function transferFrom(
        address from,
        address to,
        einput amount,
        bytes calldata inputProof
    ) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        
        euint128 transferAmount = TFHE.asEuint128(amount, inputProof);
        
        // Check allowance
        ebool hasAllowance = TFHE.le(transferAmount, _encryptedAllowances[from][msg.sender]);
        
        // Check balance
        ebool hasBalance = TFHE.le(transferAmount, _encryptedBalances[from]);
        
        // Both conditions must be true
        ebool canTransfer = TFHE.and(hasAllowance, hasBalance);
        
        // Update allowance
        euint128 amountToDeduct = TFHE.select(canTransfer, transferAmount, TFHE.asEuint128(0));
        _encryptedAllowances[from][msg.sender] = TFHE.sub(
            _encryptedAllowances[from][msg.sender],
            amountToDeduct
        );
        
        // Perform transfer
        _transfer(from, to, transferAmount, canTransfer);
        
        return true;
    }
    
    /**
     * @notice Get encrypted allowance
     * @param _owner Token owner
     * @param spender Spender address
     */
    function allowance(address _owner, address spender) public view returns (euint128) {
        return _encryptedAllowances[_owner][spender];
    }
    
    /**
     * @notice Request decryption of total supply (owner only)
     * @return Request ID for gateway decryption
     */
    function requestTotalSupplyDecryption() public onlyOwner returns (uint256) {
        require(isSupplyEncrypted, "Supply is not encrypted");
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(_encryptedTotalSupply);
        
        return Gateway.requestDecryption(
            cts,
            this.callbackTotalSupply.selector,
            0,
            block.timestamp + 100,
            false
        );
    }
    
    /**
     * @notice Callback for total supply decryption
     */
    function callbackTotalSupply(
        uint256 /*requestId*/,
        uint128 decryptedSupply
    ) public onlyGateway {
        totalSupply = decryptedSupply;
        emit TotalSupplyRevealed(decryptedSupply);
    }
    
    /**
     * @notice Mint new tokens (owner only, for testing)
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        euint128 mintAmount = TFHE.asEuint128(amount);
        _encryptedBalances[to] = TFHE.add(_encryptedBalances[to], mintAmount);
        
        TFHE.allow(_encryptedBalances[to], to);
        TFHE.allowThis(_encryptedBalances[to]);
        
        if (!isSupplyEncrypted) {
            totalSupply += amount;
        } else {
            _encryptedTotalSupply = TFHE.add(_encryptedTotalSupply, mintAmount);
            TFHE.allowThis(_encryptedTotalSupply);
        }
        
        emit Transfer(address(0), to);
    }
}
