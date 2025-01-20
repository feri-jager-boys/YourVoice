import React, { useEffect, useState, useContext } from 'react';
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useParams } from 'react-router-dom';
import { FaTrash, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Forum } from "../interfaces/Forum";

const Posts: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Track selected post for editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);

  //Theming
  const forumHoverBg = useColorModeValue('gray.50', 'gray.700');

  const loadPosts = () => {
    setLoading(true);
    fetch(
      forumId
        ? `http://localhost:3000/post/byForum/${forumId}`
        : 'http://localhost:3000/post/'
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data.reverse());
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objav:', error);
        setLoading(false);
      });
  };

  const fetchForum = () => {
    if (!forumId) {
      setForum(null);
      return;
    }

    fetch(`http://localhost:3000/forum/${forumId}?`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setForum(data);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju foruma:', error);
      });
  };

  useEffect(() => {
    fetchForum();
    loadPosts();
  }, []);

  const handlePostAdded = () => {
    loadPosts();
    setSelectedPost(null); // Reset selected post after adding
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post); // Set the selected post for editing
    onOpen(); // Open the modal
  };

  const handleDeletePost = (id: string) => {
    fetch(`http://localhost:3000/post/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          loadPosts(); // Reload posts after deletion
        } else {
          console.error('Napaka pri brisanju objave');
        }
      })
      .catch((error) => {
        console.error('Napaka pri brisanju objave:', error);
      });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    }
    return text;
  };

  return (
    <Box p={6} maxW="container.lg" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        {forumId ? forum ? forum.title : "Forum - Objave" : "Najnovejše Objave"}
      </Heading>
      {user && forumId && (
        <Button onClick={onOpen} colorScheme="blue" mb={6} id="add_new_post">
          Dodaj novo objavo
        </Button>
      )}
      {loading ? (
        <Spinner size="xl" />
      ) : posts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih objav.
        </Text>
      ) : (
        <Stack spacing={6}>
          {posts.map((post) => (
            <Link to={`/posts/${post._id}`}>
            <Box
              key={post._id}
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
                <HStack fontSize="xs" color="gray.600">
                  {post.tags.map((tag) => (
                      <Badge mb={4}>{tag.name}</Badge>
                  ))}
                </HStack>

                <Heading fontSize="2xl">{post.title}</Heading>

                <Text color="gray.500" fontSize="sm" fontStyle="italic">{truncateText(post.content, 100)}</Text>

                <Text mt={2} mb={0} fontSize="xs" color="gray.500">
                  {forumId ? '' : <>Forum: {post.forumId.title} | </>}
                  Avtor: {post?.userId?.username || 'Neznan uporabnik'}{' '}
                  - {FormatDate(post.createdAt)}
                </Text>
              </Box>

              <Box>
                <IconButton
                  size="sm"
                  mr={2}
                  aria-label={'Open post'}
                  colorScheme="blue"
                >
                  <FaArrowUpRightFromSquare />
                </IconButton>
                {user && post.userId && post.userId._id === user._id && (
                  <Box as="span" mt={4}>
                    <IconButton
                      size="sm"
                      colorScheme="yellow"
                      mr={2}
                      aria-label={'Edit post'}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEditPost(post)}}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      size="sm"
                      mr={2}
                      aria-label={'Delete post'}
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeletePost(post._id)}}
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
      <AddPostModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedPost(null); // Reset selected post when modal closes
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost} // Pass selected post to the modal
        forumId={forumId}
      />
    </Box>
  );
};

export const FormatDate = (date: string) => {
  return new Intl.DateTimeFormat(
    "sl-SI", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false})
    .format(new Date(date));
}

export default Posts;
