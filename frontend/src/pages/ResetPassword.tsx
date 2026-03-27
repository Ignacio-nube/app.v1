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
  InputRightElement,
  IconButton,
  useColorMode,
  Flex,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { ViewIcon, ViewOffIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import api from '../config/api';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const passwordsMatch = nuevaContraseña === confirmarContraseña;
  const isValid = nuevaContraseña.length >= 6 && passwordsMatch && confirmarContraseña.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        nueva_contraseña: nuevaContraseña,
      });
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña fue restablecida correctamente.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/login', { replace: true });
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Token inválido o expirado.';
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

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
              Nueva contraseña
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
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Ingresá tu nueva contraseña. Debe tener al menos 6 caracteres.
                </Text>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.500">NUEVA CONTRASEÑA</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showNew ? 'text' : 'password'}
                      value={nuevaContraseña}
                      onChange={(e) => setNuevaContraseña(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                      border="none"
                      _focus={{
                        bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                        boxShadow: 'outline',
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showNew ? 'Ocultar' : 'Mostrar'}
                        icon={showNew ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowNew(!showNew)}
                        variant="ghost"
                        size="sm"
                        color="gray.400"
                        _hover={{ color: 'brand.500' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired isInvalid={confirmarContraseña.length > 0 && !passwordsMatch}>
                  <FormLabel fontSize="sm" fontWeight="bold" color="gray.500">CONFIRMAR CONTRASEÑA</FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmarContraseña}
                      onChange={(e) => setConfirmarContraseña(e.target.value)}
                      placeholder="Repetí la contraseña"
                      bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                      border="none"
                      _focus={{
                        bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                        boxShadow: 'outline',
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                        icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirm(!showConfirm)}
                        variant="ghost"
                        size="sm"
                        color="gray.400"
                        _hover={{ color: 'brand.500' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {confirmarContraseña.length > 0 && !passwordsMatch && (
                    <Text fontSize="xs" color="red.500" mt={1}>Las contraseñas no coinciden</Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Actualizando..."
                  isDisabled={!isValid}
                  borderRadius="xl"
                  h="60px"
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="0 4px 14px 0 rgba(255, 107, 0, 0.39)"
                >
                  ACTUALIZAR CONTRASEÑA
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
