// AddForumModal.tsx
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
    useToast,
    VStack,
} from '@chakra-ui/react';

import { UserContext } from '../userContext';
import { Forum } from "../interfaces/Forum";
import EditTagComponent from "./EditTagComponent";
import { Tag } from "../interfaces/Tag";

interface AddForumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onForumAdded: () => void;
    forum: Forum | null;
}

const AddForumModal: React.FC<AddForumModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onForumAdded,
                                                       forum,
                                                   }) => {
    const { user } = useContext(UserContext); // Get the currently logged-in user
    const [title, setTitle] = useState('');
    const [tagName, setTagName] = useState('');
    const [tags, setTags] = useState<Array<Tag>>([]);
    const toast = useToast();
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Populate fields when post is provided (for editing)
    useEffect(() => {
        if (forum) {
            setTitle(forum.title);
            fetchTags();
        } else {
            setTitle('');
            setTags([]);
        }
        setTagName('');
    }, [forum]);

    const handleSubmit = () => {
        if (!user) {
            toast({ title: 'Napaka: Uporabnik ni prijavljen.', status: 'error' });
            return;
        }

        const url = forum
            ? `http://localhost:3000/forum/${forum._id}`
            : 'http://localhost:3000/forum';
        const method = forum ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                admin: user._id, // Include userId
                tags: tags,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                toast({
                    title: forum
                        ? 'Forum uspešno posodobljen!'
                        : 'Forum uspešno dodan!',
                    id: "forum_added_success",
                    status: 'success',
                });
                setTitle('');
                onForumAdded();
                onClose();
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
        fetch(`http://localhost:3000/forum/tags/${forum!._id}?`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setTags(data);
            })
            .catch((error) => {
                console.error('Napaka pri pridobivanju značk:', error);
            });
    };

    const handleTagDelete = (deleteTag: Tag) => {
        setTags(tags => tags.filter((tag) => tag.name !== deleteTag.name));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            initialFocusRef={titleInputRef} // Set focus on the first input field
        >
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{forum ? 'Uredi forum' : 'Dodaj nov forum'}</ModalHeader>

            <ModalCloseButton />

            <ModalBody pb={6}>
                <FormControl mb={4}>
                    <FormLabel>Naslov</FormLabel>
                    <Input
                        id="title_input"
                        ref={titleInputRef} // Ref for focus
                        placeholder="Vnesite naslov"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}/>
                </FormControl>

                <FormControl mb={4}>
                    <FormLabel>Značke</FormLabel>
                    <VStack spacing={4} align="start">
                        {tags
                            .map((tag) => (
                                <EditTagComponent
                                    key={tag._id}
                                    tag={tag}
                                    user={user}
                                    forum={forum}
                                    handleTagDelete={handleTagDelete} />
                            ))}
                    </VStack>
                    <Input
                        mt={3}
                        placeholder="Ime nove značko"
                        value={tagName}
                        onChange={ (e) => setTagName(e.target.value) } />
                    <Button
                        size="sm"
                        mt={3}
                        colorScheme="gray"
                        onClick={() => {
                            if (!tags.find(x => x.name == tagName) && tagName != "") {
                                tags.push(new Tag(undefined, tagName));
                                setTagName("")
                            }}}
                        mr={3}>Dodaj značko</Button>
                </FormControl>
            </ModalBody>

            <ModalFooter>
                <Button id="add_forum_modal" colorScheme="blue" onClick={handleSubmit} mr={3}>{forum ? 'Shrani' : 'Dodaj'}</Button>
                <Button onClick={onClose}>Prekliči</Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    );
};

export default AddForumModal;
