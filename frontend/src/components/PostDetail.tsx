import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Divider,
  Flex,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import CommentListComponent from './CommentListComponent';

interface UserApiResponse {
  username: string;
  _id: string;
}

export enum CommentVoteTypes {
  UPVOTE = 1,
  DOWNVOTE = 2,
}

export interface CommentApiResponse {
  _id: string;
  content: string;
  createdAt: string;
  userId: UserApiResponse;
  votes: Number;
  userVote: CommentVoteTypes;
  replies: CommentApiResponse[];
}

interface PostApiResponse {
  title: string;
  content: string;
  category: string;
  createdAt: string;
  userId?: UserApiResponse;
  comments: CommentApiResponse[];
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [parentComment, setParentComment] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();

  // Ustvarite ref za textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchPost = () => {
    setLoading(true);
    fetch(
      `http://localhost:3000/post/${id}?` +
        new URLSearchParams({
          userId: user?._id ?? '',
        }).toString()
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objave:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPost(); // Inicialno naložite podatke o objavi
  }, [id]);

  const openCommentModal = (parentCommentId: string | null) => {
    setParentComment(parentCommentId);
    onOpen();
  };

  const handleCommentSubmit = () => {
    if (newComment.trim() === '') {
      alert('Komentar ne sme biti prazen.');
      return;
    }

    if (!user) {
      alert('Prijavite se za dodajanje komentarja.');
      return;
    }

    fetch(`http://localhost:3000/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newComment,
        userId: user._id,
        parentId: parentComment,
        postId: id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri dodajanju komentarja');
        }
        console.log(response);
        return response.json();
      })
      .then((data) => {
        if (data.code === 1) {
          //alert("your comment is inappropriate");
          toast({
            title: 'Napaka pri dodajanju objave, vsebina neprimerna',
            status: 'error',
          });
        }
      })
      .then(() => {
        setNewComment(''); // Počistite vnos
        onClose();
        fetchPost(); // Ponovno naložite objavo, da pridobite najnovejše komentarje
      })
      .catch((error) => {
        console.error('Napaka pri dodajanju komentarja:', error);
      });
  };

  const handleCommentDelete = (commentId: string) => {
    if (!user) {
      alert('Prijavite se za brisanje komentarja.');
      return;
    }

    fetch(`http://localhost:3000/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri brisanju komentarja');
        }
        fetchPost(); // Ponovno naložite objavo, da pridobite najnovejše komentarje
      })
      .catch((error) => {
        console.error('Napaka pri brisanju komentarja:', error);
      });
  };

  const handleCommentUpvote = (commentId: string) => {
    if (!user) {
      alert('Prijavite se za upvote komentarja.');
      return;
    }

    fetch(`http://localhost:3000/comment/upvote/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri upvote komentarja');
        }
        fetchPost();
      })
      .catch((error) => {
        console.error('Napaka pri upvote komentarja:', error);
      });
  };

  const handleCommentDownvote = (commentId: string) => {
    if (!user) {
      alert('Prijavite se za downvote komentarja.');
      return;
    }

    fetch(`http://localhost:3000/comment/downvote/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri downvote komentarja');
        }
        fetchPost();
      })
      .catch((error) => {
        console.error('Napaka pri downvote komentarja:', error);
      });
  };
  // Theming
  const headingColor = useColorModeValue('teal.600', 'teal.400');
  const contentInfoColor = useColorModeValue('gray.500', 'gray.400');
  const contentColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box
      p={8}
      maxW="container.md"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
    >
      <Button onClick={() => navigate('/posts')} colorScheme="teal" mb={6}>
        Nazaj na objave
      </Button>
      {loading ? (
        <Spinner size="xl" />
      ) : post ? (
        <>
          <Heading
            as="h2"
            size="xl"
            mb={4}
            textAlign="center"
            color={headingColor}
          >
            {post.title}
          </Heading>
          <Divider mb={4} />
          <Flex
            justify="space-between"
            color={contentInfoColor}
            fontSize="sm"
            mb={6}
          >
            <Text>
              Kategorija: <strong>{post.category}</strong>
            </Text>
            <Text>
              Datum: <b>{new Date(post.createdAt).toLocaleDateString()}</b>
            </Text>
          </Flex>
          <Text color={contentInfoColor} fontSize="sm" mb={4}>
            Avtor:{' '}
            <strong>{post.userId?.username || 'Neznan uporabnik'}</strong>
          </Text>
          <Text fontSize="md" lineHeight="tall" mt={4} color={contentColor}>
            {post.content}
          </Text>
          <Divider my={6} />
          <Heading as="h3" size="md" mb={4}>
            Komentarji
          </Heading>

          <Button
            colorScheme="teal"
            mb={4}
            onClick={() => openCommentModal(null)}
          >
            Dodaj komentar
          </Button>

          {post.comments && post.comments.length > 0 ? (
            <CommentListComponent
              comments={post.comments}
              user={user}
              openAddCommentModal={openCommentModal}
              handleCommentDelete={handleCommentDelete}
              handleCommentUpvote={handleCommentUpvote}
              handleCommentDownvote={handleCommentDownvote}
            />
          ) : (
            <VStack alignItems="flex-start">
              <Text color="gray.500">
                Ni komentarjev. Bodite prvi, ki komentirate!
              </Text>
            </VStack>
          )}

          <Modal
            isOpen={isOpen}
            onClose={onClose}
            initialFocusRef={textareaRef}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Dodaj komentar</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Textarea
                  ref={textareaRef} // Povezava referenc
                  placeholder="Vnesite svoj komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" onClick={handleCommentSubmit}>
                  Objavi
                </Button>
                <Button onClick={onClose} ml={3}>
                  Prekliči
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Text color="red.500">Objava ni najdena.</Text>
      )}
    </Box>
  );
};

export default PostDetail;
