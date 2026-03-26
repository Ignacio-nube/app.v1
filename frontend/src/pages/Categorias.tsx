import {
  Box,
  Button,
  HStack,
  VStack,
  Stack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  useColorModeValue,
  Skeleton,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../config/api';
import type { Categoria } from '../types';

const COLOR_OPCIONES = ['blue', 'purple', 'orange', 'teal', 'green', 'red', 'gray', 'cyan', 'pink', 'yellow'];

export const Categorias = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ nombre: '', color: 'gray' });

  const [deletingCategoria, setDeletingCategoria] = useState<Categoria | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { data: categorias = [], isLoading } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const openCreate = () => {
    setEditingCategoria(null);
    setFormData({ nombre: '', color: 'gray' });
    setIsModalOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditingCategoria(cat);
    setFormData({ nombre: cat.nombre, color: cat.color });
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<unknown, any, void>({
    mutationFn: async () => {
      if (editingCategoria) {
        return api.put(`/categorias/${editingCategoria.id_categoria}`, formData);
      }
      return api.post('/categorias', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({
        title: editingCategoria ? 'Categoría actualizada' : 'Categoría creada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsModalOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Error al guardar';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleteMutation = useMutation<unknown, any, Categoria>({
    mutationFn: async (cat: Categoria) => api.delete(`/categorias/${cat.id_categoria}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({ title: 'Categoría eliminada', status: 'success', duration: 3000, isClosable: true });
      setDeletingCategoria(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const data = error.response?.data;
      const msg = data?.cantidad
        ? `No se puede eliminar: hay ${data.cantidad} producto(s) en esta categoría`
        : data?.error || 'Error al eliminar';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
      setDeletingCategoria(null);
    },
  });

  return (
    <VStack spacing={6} align="stretch">
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        spacing={4}
      >
        <Heading size="lg">Gestión de Categorías</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={openCreate}
          w={{ base: 'full', sm: 'auto' }}
        >
          Nueva Categoría
        </Button>
      </Stack>

      <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
            <Thead>
              <Tr>
                <Th>Color</Th>
                <Th>Nombre</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Tr key={i}>
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Td key={j}><Skeleton h="4" borderRadius="md" /></Td>
                      ))}
                    </Tr>
                  ))
                : categorias.map((cat) => (
                    <Tr key={cat.id_categoria}>
                      <Td>
                        <Badge colorScheme={cat.color}>{cat.color}</Badge>
                      </Td>
                      <Td fontWeight="medium">{cat.nombre}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => openEdit(cat)}
                          />
                          <IconButton
                            aria-label="Eliminar"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => setDeletingCategoria(cat)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
              }
              {!isLoading && categorias.length === 0 && (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={4}>
                    <Text color="gray.500">No hay categorías</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Modal crear/editar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Dormitorio"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>
                  Color — <Badge colorScheme={formData.color}>{formData.color}</Badge>
                </FormLabel>
                <SimpleGrid columns={5} spacing={2}>
                  {COLOR_OPCIONES.map((color) => (
                    <Badge
                      key={color}
                      colorScheme={color}
                      px={2}
                      py={1}
                      cursor="pointer"
                      borderRadius="md"
                      textAlign="center"
                      outline={formData.color === color ? '2px solid' : 'none'}
                      outlineOffset="2px"
                      onClick={() => setFormData({ ...formData, color })}
                    >
                      {color}
                    </Badge>
                  ))}
                </SimpleGrid>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              colorScheme="brand"
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
              isDisabled={!formData.nombre.trim()}
            >
              {editingCategoria ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog eliminar */}
      <AlertDialog
        isOpen={!!deletingCategoria}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingCategoria(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Eliminar Categoría</AlertDialogHeader>
            <AlertDialogBody>
              ¿Eliminar la categoría <strong>{deletingCategoria?.nombre}</strong>? Esta acción no
              se puede deshacer. Si hay productos en esta categoría, no se podrá eliminar.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingCategoria(null)}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => deletingCategoria && deleteMutation.mutate(deletingCategoria)}
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
