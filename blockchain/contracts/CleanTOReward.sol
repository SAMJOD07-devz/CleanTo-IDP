// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CleanTOReward
 * @notice CleanTO 20% Milestone (Review II) - Minimal Local Smart Contract
 * @dev Records an approved cleanup and credits a basic CleanTO utility balance.
 *      Scoped strictly to basic mint/record functionality without staking/slashing.
 */
contract CleanTOReward {
    // Name and symbol for the utility reward unit
    string public constant name = "CleanTO Utility Reward";
    string public constant symbol = "CleanTO";

    // Contract deployer / authorized entity (in full version, the backend)
    address public owner;

    // Track total CleanTO issued across all cleanups
    uint256 public totalCleanTOIssued;

    // Mapping from user address to their CleanTO utility balance
    mapping(address => uint256) public cleanToBalance;

    // Count of cleanups recorded per user
    mapping(address => uint256) public cleanupCount;

    // Event emitted whenever a cleanup is recorded and points are credited
    event CleanupRecorded(
        address indexed user,
        uint256 score,
        uint256 rewardAmount,
        uint256 newBalance,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Records an approved cleanup and mints/credits CleanTO to the user.
     * @param user The address of the contributor who performed the cleanup.
     * @param score The verification/similarity score (e.g. 0-100) from the pipeline.
     * @return rewardAmount The amount of CleanTO credited to the user.
     */
    function recordCleanup(address user, uint256 score) external returns (uint256 rewardAmount) {
        require(user != address(0), "Invalid user address");
        require(score > 0, "Cleanup score must be greater than zero");

        // Reward calculation: for this milestone, 1 point per score point (e.g. 85 score = 85 CleanTO)
        rewardAmount = score;

        // Credit balance
        cleanToBalance[user] += rewardAmount;
        cleanupCount[user] += 1;
        totalCleanTOIssued += rewardAmount;

        emit CleanupRecorded(
            user,
            score,
            rewardAmount,
            cleanToBalance[user],
            block.timestamp
        );

        return rewardAmount;
    }

    /**
     * @notice View function to retrieve a user's current CleanTO balance.
     * @param user The address of the user.
     */
    function getBalance(address user) external view returns (uint256) {
        return cleanToBalance[user];
    }
}
