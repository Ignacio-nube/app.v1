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
  Textarea,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddIcon, EditIcon, WarningIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Producto, ProductoFormData } from '../types';

export const Productos = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre_productos: '',
    descripcion: '',
    categoria: 'muebles',
    stock: 0,
    precio_contado: 0,
    precio_credito: 0,
  });

  const { data: productos, isLoading } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const response = await api.get('/api/productos');
      return response.data;
    },
  });

  const { data: productosStockBajo } = useQuery<Producto[]>({
    queryKey: ['productos-stock-bajo'],
    queryFn: async () => {
      const response = await api.get('/api/productos/stock-bajo');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductoFormData) => {
      const response = await api.post('/api/productos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({ title: 'Producto creado', status: 'success', duration: 3000, isClosable: true });
      onClose();
      resetForm();
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
      const response = await api.put(`/api/productos/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({ title: 'Producto actualizado', status: 'success', duration: 3000, isClosable: true });
      onClose();
      resetForm();
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

  const resetForm = () => {
    setFormData({
      nombre_productos: '',
      descripcion: '',
      categoria: 'muebles',
      stock: 0,
      precio_contado: 0,
      precio_credito: 0,
    });
    setEditingProducto(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre_productos: producto.nombre_productos,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria,
      stock: producto.stock,
      precio_contado: producto.precio_contado,
      precio_credito: producto.precio_credito,
    });
    onOpen();
  };

  const handleSubmit = () => {
    if (editingProducto) {
      updateMutation.mutate({ id: editingProducto.id_productos, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredProductos =
    categoriaFiltro === 'todos'
      ? productos
      : productos?.filter((p) => p.categoria === categoriaFiltro);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Gestión de Productos</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={handleOpenCreate}>
          Nuevo Producto
        </Button>
      </HStack>

      <Tabs colorScheme="brand" onChange={(index) => {
        const categorias = ['todos', 'muebles', 'electrodomesticos', 'colchones', 'stock-bajo'];
        setCategoriaFiltro(categorias[index]);
      }}>
        <TabList>
          <Tab>Todos</Tab>
          <Tab>Muebles</Tab>
          <Tab>Electrodomésticos</Tab>
          <Tab>Colchones</Tab>
          <Tab>
            <HStack>
              <Text>Stock Bajo</Text>
              {productosStockBajo && productosStockBajo.length > 0 && (
                <Badge colorScheme="red">{productosStockBajo.length}</Badge>
              )}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {['todos', 'muebles', 'electrodomesticos', 'colchones'].map((cat) => (
            <TabPanel key={cat} px={0}>
              <ProductosTable
                productos={filteredProductos || []}
                onEdit={handleOpenEdit}
                formatCurrency={formatCurrency}
                bgColor={bgColor}
              />
            </TabPanel>
          ))}
          <TabPanel px={0}>
            <ProductosTable
              productos={productosStockBajo || []}
              onEdit={handleOpenEdit}
              formatCurrency={formatCurrency}
              bgColor={bgColor}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre del Producto</FormLabel>
                <Input
                  value={formData.nombre_productos}
                  onChange={(e) => setFormData({ ...formData, nombre_productos: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                />
              </FormControl>

              <HStack w="full" spacing={4}>
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

                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.stock}
                    onChange={(_, value) => setFormData({ ...formData, stock: value })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack w="full" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Precio Contado</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.precio_contado}
                    onChange={(_, value) => setFormData({ ...formData, precio_contado: value })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Precio Crédito</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.precio_credito}
                    onChange={(_, value) => setFormData({ ...formData, precio_credito: value })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>
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
              {editingProducto ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

interface ProductosTableProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  formatCurrency: (value: number) => string;
  bgColor: string;
}

const ProductosTable = ({ productos, onEdit, formatCurrency, bgColor }: ProductosTableProps) => (
  <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Producto</Th>
          <Th>Categoría</Th>
          <Th isNumeric>Stock</Th>
          <Th isNumeric>Precio Contado</Th>
          <Th isNumeric>Precio Crédito</Th>
          <Th>Acciones</Th>
        </Tr>
      </Thead>
      <Tbody>
        {productos.map((producto) => (
          <Tr key={producto.id_productos}>
            <Td>
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">{producto.nombre_productos}</Text>
                {producto.descripcion && (
                  <Text fontSize="sm" color="gray.500" noOfLines={1}>
                    {producto.descripcion}
                  </Text>
                )}
              </VStack>
            </Td>
            <Td>
              <Badge
                colorScheme={
                  producto.categoria === 'muebles'
                    ? 'blue'
                    : producto.categoria === 'electrodomesticos'
                    ? 'purple'
                    : 'green'
                }
              >
                {producto.categoria}
              </Badge>
            </Td>
            <Td isNumeric>
              <HStack justify="flex-end">
                {producto.stock < 10 && <WarningIcon color="red.500" />}
                <Text fontWeight={producto.stock < 10 ? 'bold' : 'normal'} color={producto.stock < 10 ? 'red.500' : 'inherit'}>
                  {producto.stock}
                </Text>
              </HStack>
            </Td>
            <Td isNumeric fontWeight="medium">{formatCurrency(producto.precio_contado)}</Td>
            <Td isNumeric fontWeight="medium">{formatCurrency(producto.precio_credito)}</Td>
            <Td>
              <IconButton
                aria-label="Editar"
                icon={<EditIcon />}
                size="sm"
                colorScheme="blue"
                variant="ghost"
                onClick={() => onEdit(producto)}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);
