import {
  Box,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import Posts from "./Posts";

const Home: React.FC = () => {
  // Theming
  const bg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box>
    <Box p={6} bg={bg}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={8}
        align="center"
        justify="space-between"
        maxW="container.xl"
        mx="auto"
      >
        {/* Left Column */}
        <Box flex={1} textAlign={{ base: 'center', md: 'left' }} px={4}>
          <Heading as="h1" size="xl" color={headingColor} mb={4}>
            Dobrodošli doma!
          </Heading>
          <Text fontSize="" color={textColor} mb={6}>
            YourVoice je interaktivni forum, zasnovan za izmenjavo informacij in
            povezovanje uporabnikov. Aplikacija omogoča prijavljenim
            uporabnikom, da objavljajo svoje vsebine, komentirajo, ocenjujejo
            objave drugih ter urejajo svoj profil. Prijavljeni uporabniki lahko
            tudi aktivno sodelujejo pri predlogih in ocenjevanju izboljšav
            spletnega foruma. Neprijavljeni uporabniki lahko brskajo po objavah,
            vendar brez možnosti interakcije. Napredne funkcionalnosti
            vključujejo filtriranje in sortiranje objav, napredno iskanje ter
            ostale možnosti. Aplikacija vključuje tudi posebne funkcionalnosti
            ter pravice za moderatorje in administratorje. Za razvoj je
            uporabljen MERN sklad.
          </Text>
        </Box>

        {/* Right Column */}
        <Box flex={1} display="flex" justifyContent="center">
          <Image
            src="images/default.png"
            alt="YourVoice logo"
            boxSize="100%"
            maxW="300px"
            borderRadius="lg"
          />
        </Box>
      </Stack>
    </Box>

    <Posts></Posts>
    </Box>
  );
};

export default Home;
