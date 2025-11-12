// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

interface IConfidentialToken {
    function transfer(address to, einput amount, bytes calldata inputProof) external returns (bool);
    function balanceOf(address account) external view returns (euint128);
}

/**
 * @title ConfidentialPresale
 * @notice Privacy-preserving presale contract using Zama fhEVM v0.9
 * @dev Supports encrypted contributions for maximum privacy
 */
contract ConfidentialPresale is GatewayCaller {
    // Presale parameters
    address public tokenAddress;
    address public owner;
    uint256 public rate; // Tokens per ETH (with decimals)
    uint256 public hardCap; // Maximum ETH to raise
    uint256 public softCap; // Minimum ETH to raise
    uint256 public minContribution; // Minimum contribution per address
    uint256 public maxContribution; // Maximum contribution per address
    uint256 public startTime;
    uint256 public endTime;
    bool public isEncrypted;
    
    // Presale state
    uint256 public totalRaised;
    uint256 public totalContributors;
    bool public finalized;
    bool public softCapReached;
    
    // Encrypted contributions mapping - using euint128 for larger values
    mapping(address => euint128) private _encryptedContributions;
    
    // Public contributions (when not encrypted)
    mapping(address => uint256) public contributions;
    
    // Has claimed tokens
    mapping(address => bool) public hasClaimed;
    
    // Events
    event Contribution(address indexed contributor, bool encrypted);
    event TokensClaimed(address indexed contributor, uint256 amount);
    event PresaleFinalized(bool success, uint256 totalRaised);
    event RefundClaimed(address indexed contributor, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier whileActive() {
        require(block.timestamp >= startTime, "Presale not started");
        require(block.timestamp <= endTime, "Presale ended");
        require(!finalized, "Presale finalized");
        require(totalRaised < hardCap, "Hard cap reached");
        _;
    }
    
    constructor(
        address _tokenAddress,
        uint256 _rate,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _startTime,
        uint256 _endTime,
        bool _isEncrypted
    ) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_rate > 0, "Rate must be positive");
        require(_hardCap > _softCap, "Hard cap must exceed soft cap");
        require(_maxContribution >= _minContribution, "Invalid contribution limits");
        require(_endTime > _startTime, "Invalid time range");
        
        tokenAddress = _tokenAddress;
        owner = msg.sender;
        rate = _rate;
        hardCap = _hardCap;
        softCap = _softCap;
        minContribution = _minContribution;
        maxContribution = _maxContribution;
        startTime = _startTime;
        endTime = _endTime;
        isEncrypted = _isEncrypted;
    }
    
    /**
     * @notice Contribute ETH to presale
     */
    function contribute() external payable whileActive {
        require(msg.value >= minContribution, "Below minimum contribution");
        require(msg.value <= maxContribution, "Exceeds maximum contribution");
        require(totalRaised + msg.value <= hardCap, "Exceeds hard cap");
        
        if (contributions[msg.sender] == 0 && !isEncrypted) {
            totalContributors++;
        }
        
        if (isEncrypted) {
            // Store encrypted contribution using euint128
            euint128 newContribution = TFHE.asEuint128(msg.value);
            
            if (TFHE.isInitialized(_encryptedContributions[msg.sender])) {
                _encryptedContributions[msg.sender] = TFHE.add(
                    _encryptedContributions[msg.sender],
                    newContribution
                );
            } else {
                _encryptedContributions[msg.sender] = newContribution;
                totalContributors++;
            }
            
            TFHE.allow(_encryptedContributions[msg.sender], msg.sender);
            TFHE.allowThis(_encryptedContributions[msg.sender]);
        } else {
            // Store public contribution
            contributions[msg.sender] += msg.value;
        }
        
        totalRaised += msg.value;
        
        if (totalRaised >= softCap) {
            softCapReached = true;
        }
        
        emit Contribution(msg.sender, isEncrypted);
    }
    
    /**
     * @notice Contribute with encrypted amount
     */
    function contributeEncrypted(einput amount, bytes calldata inputProof) external payable whileActive {
        require(isEncrypted, "Presale does not use encryption");
        require(msg.value >= minContribution, "Below minimum contribution");
        require(msg.value <= maxContribution, "Exceeds maximum contribution");
        require(totalRaised + msg.value <= hardCap, "Exceeds hard cap");
        
        euint128 encryptedAmount = TFHE.asEuint128(amount, inputProof);
        
        if (TFHE.isInitialized(_encryptedContributions[msg.sender])) {
            _encryptedContributions[msg.sender] = TFHE.add(
                _encryptedContributions[msg.sender],
                encryptedAmount
            );
        } else {
            _encryptedContributions[msg.sender] = encryptedAmount;
            totalContributors++;
        }
        
        TFHE.allow(_encryptedContributions[msg.sender], msg.sender);
        TFHE.allowThis(_encryptedContributions[msg.sender]);
        
        totalRaised += msg.value;
        
        if (totalRaised >= softCap) {
            softCapReached = true;
        }
        
        emit Contribution(msg.sender, true);
    }
    
    /**
     * @notice Finalize presale (owner only)
     */
    function finalize() external onlyOwner {
        require(block.timestamp > endTime || totalRaised >= hardCap, "Cannot finalize yet");
        require(!finalized, "Already finalized");
        
        finalized = true;
        
        if (totalRaised >= softCap) {
            // Transfer raised funds to owner
            payable(owner).transfer(totalRaised);
            emit PresaleFinalized(true, totalRaised);
        } else {
            emit PresaleFinalized(false, totalRaised);
        }
    }
    
    /**
     * @notice Claim tokens after successful presale
     */
    function claimTokens() external {
        require(finalized, "Presale not finalized");
        require(totalRaised >= softCap, "Soft cap not reached");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        uint256 contributionAmount;
        
        if (isEncrypted) {
            // For encrypted contributions, we'd need a decryption flow
            // For now, this is a simplified version
            revert("Use claimTokensWithDecryption for encrypted presales");
        } else {
            contributionAmount = contributions[msg.sender];
        }
        
        require(contributionAmount > 0, "No contribution found");
        
        uint256 tokenAmount = (contributionAmount * rate) / 1e18;
        hasClaimed[msg.sender] = true;
        
        // Transfer tokens to contributor
        // Note: This requires the presale contract to have been approved tokens
        // In production, implement proper token transfer logic
        
        emit TokensClaimed(msg.sender, tokenAmount);
    }
    
    /**
     * @notice Claim refund if soft cap not reached
     */
    function claimRefund() external {
        require(finalized, "Presale not finalized");
        require(totalRaised < softCap, "Soft cap was reached");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        uint256 refundAmount;
        
        if (isEncrypted) {
            revert("Use claimRefundWithDecryption for encrypted presales");
        } else {
            refundAmount = contributions[msg.sender];
        }
        
        require(refundAmount > 0, "No contribution to refund");
        
        hasClaimed[msg.sender] = true;
        contributions[msg.sender] = 0;
        
        payable(msg.sender).transfer(refundAmount);
        emit RefundClaimed(msg.sender, refundAmount);
    }
    
    /**
     * @notice Get encrypted contribution for an address
     */
    function getEncryptedContribution(address contributor) public view returns (euint128) {
        require(isEncrypted, "Presale does not use encryption");
        return _encryptedContributions[contributor];
    }
    
    /**
     * @notice Check if presale is active
     */
    function isActive() public view returns (bool) {
        return block.timestamp >= startTime &&
               block.timestamp <= endTime &&
               !finalized &&
               totalRaised < hardCap;
    }
    
    /**
     * @notice Get presale info
     */
    function getPresaleInfo() external view returns (
        uint256 _totalRaised,
        uint256 _totalContributors,
        bool _isActive,
        bool _softCapReached,
        bool _finalized
    ) {
        return (
            totalRaised,
            totalContributors,
            isActive(),
            softCapReached,
            finalized
        );
    }
}
