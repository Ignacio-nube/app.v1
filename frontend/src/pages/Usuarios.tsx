import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  InputGroup,
  InputRightElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Usuario, Perfil } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

interface UsuariosResponse {
  data: Usuario[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const Usuarios = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { page, setPage, limit, setLimit } = usePagination();

  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuarioId, setDeletingUsuarioId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contraseña_usu: '',
    id_perfil: '',
  });

  // Queries
  const { data: response, isLoading: loadingUsuarios } = useQuery<UsuariosResponse>({
    queryKey: ['usuarios', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await api.get(`/api/usuarios?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const usuarios = response?.data;
  const pagination = response?.pagination;

  const { data: perfiles } = useQuery<Perfil[]>({
    queryKey: ['perfiles'],
    queryFn: async () => {
      const response = await api.get('/api/usuarios/perfiles');
      return response.data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
      resetForm();
    },
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
    mutationFn: async (data: { id: number; updates: typeof formData }) => {
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
      resetForm();
    },
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/usuarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar usuario',
        description: error.response?.data?.mensaje || 'Ocurrió un error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre_usuario: '',
      contraseña_usu: '',
      id_perfil: '',
    });
    setEditingUsuario(null);
    setShowPassword(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre_usuario: usuario.nombre_usuario,
      contraseña_usu: '',
      id_perfil: usuario.id_perfil.toString(),
    });
    onOpen();
  };

  const handleSubmit = () => {
    if (editingUsuario) {
      updateMutation.mutate({
        id: editingUsuario.id_usuario,
        updates: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingUsuarioId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
    if (deletingUsuarioId) {
      deleteMutation.mutate(deletingUsuarioId);
    }
  };

  if (loadingUsuarios && !usuarios) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Gestión de Usuarios</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={handleOpenCreate}>
          Nuevo Usuario
        </Button>
      </HStack>

      <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Usuario</Th>
              <Th>Rol</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {usuarios?.map((usuario) => (
              <Tr key={usuario.id_usuario}>
                <Td>{usuario.id_usuario}</Td>
                <Td fontWeight="medium">{usuario.nombre_usuario}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      usuario.rol === 'Administrador'
                        ? 'red'
                        : usuario.rol === 'Vendedor'
                        ? 'blue'
                        : 'green'
                    }
                  >
                    {usuario.rol}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar"
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => handleOpenEdit(usuario)}
                    />
                    <IconButton
                      aria-label="Eliminar"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteClick(usuario.id_usuario)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {pagination && (
          <Box p={4} borderTopWidth="1px">
            <Pagination
              page={page}
              limit={limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </Box>
        )}
      </Box>

      {/* Modal Crear/Editar */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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

              <FormControl isRequired={!editingUsuario}>
                <FormLabel>
                  Contraseña {editingUsuario && '(dejar vacío para no cambiar)'}
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
                (!editingUsuario && !formData.contraseña_usu)
              }
            >
              {editingUsuario ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Dialog Eliminar */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Usuario
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};
