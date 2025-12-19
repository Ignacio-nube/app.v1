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
  InputRightElement,
  InputLeftElement,
  IconButton,
  Image,
  useColorMode,
  Flex,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ViewIcon, ViewOffIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FiUser, FiLock } from 'react-icons/fi';
import { Navigate } from 'react-router-dom';
import logo from '../assets/logo-recorte.svg';

export const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, usuario } = useAuth();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  if (usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({
        nombre_usuario: nombreUsuario,
        contraseña_usu: contraseña,
      });

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido al sistema',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al iniciar sesión',
        description: error instanceof Error ? error.message : 'Credenciales inválidas',
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
      {/* Background Decorative Elements */}
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
            <Box
              p={4}
              bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'white'}
              borderRadius="2xl"
              boxShadow="xl"
              mb={4}
            >
              <Image
                src={logo}
                alt="CETROHOGAR"
                boxSize="80px"
                fallback={
                  <Box
                    w="80px"
                    h="80px"
                    bg="brand.500"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    CH
                  </Box>
                }
              />
            </Box>
            <Heading
              size="xl"
              fontWeight="800"
              letterSpacing="tight"
              textAlign="center"
            >
              <Text as="span" color="brand.500">CETRO</Text>
              <Text as="span" color={colorMode === 'dark' ? 'white' : 'primary.500'}>HOGAR</Text>
            </Heading>
            <Text color="gray.500" fontSize="md" fontWeight="medium">
              Sistema de Gestión Integral
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
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.500">USUARIO</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiUser} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      value={nombreUsuario}
                      onChange={(e) => setNombreUsuario(e.target.value)}
                      placeholder="Tu nombre de usuario"
                      bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                      border="none"
                      _focus={{
                        bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                        boxShadow: 'outline',
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.500">CONTRASEÑA</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={mostrarContraseña ? 'text' : 'password'}
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      placeholder="••••••••"
                      bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                      border="none"
                      _focus={{
                        bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                        boxShadow: 'outline',
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={mostrarContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        icon={mostrarContraseña ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setMostrarContraseña(!mostrarContraseña)}
                        variant="ghost"
                        size="sm"
                        color="gray.400"
                        _hover={{ color: 'brand.500' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Iniciando..."
                  borderRadius="xl"
                  h="60px"
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="0 4px 14px 0 rgba(255, 107, 0, 0.39)"
                  _hover={{
                    boxShadow: '0 6px 20px rgba(255, 107, 0, 0.23)',
                  }}
                >
                  INGRESAR AL PANEL
                </Button>
              </VStack>
            </form>
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
