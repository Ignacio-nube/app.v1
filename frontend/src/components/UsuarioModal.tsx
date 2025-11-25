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
  useToast,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Usuario, Perfil } from '../types';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit: Usuario | null;
}

interface UsuarioFormData {
  nombre_usuario: string;
  contraseña_usu: string;
  id_perfil: string;
}

export const UsuarioModal = ({ isOpen, onClose, usuarioToEdit }: UsuarioModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombre_usuario: '',
    contraseña_usu: '',
    id_perfil: '',
  });

  const { data: perfiles } = useQuery<Perfil[]>({
    queryKey: ['perfiles'],
    queryFn: async () => {
      const response = await api.get('/api/usuarios/perfiles');
      return response.data;
    },
  });

  useEffect(() => {
    if (usuarioToEdit) {
      setFormData({
        nombre_usuario: usuarioToEdit.nombre_usuario,
        contraseña_usu: '',
        id_perfil: usuarioToEdit.id_perfil.toString(),
      });
    } else {
      setFormData({
        nombre_usuario: '',
        contraseña_usu: '',
        id_perfil: '',
      });
    }
    setShowPassword(false);
  }, [usuarioToEdit, isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: UsuarioFormData) => {
      const response = await api.post('/api/usuarios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario creado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: 'Error al crear usuario',
        description: error.response?.data?.mensaje || 'Ocurrió un error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: UsuarioFormData }) => {
      const response = await api.put(`/api/usuarios/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario actualizado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar usuario',
        description: error.response?.data?.mensaje || 'Ocurrió un error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = () => {
    if (usuarioToEdit) {
      updateMutation.mutate({
        id: usuarioToEdit.id_usuario,
        updates: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre de Usuario</FormLabel>
              <Input
                value={formData.nombre_usuario}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_usuario: e.target.value })
                }
                placeholder="Ingrese el nombre de usuario"
              />
            </FormControl>

            <FormControl isRequired={!usuarioToEdit}>
              <FormLabel>
                Contraseña {usuarioToEdit && '(dejar vacío para no cambiar)'}
              </FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.contraseña_usu}
                  onChange={(e) =>
                    setFormData({ ...formData, contraseña_usu: e.target.value })
                  }
                  placeholder="Ingrese la contraseña"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Rol</FormLabel>
              <Select
                value={formData.id_perfil}
                onChange={(e) =>
                  setFormData({ ...formData, id_perfil: e.target.value })
                }
                placeholder="Seleccione un rol"
              >
                {perfiles?.map((perfil) => (
                  <option key={perfil.id_perfil} value={perfil.id_perfil}>
                    {perfil.rol}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isDisabled={
              !formData.nombre_usuario ||
              !formData.id_perfil ||
              (!usuarioToEdit && !formData.contraseña_usu)
            }
          >
            {usuarioToEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
