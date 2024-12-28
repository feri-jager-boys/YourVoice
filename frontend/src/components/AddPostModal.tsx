// AddPostModal.tsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { ActionMeta, MultiValue, Select } from "chakra-react-select";

import { UserContext } from '../userContext';
import { Post } from '../interfaces/Post';
import { Tag } from "../interfaces/Tag";

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAdded: () => void;
  post: Post | null;
  forumId?: string;
}

export class Option {
  value: string;
  label: string;

  constructor(value: string, label: string) {
    this.value = value;
    this.label = label;
  }
}

const AddPostModal: React.FC<AddPostModalProps> = ({
  isOpen,
  onClose,
  onPostAdded,
  post, forumId,
}) => {
  const { user } = useContext(UserContext); // Get the currently logged-in user
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [allTags, setAllTags] = useState<Array<Tag>>([]);
  const [selectedTags, setSelectedTags] = useState<MultiValue<Option>>([]);
  const toast = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isAppropriate, setIsAppropriate] = useState(true);

  // Populate fields when post is provided (for editing)
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setSelectedTags(post.tags.map((tag) => { return new Option(tag._id!, tag.name) }));
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
    }
    if (forumId || post) {
      fetchTags();
    }
  }, [post]);

  const handleSubmit = () => {
    if (!user) {
      toast({ title: 'Napaka: Uporabnik ni prijavljen.', status: 'error' });
      return;
    }

    const url = post
      ? `http://localhost:3000/post/${post._id}`
      : 'http://localhost:3000/post';
    const method = post ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        content: content,
        tags: selectedTags.map((tag) => new Tag(tag.value, tag.label)),
        userId: user._id, // Include userId
        forumId: forumId, // Include forumId
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if(data.code === 1){
          //alert("your post is inappropriate");
          setIsAppropriate(false);
        }
      })
      .then(() => {
        setIsAppropriate((prev) => {
          if(prev){
            toast({
              title: post
                ? 'Objava uspešno posodobljena!'
                : 'Objava uspešno dodana!',
              status: 'success',
            });
            setTitle('');
            setContent('');
            setSelectedTags([]);
            onPostAdded();
            onClose();
          }
          else{
            toast({
              title: 'Napaka pri dodajanju objave, vsebina neprimerna',
              status: 'error',
            });
          }
          return prev;
        });
      })
      .catch((error) => {
        console.error('Error adding/updating post:', error);
        toast({
          title: 'Napaka pri dodajanju/posodabljanju objave.',
          status: 'error',
        });
      });
  };

  const fetchTags = () => {
    let forumIdForTags = forumId;
    if (forumIdForTags == undefined) {
      forumIdForTags = post?.forumId._id;
    }

    fetch(`http://localhost:3000/forum/tags/${forumIdForTags}?`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setAllTags(data);
        })
        .catch((error) => {
          console.error('Napaka pri pridobivanju značk:', error);
        });
  };

  const handleSelectChange = ((newValue: MultiValue<Option>, _: ActionMeta<Option>) => {
    setSelectedTags(newValue);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={titleInputRef} // Set focus on the first input field
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{post ? 'Uredi objavo' : 'Dodaj novo objavo'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={4}>
            <FormLabel>Naslov</FormLabel>
            <Input
              ref={titleInputRef} // Ref for focus
              placeholder="Vnesite naslov"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Značke</FormLabel>
            <Select
              closeMenuOnSelect={false}
              isMulti
              options={allTags.map((tag) => { return new Option(tag._id!, tag.name) })}
              value={selectedTags}
              onChange={handleSelectChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Vsebina</FormLabel>
            <Textarea
              placeholder="Vnesite vsebino"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit} mr={3}>
            {post ? 'Shrani' : 'Dodaj'}
          </Button>
          <Button onClick={onClose}>Prekliči</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPostModal;
