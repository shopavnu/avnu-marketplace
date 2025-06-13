import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

interface SimpleChakraTestProps {
  title: string;
}

const SimpleChakraTest: React.FC<SimpleChakraTestProps> = ({ title }) => {
  return (
    <Box padding={4}>
      <Text fontSize="lg">{title}</Text>
      <Button colorScheme="blue">Test Button</Button>
    </Box>
  );
};

export default SimpleChakraTest;
