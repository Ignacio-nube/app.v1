import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Textarea,
  VStack,
  Heading,
  Divider,
  GridItem,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { Producto, ProductoFormData, Proveedor } from '../types';

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoToEdit: Producto | null;
}

export const ProductoModal = ({ isOpen, onClose, productoToEdit }: ProductoModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre_productos: '',
    descripcion: '',
    categoria: 'muebles',
    stock: 0,
    precio_contado: 0,
    precio_credito: 0,
    id_proveedor: undefined,
  });

  // Reset form when modal opens or productToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (productoToEdit) {
        setFormData({
          nombre_productos: productoToEdit.nombre_productos,
          descripcion: productoToEdit.descripcion || '',
          categoria: productoToEdit.categoria,
          stock: productoToEdit.stock,
          precio_contado: productoToEdit.precio_contado,
          precio_credito: productoToEdit.precio_credito,
          id_proveedor: productoToEdit.id_proveedor,
        });
      } else {
        setFormData({
          nombre_productos: '',
          descripcion: '',
          categoria: 'muebles',
          stock: 0,
          precio_contado: 0,
          precio_credito: 0,
          id_proveedor: undefined,
        });
      }
    }
  }, [isOpen, productoToEdit]);

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores-modal'],
    queryFn: async () => {
      const res = await api.get('/proveedores?limit=1000');
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
    enabled: isOpen, // Only fetch when modal is open
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductoFormData) => {
      const response = await api.post('/productos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-stock-bajo'] });
      toast({ title: 'Producto creado', status: 'success', duration: 3000, isClosable: true });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: ProductoFormData }) => {
      const response = await api.put(`/productos/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['productos-stock-bajo'] });
      toast({ title: 'Producto actualizado', status: 'success', duration: 3000, isClosable: true });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = () => {
    if (productoToEdit) {
      updateMutation.mutate({ id: productoToEdit.id_productos, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{productoToEdit ? 'Editar Producto' : 'Nuevo Producto'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {/* General Info Section */}
            <Box w="full">
              <Heading size="sm" mb={4} color="gray.600">Información General</Heading>
              <SimpleGrid columns={2} spacing={4}>
                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <Input
                      value={formData.nombre_productos}
                      onChange={(e) => setFormData({ ...formData, nombre_productos: e.target.value })}
                    />
                  </FormControl>
                </GridItem>
                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Descripción</FormLabel>
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                    />
                  </FormControl>
                </GridItem>
                <FormControl isRequired>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                  >
                    <option value="muebles">Muebles</option>
                    <option value="electrodomesticos">Electrodomésticos</option>
                    <option value="colchones">Colchones</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Proveedor</FormLabel>
                  <Select
                    placeholder="Seleccionar proveedor"
                    value={formData.id_proveedor ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        id_proveedor: value ? Number(value) : undefined,
                      });
                    }}
                  >
                    {proveedores?.map((prov: Proveedor) => (
                      <option key={prov.id_proveedor} value={prov.id_proveedor}>
                        {prov.nombre_prov}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Inventory & Pricing Section */}
            <Box w="full">
              <Heading size="sm" mb={4} color="gray.600">Inventario y Precios</Heading>
              <SimpleGrid columns={3} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.stock}
                    onChange={(_, value) => setFormData({ ...formData, stock: Number(value) })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Precio Contado</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.precio_contado}
                    onChange={(_, value) => setFormData({ ...formData, precio_contado: Number(value) })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Precio Crédito</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.precio_credito}
                    onChange={(_, value) => setFormData({ ...formData, precio_credito: Number(value) })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </Box>
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
          >
            {productoToEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
