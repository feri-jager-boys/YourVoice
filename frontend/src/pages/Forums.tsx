import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  Spinner,
  useDisclosure,
  useColorModeValue, IconButton,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';
import { Forum } from '../interfaces/Forum';
import AddForumModal from '../components/AddForumModal';
import { FaArrowUpRightFromSquare, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

const Forums: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null); // Track selected post for editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);

  const loadForums = () => {
    setLoading(true);
    fetch('http://localhost:3000/forum')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setForums(data.reverse());
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju forumov:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadForums();
  }, []);

  const handleForumAdded = () => {
    loadForums();
    setSelectedForum(null); // Reset selected post after adding
  };

  const handleEditForum = (forum: Forum) => {
    setSelectedForum(forum); // Set the selected post for editing
    onOpen(); // Open the modal
  };

  const handleDeleteForum = (id: string) => {
    fetch(`http://localhost:3000/forum/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          loadForums();
        } else {
          console.error('Napaka pri brisanju foruma');
        }
      })
      .catch((error) => {
        console.error('Napaka pri brisanju foruma:', error);
      });
  };

  //Theming
  const forumHoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={6} maxW="container.lg" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Pregled Forumov
      </Heading>
      {user && (
        <Button onClick={onOpen} colorScheme="blue" id="add_forum" mb={6}>
          Dodaj nov forum
        </Button>
      )}
      {loading ? (
        <Spinner size="xl" />
      ) : forums.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih forumov.
        </Text>
      ) : (
        <Stack spacing={6}>
          {forums.map((forum) => (
            <Link to={`/forums/${forum._id}`} className="open_forum">
            <Box
              key={forum._id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: forumHoverBg }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box>
                <Heading fontSize="xl">{forum.title}</Heading>

                <Text mt={2} mb={0} fontSize="sm" color="gray.500">
                  Admin: {forum?.adminId?.username || 'Neznan uporabnik'}
                </Text>
              </Box>

              <Box>
                <IconButton
                    size="xs"
                    mr={2}
                    aria-label={'Open forum'}
                    colorScheme="blue"
                >
                  <FaArrowUpRightFromSquare />
                </IconButton>

                {user && forum.adminId && forum.adminId._id === user._id && (
                  <Box as="span" mt={4}>
                    <IconButton
                        size="xs"
                        mr={2}
                        aria-label={'Edit forum'}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleEditForum(forum)}}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                        size="xs"
                        mr={2}
                        aria-label={'Delete forum'}
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteForum(forum._id)}}
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
            </Link>
          ))}
        </Stack>
      )}
      <AddForumModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedForum(null); // Reset selected post when modal closes
        }}
        onForumAdded={handleForumAdded}
        forum={selectedForum} // Pass selected post to the modal
      />
    </Box>
  );
};

export default Forums;
