// components/Profile.tsx
import React, { useContext } from 'react';
import { Box, Heading, Text, Button, Stack } from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';
import { FormatDate } from "./Posts";

const Profile: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Box p={6} textAlign="center">
        <Heading as="h2" size="xl" mb={6}>
          Profil uporabnika
        </Heading>
        <Text>Za ogled profila se morate prijaviti.</Text>
        <Button mt={4} colorScheme="teal" onClick={() => navigate('/login')}>
          Prijava
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="container.md" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Profil uporabnika
      </Heading>
      <Stack spacing={4}>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Ime:
          </Text>
          <Text fontSize="md">{user.username}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            E-pošta:
          </Text>
          <Text fontSize="md">{user.email}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Čas registracije:
          </Text>
          <Text fontSize="md">
            {FormatDate(user.createdAt)}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default Profile;
