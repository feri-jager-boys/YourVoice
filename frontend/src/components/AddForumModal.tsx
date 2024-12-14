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
import { UserContext } from '../userContext';
import { Post } from '../interfaces/Post';
import {Forum} from "../interfaces/Forum";

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
    const toast = useToast();
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Populate fields when post is provided (for editing)
    useEffect(() => {
        if (forum) {
            setTitle(forum.title);
        } else {
            setTitle('');
        }
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
    ref={titleInputRef} // Ref for focus
    placeholder="Vnesite naslov"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    />
    </FormControl>
    </ModalBody>
    <ModalFooter>
    <Button colorScheme="blue" onClick={handleSubmit} mr={3}>
        {forum ? 'Shrani' : 'Dodaj'}
        </Button>
        <Button onClick={onClose}>Prekliči</Button>
        </ModalFooter>
        </ModalContent>
        </Modal>
);
};

export default AddForumModal;
