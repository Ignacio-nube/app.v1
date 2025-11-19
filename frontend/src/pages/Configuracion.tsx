import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export const Configuracion = () => {
  const { usuario } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Error',
        description: 'Las contraseñas nuevas no coinciden',
        status: 'error',
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        status: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Nota: En un sistema real, deberíamos verificar la contraseña actual en el backend
      // Aquí asumimos que el endpoint de actualización maneja el cambio directo
      await api.put(`/api/usuarios/${usuario?.id_usuario}`, {
        contraseña_usu: passwords.new
      });

      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
        status: 'success',
      });
      
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error al actualizar contraseña',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md">
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Configuración de Cuenta</Heading>

        <Box bg={bgColor} p={8} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={6}>Cambiar Contraseña</Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Usuario</FormLabel>
                <Input value={usuario?.nombre_usuario} isReadOnly bg="gray.100" _dark={{ bg: 'gray.700' }} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={isLoading}
                mt={4}
              >
                Actualizar Contraseña
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};
