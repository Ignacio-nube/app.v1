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
  IconButton,
  Image,
  useColorMode,
  Flex,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ViewIcon, ViewOffIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Navigate } from 'react-router-dom';

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
    <Flex minH="100vh" align="center" justify="center" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <Box position="absolute" top={4} right={4}>
        <IconButton
          aria-label="Cambiar tema"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
        />
      </Box>

      <Container maxW="md" py={12}>
        <VStack spacing={8} align="stretch">
          <VStack spacing={4}>
            <Box
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              p={4}
              borderRadius="full"
              boxShadow="lg"
            >
              <Image
                src="/logo.svg"
                alt="CETROHOGAR"
                boxSize="80px"
                fallback={
                  <Box
                    w="80px"
                    h="80px"
                    bg="brand.500"
                    borderRadius="full"
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
              bgGradient="linear(to-r, brand.500, primary.500)"
              bgClip="text"
            >
              CETROHOGAR
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Sistema de Gestión de Ventas
            </Text>
          </VStack>

          <Box
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Usuario</FormLabel>
                  <Input
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={mostrarContraseña ? 'text' : 'password'}
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={mostrarContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        icon={mostrarContraseña ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setMostrarContraseña(!mostrarContraseña)}
                        variant="ghost"
                        size="sm"
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
                  loadingText="Iniciando sesión..."
                >
                  Iniciar Sesión
                </Button>
              </VStack>
            </form>
          </Box>

          <Text textAlign="center" fontSize="sm" color="gray.500">
            © {new Date().getFullYear()} CETROHOGAR. Todos los derechos reservados.
          </Text>
        </VStack>
      </Container>
    </Flex>
  );
};
