// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampusDAOConnect {
    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 createdAt;
        bool exists;
    }

    struct Comment {
        address commenter;
        string nameOrAddress;
        string comment;
        uint256 timestamp;
    }

    struct Follower {
        address follower;
        uint256 timestamp;
        bool isFollowing;
    }

    struct Vote {
        address voter;
        bool support;
        string reason;
        uint256 timestamp;
        address delegatedFrom;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => Vote[]) public proposalVotes;
    mapping(address => address) public voteDelegation; // delegador => delegado
    mapping(uint256 => Comment[]) public proposalComments;
    mapping(uint256 => Follower[]) public proposalFollowers;
    mapping(uint256 => mapping(address => bool)) public isFollowing;

    event ProposalCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string description,
        string category,
        uint256 createdAt
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        string reason,
        address delegatedFrom,
        uint256 timestamp
    );
    event Commented(
        uint256 indexed proposalId,
        address indexed commenter,
        string nameOrAddress,
        string comment,
        uint256 timestamp
    );
    event Delegated(address indexed delegator, address indexed delegatee);
    event Followed(
        uint256 indexed proposalId,
        address indexed follower,
        uint256 timestamp
    );
    event Unfollowed(
        uint256 indexed proposalId,
        address indexed follower,
        uint256 timestamp
    );

    // Crear una nueva propuesta
    function createProposal(
        string memory title,
        string memory description,
        string memory category
    ) public {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            creator: msg.sender,
            title: title,
            description: description,
            category: category,
            votesFor: 0,
            votesAgainst: 0,
            createdAt: block.timestamp,
            exists: true
        });

        emit ProposalCreated(
            proposalCount,
            msg.sender,
            title,
            description,
            category,
            block.timestamp
        );
    }

    // Delegar voto a otra dirección
    function delegateVote(address to) public {
        require(to != msg.sender, "Cannot delegate to yourself");
        voteDelegation[msg.sender] = to;
        emit Delegated(msg.sender, to);
    }

    // Votar una propuesta (a favor o en contra, con opción de delegar)
    function voteProposal(uint256 proposalId, bool support, string memory reason) public {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "Proposal does not exist");
        
        address voter = msg.sender;

        // Si el voto es delegado, el delegado puede votar por el delegador
        address delegator = address(0);
        if (voteDelegation[voter] != address(0)) {
            require(voteDelegation[voter] == msg.sender, "You are not the delegate");
            delegator = voter;
            voter = msg.sender;
        }

        require(!hasVoted[proposalId][voter], "You have already voted on this proposal");
        hasVoted[proposalId][voter] = true;

        if (support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }

        // Guardar el voto con su razón
        proposalVotes[proposalId].push(Vote({
            voter: voter,
            support: support,
            reason: reason,
            timestamp: block.timestamp,
            delegatedFrom: delegator
        }));

        emit Voted(proposalId, voter, support, reason, delegator, block.timestamp);
    }

    // Comentar una propuesta
    function commentProposal(
        uint256 proposalId,
        string memory nameOrAddress,
        string memory comment
    ) public {
        require(proposals[proposalId].exists, "Proposal does not exist");
        proposalComments[proposalId].push(
            Comment({
                commenter: msg.sender,
                nameOrAddress: nameOrAddress,
                comment: comment,
                timestamp: block.timestamp
            })
        );
        emit Commented(proposalId, msg.sender, nameOrAddress, comment, block.timestamp);
    }

    // Obtener comentarios de una propuesta
    function getComments(uint256 proposalId) public view returns (Comment[] memory) {
        return proposalComments[proposalId];
    }

    // Obtener datos de una propuesta
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "Proposal does not exist");
        return p;
    }

    // Obtener votos de una propuesta
    function getVotes(uint256 proposalId) public view returns (Vote[] memory) {
        return proposalVotes[proposalId];
    }

    // Seguir una propuesta
    function followProposal(uint256 proposalId) public {
        require(proposals[proposalId].exists, "Proposal does not exist");
        require(!isFollowing[proposalId][msg.sender], "You are already following this proposal");

        isFollowing[proposalId][msg.sender] = true;
        proposalFollowers[proposalId].push(Follower({
            follower: msg.sender,
            timestamp: block.timestamp,
            isFollowing: true
        }));

        emit Followed(proposalId, msg.sender, block.timestamp);
    }

    // Dejar de seguir una propuesta
    function unfollowProposal(uint256 proposalId) public {
        require(proposals[proposalId].exists, "Proposal does not exist");
        require(isFollowing[proposalId][msg.sender], "You are not following this proposal");

        isFollowing[proposalId][msg.sender] = false;
        
        // Actualizar el estado en el array de seguidores
        for (uint i = 0; i < proposalFollowers[proposalId].length; i++) {
            if (proposalFollowers[proposalId][i].follower == msg.sender) {
                proposalFollowers[proposalId][i].isFollowing = false;
                break;
            }
        }

        emit Unfollowed(proposalId, msg.sender, block.timestamp);
    }

    // Obtener seguidores de una propuesta
    function getFollowers(uint256 proposalId) public view returns (Follower[] memory) {
        return proposalFollowers[proposalId];
    }

    // Verificar si una dirección sigue una propuesta
    function checkIfFollowing(uint256 proposalId, address follower) public view returns (bool) {
        return isFollowing[proposalId][follower];
    }
}