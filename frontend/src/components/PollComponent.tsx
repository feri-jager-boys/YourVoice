import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, VStack, Text, Progress, Stack } from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { Poll } from '../interfaces/Poll';

const PollList: React.FC<{ postId: string }> = ({ postId }) => {
  const { user } = useContext(UserContext); // Get the user context
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ [pollId: string]: string }>({});

  useEffect(() => {
    fetch(`http://localhost:3000/poll/list/${postId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched polls:', data);
        setPolls(data);
      })
      .catch((error) => console.error('Error fetching polls:', error));
  }, [postId]);

  const handleOptionSelect = (pollId: string, optionId: string) => {
    console.log(`Option selected for poll ${pollId}: ${optionId}`); // Debug log
    setSelectedOption((prev) => ({ ...prev, [pollId]: optionId }));
  };

  const handleVote = (pollId: string) => {
    if (!user) {
      alert('Please log in to vote.');
      return;
    }

    const optionId = selectedOption[pollId];
    if (!optionId) {
      alert('Please select an option before voting.');
      return;
    }

    fetch(`http://localhost:3000/poll/${pollId}/vote`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId, userId: user._id }),
    })
      .then((response) => {
        if (response.status === 403) {
          alert('You have already voted on this poll.');
          return;
        }
        return response.json();
      })
      .then(() => {
        setPolls((prevPolls) =>
          prevPolls.map((poll) =>
            poll._id === pollId
              ? {
                  ...poll,
                  options: poll.options.map((option) =>
                    option._id === optionId
                      ? { ...option, votes: option.votes + 1 }
                      : option
                  ),
                  votedBy: [...poll.votedBy, user._id],
                }
              : poll
          )
        );
      })
      .catch((error) => console.error('Error voting on poll:', error));
  };

  // Check if user is logged in
  if (!user) {
    return (
      <VStack spacing={4} align="stretch">
        <Text>Please log in to view and vote on polls.</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {Array.isArray(polls) && polls.length > 0 ? (
        polls.map((poll) => {
          const userHasVoted = poll.votedBy.includes(user._id);

          return (
            <Box key={poll._id} borderWidth="1px" borderRadius="md" p={4}>
              <Text fontWeight="bold">{poll.question}</Text>
              <Stack spacing={3} mt={2}>
                {poll.options.map((option) => (
                  <Box key={option._id}>
                    <Button
                      size="sm"
                      variant={
                        selectedOption[poll._id] === option._id && !userHasVoted
                          ? 'solid'
                          : 'outline'
                      }
                      colorScheme={
                        selectedOption[poll._id] === option._id && !userHasVoted
                          ? 'blue'
                          : 'gray'
                      }
                      onClick={() => {
                        console.log(`poll._id: ${poll._id}, option._id: ${option._id}`); // Debug log
                        handleOptionSelect(poll._id, option._id);
                      }}
                      isDisabled={userHasVoted}
                    >
                      {option.text}
                    </Button>
                    <Progress
                      value={(option.votes / poll.options.reduce((sum, o) => sum + o.votes, 0)) * 100}
                      size="sm"
                      mt={1}
                    />
                    <Text fontSize="sm" color="gray.500">
                      {`${option.votes} votes (${(
                        (option.votes / poll.options.reduce((sum, o) => sum + o.votes, 0)) *
                        100
                      ).toFixed(1)}%)`}
                    </Text>
                  </Box>
                ))}
              </Stack>
              <Button
                size="sm"
                mt={4}
                colorScheme="blue"
                onClick={() => handleVote(poll._id)}
                isDisabled={!selectedOption[poll._id] || userHasVoted}
              >
                Vote
              </Button>
            </Box>
          );
        })
      ) : (
        <Text>No polls available</Text>
      )}
    </VStack>
  );
};

export default PollList;
