// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampusDAOConnect {
    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
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

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => address) public voteDelegation; // delegador => delegado
    mapping(uint256 => Comment[]) public proposalComments;

    event ProposalCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string description,
        uint256 createdAt
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        address delegatedFrom
    );
    event Commented(
        uint256 indexed proposalId,
        address indexed commenter,
        string nameOrAddress,
        string comment,
        uint256 timestamp
    );
    event Delegated(address indexed delegator, address indexed delegatee);

    // Crear una nueva propuesta
    function createProposal(
        string memory title,
        string memory description
    ) public {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            creator: msg.sender,
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            createdAt: block.timestamp,
            exists: true
        });
    }

    // Delegar voto a otra dirección
    function delegateVote(address to) public {
        require(to != msg.sender, "No puedes delegar a ti mismo");
        voteDelegation[msg.sender] = to;
        emit Delegated(msg.sender, to);
    }

    // Votar una propuesta (a favor o en contra, con opción de delegar)
    function voteProposal(uint256 proposalId, bool support) public {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "La propuesta no existe");
        address voter = msg.sender;

        // Si el voto es delegado, el delegado puede votar por el delegador
        address delegator = address(0);
        if (voteDelegation[voter] != address(0)) {
            require(voteDelegation[voter] == msg.sender, "No eres el delegado");
            delegator = voter;
            voter = msg.sender;
        }

        require(!hasVoted[proposalId][voter], "Ya has votado esta propuesta");
        hasVoted[proposalId][voter] = true;

        if (support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }
        emit Voted(proposalId, voter, support, delegator);
    }

    // Comentar una propuesta
    function commentProposal(
        uint256 proposalId,
        string memory nameOrAddress,
        string memory comment
    ) public {
        require(proposals[proposalId].exists, "La propuesta no existe");
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
    function getProposal(uint256 proposalId) public view returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 createdAt
    ) {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "La propuesta no existe");
        return (
            p.id,
            p.creator,
            p.title,
            p.description,
            p.votesFor,
            p.votesAgainst,
            p.createdAt
        );
    }
}