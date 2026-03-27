import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  IconButton,
  useColorMode,
  Flex,
  Icon,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import api from '../config/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo procesar la solicitud. Intentá nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        w="400px"
        h="400px"
        bg="brand.500"
        opacity="0.1"
        borderRadius="full"
        filter="blur(80px)"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        w="400px"
        h="400px"
        bg="primary.500"
        opacity="0.1"
        borderRadius="full"
        filter="blur(80px)"
      />

      <Box position="absolute" top={4} right={4}>
        <IconButton
          aria-label="Cambiar tema"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          borderRadius="full"
        />
      </Box>

      <Container maxW="md" py={12} position="relative">
        <VStack spacing={8} align="stretch">
          <VStack spacing={2}>
            <Heading size="xl" fontWeight="800" letterSpacing="tight" textAlign="center">
              <Text as="span" color="brand.500">CETRO</Text>
              <Text as="span" color={colorMode === 'dark' ? 'white' : 'primary.500'}>HOGAR</Text>
            </Heading>
            <Text color="gray.500" fontSize="md" fontWeight="medium">
              Recuperación de contraseña
            </Text>
          </VStack>

          <Box
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            p={10}
            borderRadius="3xl"
            boxShadow="2xl"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100'}
          >
            {sent ? (
              <VStack spacing={5}>
                <Alert status="success" borderRadius="xl">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Si el email está registrado, recibirás un correo con el enlace para restablecer tu contraseña. Revisá también la carpeta de spam.
                  </Text>
                </Alert>
                <RouterLink to="/login">
                  <Button
                    leftIcon={<Icon as={FiArrowLeft} />}
                    variant="ghost"
                    colorScheme="brand"
                    w="full"
                  >
                    Volver al inicio de sesión
                  </Button>
                </RouterLink>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Ingresá el email asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
                  </Text>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.500">EMAIL</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiMail} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tucuenta@email.com"
                        bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                        border="none"
                        _focus={{
                          bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                          boxShadow: 'outline',
                        }}
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Enviando..."
                    borderRadius="xl"
                    h="60px"
                    fontSize="md"
                    fontWeight="bold"
                    boxShadow="0 4px 14px 0 rgba(255, 107, 0, 0.39)"
                  >
                    ENVIAR ENLACE
                  </Button>

                  <RouterLink to="/login">
                    <Button
                      leftIcon={<Icon as={FiArrowLeft} />}
                      variant="ghost"
                      colorScheme="brand"
                      size="sm"
                      w="full"
                    >
                      Volver al inicio de sesión
                    </Button>
                  </RouterLink>
                </VStack>
              </form>
            )}
          </Box>

          <VStack spacing={4}>
            <Divider />
            <Text textAlign="center" fontSize="xs" color="gray.500" fontWeight="medium" letterSpacing="widest">
              © {new Date().getFullYear()} CETROHOGAR • SOFTWARE DE GESTIÓN
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Flex>
  );
};
