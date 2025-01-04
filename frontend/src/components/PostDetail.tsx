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
  HStack,
  Badge,
  Tooltip
} from '@chakra-ui/react';

import { UserContext } from '../userContext';
import CommentListComponent from './CommentListComponent';
import { Tag } from "../interfaces/Tag";
import { FormatDate } from "../pages/Posts";
import { Forum } from "../interfaces/Forum";
import { FaLink, FaImage, FaCode, FaBold, FaItalic } from 'react-icons/fa';
import {generateHTML} from "../services/textService";

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
  tags: Tag[];
  createdAt: string;
  userId?: UserApiResponse;
  comments: CommentApiResponse[];
  forumId: Forum;
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

  const ws = useRef<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);


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

  /**
   * WebSocket Client setup.
   */
  const initializeWebSocket = () => {
    if (ws.current) return;

    const url = "ws://localhost:3000" // Websocket Server URL
    ws.current = new WebSocket(url);

    // Initial connection
    ws.current.onopen = () => {
      console.log('WebSocket connection established');
      ws.current!.send(JSON.stringify({
        type: 'client_connected',
        postId: id
      }));
    };

    handleWSMessages();
    handleWSError(); 
  }

  const handleWSMessages = () => {
    if (!ws.current) return;

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'typing' && message.postId === id) {
          setTypingUser(message.user);
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      } catch(error) {
        console.error("WebSocket Error recieving message");
      }
    };
  }

  const handleWSError = () => {
    if (ws.current) {      
      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    }
  }

  const WSConnectionClose = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'client_close',
        postId: id
      }));
      console.log("WebSocket connection closed.");
      ws.current.close();
    }
  };

  useEffect(() => {
    fetchPost();
    initializeWebSocket();

    return () => {
      WSConnectionClose();
    };
  }, [id]);

  const openCommentModal = (parentCommentId: string | null) => {
    setParentComment(parentCommentId);
    onOpen();
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    
    // Send typing notification with WebSocket
    if (ws.current && newComment.length > 0) {
      ws.current.send(
        JSON.stringify({
          type: 'typing',
          user: user?.username ?? "anonymous",
          postId: id,
        })
      );
    }
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

  const handleAddHyperlink = () => {
    setNewComment((prev) => `${prev}[Povezava](URL)`);
  };

  const handleAddImage = () => {
    setNewComment((prev) => `${prev}![Opis slike](URL)`);
  };

  const handleAddCodeBlock = () => {
    setNewComment((prev) => `${prev}\`\`\`\n// Vaša koda tukaj\n\`\`\``);
  };

  const handleAddBold = () => {
    setNewComment((prev) => `${prev}**Bold Text**`);
  };

  const handleAddItalic = () => {
    setNewComment((prev) => `${prev}*Italic Text*`);
  };

  return (
    <Box
      p={8}
      maxW="container.lg"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
    >
      <Button onClick={() => navigate(-1)} mb={6}>
        Nazaj
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
          <Divider my={6} />
          <HStack>
            <Text fontSize="sm">Značke:</Text>
            {post.tags.map((tag) => (
                <Badge mb={4}>{tag.name}</Badge>
            ))}
          </HStack>
          <Text fontSize="md"
                lineHeight="tall"
                mt={2}
                mb={2}
                color={contentColor}
                dangerouslySetInnerHTML={{ __html: generateHTML(post.content) }}>
          </Text>
          <Flex
              justify="space-between"
              color={contentInfoColor}
              fontSize="sm"
              mt={2}
          >
            <Text color={contentInfoColor} fontSize="xs" mb={0}>
              Forum: {post.forumId.title}
            </Text>
            <Text fontSize="xs" mb={0}>
              Avtor: {post.userId?.username || 'Neznan uporabnik'} - {FormatDate(post.createdAt)}
            </Text>
          </Flex>
          <Divider my={6} />
          <HStack>
            <Heading as="h3" size="md" mb={4}>
              Komentarji
            </Heading>
            {isTyping && typingUser && (
              <Text color="gray.500" fontStyle="italic">
                {typingUser} is typing...
              </Text>
            )}
          </HStack>

          <Button
            colorScheme="blue"
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

          <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={textareaRef}>
            <ModalOverlay />
            <ModalContent maxW="800px" maxH="600px" minH="300px">
              <ModalHeader>Dodaj komentar</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <Tooltip label="Krepko" aria-label="Krepko">
                    <Button colorScheme="yellow" onClick={handleAddBold} size="sm">
                      <FaBold />
                    </Button>
                  </Tooltip>

                  <Tooltip label="Poševno" aria-label="Poševno">
                    <Button colorScheme="orange" onClick={handleAddItalic} size="sm">
                      <FaItalic />
                    </Button>
                  </Tooltip>

                  <Tooltip label="Povezava" aria-label="Povezava">
                    <Button colorScheme="blue" onClick={handleAddHyperlink} size="sm">
                      <FaLink />
                    </Button>
                  </Tooltip>

                  <Tooltip label="Slika" aria-label="Slika">
                    <Button colorScheme="green" onClick={handleAddImage} size="sm">
                      <FaImage />
                    </Button>
                  </Tooltip>

                  <Tooltip label="Koda" aria-label="Koda">
                    <Button colorScheme="purple" onClick={handleAddCodeBlock} size="sm">
                      <FaCode />
                    </Button>
                  </Tooltip>
                </div>

                <Textarea
                    ref={textareaRef}
                    placeholder="Vnesite svoj komentar..."
                    value={newComment}
                    onChange={handleCommentChange}
                    h="200px"
                    resize="both"
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
