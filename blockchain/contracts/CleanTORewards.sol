// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CleanTORewards
 * @notice CleanTO 20% Milestone (Review II) - Warm Editorial Civic-Finance Ledger
 * @dev Records approved environmental cleanups and credits CleanTO utility points.
 *      Restricts reward minting to an authorized recorder address (backend authority).
 */
contract CleanTORewards {
    string public constant name = "CleanTO Utility Reward";
    string public constant symbol = "CleanTO";

    // Authorized recorder / contract administrator
    address public owner;
    address public authorizedRecorder;

    // Total CleanTO issued across all verified cleanups
    uint256 public totalIssued;

    // Balances of verified contributors
    mapping(address => uint256) private _balances;

    // Count of verified cleanups per user
    mapping(address => uint256) public cleanupCount;

    // Emitted whenever a verified cleanup is recorded
    event CleanupRewardRecorded(
        address indexed user,
        uint256 score,
        uint256 rewardAmount,
        uint256 newBalance,
        uint256 timestamp
    );

    event RecorderUpdated(address indexed previousRecorder, address indexed newRecorder);

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == authorizedRecorder,
            "CleanTORewards: caller is not authorized to record cleanups"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedRecorder = msg.sender;
    }

    /**
     * @notice Allows owner to designate an authorized backend recorder address.
     * @param newRecorder Address of the authorized backend service.
     */
    function setAuthorizedRecorder(address newRecorder) external {
        require(msg.sender == owner, "CleanTORewards: only owner can set recorder");
        require(newRecorder != address(0), "CleanTORewards: invalid recorder address");
        address prev = authorizedRecorder;
        authorizedRecorder = newRecorder;
        emit RecorderUpdated(prev, newRecorder);
    }

    /**
     * @notice Records an approved cleanup and credits CleanTO utility points.
     * @param user The recipient contributor address.
     * @param score Verification score (e.g. 1-100) from the AI pipeline.
     */
    function recordCleanup(address user, uint256 score) external onlyAuthorized returns (uint256 rewardAmount) {
        require(user != address(0), "CleanTORewards: cannot reward the zero address");
        require(score > 0, "CleanTORewards: score must be greater than zero");

        // Conversion formula: 1 CleanTO point per verification score point
        rewardAmount = score;

        _balances[user] += rewardAmount;
        cleanupCount[user] += 1;
        totalIssued += rewardAmount;

        emit CleanupRewardRecorded(
            user,
            score,
            rewardAmount,
            _balances[user],
            block.timestamp
        );

        return rewardAmount;
    }

    /**
     * @notice Returns the CleanTO utility balance of a user.
     * @param user The address of the contributor.
     */
    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }
}
