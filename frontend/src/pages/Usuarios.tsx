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
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Usuario } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { UsuarioModal } from '../components/UsuarioModal';

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

  // Queries
  const { data: response, isLoading: loadingUsuarios } = useQuery<UsuariosResponse>({
    queryKey: ['usuarios', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await api.get(`/usuarios?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const usuarios = response?.data;
  const pagination = response?.pagination;

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/usuarios/${id}`);
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

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    onOpen();
  };

  const handleOpenEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    onOpen();
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
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="640px">
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
        </Box>
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

      <UsuarioModal
        isOpen={isOpen}
        onClose={onClose}
        usuarioToEdit={editingUsuario}
      />

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
