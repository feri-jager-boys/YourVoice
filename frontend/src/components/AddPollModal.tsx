import React, { useState, useContext, useEffect } from 'react';
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
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';

import { UserContext } from '../userContext';
import { PollOption, Poll } from '../interfaces/Poll';

interface AddPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollAdded: () => void;
  poll: Poll | null;
  postId?: string;
}

const AddPollModal: React.FC<AddPollModalProps> = ({
  isOpen,
  onClose,
  onPollAdded,
  poll,
  postId,
}) => {
  const { user } = useContext(UserContext); // Get the currently logged-in user
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([{ _id: '1', text: '', votes: 0 }]);
  const toast = useToast();

  // Populate fields if poll is provided (for editing)
  useEffect(() => {
    if (poll) {
      setQuestion(poll.question);
      setOptions(poll.options);
    } else {
      setQuestion('');
      setOptions([{ _id: '1', text: '', votes: 0 }]);
    }
  }, [poll]);

  const handleAddOption = () => {
    setOptions([...options, { _id: (options.length + 1).toString(), text: '', votes: 0 }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, text: string) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = text;
    setOptions(updatedOptions);
  };

  const handleSubmit = () => {
    console.log("submit");
    if (!user) {
      toast({ title: 'Napaka: Uporabnik ni prijavljen.', status: 'error' });
      return;
    }

    if (!question.trim() || options.some((option) => !option.text.trim())) {
      toast({ title: 'Vse možnosti morajo biti izpolnjene.', status: 'warning' });
      return;
    }

    const url = 'http://localhost:3000/poll/';
    const method ='POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        options: options,
        userId: user._id,
        postId: postId,
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
          title: poll
            ? 'Anketa uspešno posodobljena!'
            : 'Anketa uspešno dodana!',
          status: 'success',
        });
        setQuestion('');
        setOptions([{ _id: '1', text: '', votes: 0 }]);
        onPollAdded();
        onClose();
      })
      .catch((error) => {
        console.error('Error adding/updating poll:', error);
        toast({
          title: 'Napaka pri dodajanju/posodabljanju ankete.',
          status: 'error',
        });
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{poll ? 'Uredi anketo' : 'Dodaj novo anketo'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Vprašanje</FormLabel>
            <Input
              placeholder="Vnesite vprašanje ankete"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </FormControl>
          <FormLabel>Možnosti</FormLabel>
          <VStack spacing={3} align="stretch">
            {options.map((option, index) => (
              <HStack key={index} spacing={2}>
                <Input
                  placeholder={`Možnost ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button colorScheme="red" size="sm" onClick={() => handleRemoveOption(index)}>
                    Odstrani
                  </Button>
                )}
              </HStack>
            ))}
            <Button colorScheme="blue" onClick={handleAddOption}>
              Dodaj možnost
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit} mr={3}>
            {poll ? 'Shrani' : 'Dodaj'}
          </Button>
          <Button onClick={onClose}>Prekliči</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPollModal;
