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
  useColorModeValue,
  Spinner,
  Center,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  InputGroup,
  InputLeftElement,
  Input,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AddIcon, EditIcon, WarningIcon, SearchIcon } from '@chakra-ui/icons';
import api from '../config/api';
import type { Producto } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { ProductoModal } from '../components/ProductoModal';

interface ProductosResponse {
  data: Producto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const PRODUCT_CATEGORIES: Producto['categoria'][] = ['muebles', 'electrodomesticos', 'colchones'];

const sanitizeProducto = (producto: unknown): Producto => {
  if (!producto || typeof producto !== 'object') {
    return {
      id_productos: 0,
      nombre_productos: 'Error: Datos inválidos',
      descripcion: '',
      categoria: 'muebles',
      stock: 0,
      precio_contado: 0,
      precio_credito: 0,
      estado_productos: 'Inactivo',
      id_proveedor: undefined,
    };
  }

  const item = producto as Partial<Record<keyof Producto, unknown>>;
  
  // Normalize category to handle case sensitivity and accents
  let categoriaValue: Producto['categoria'] = 'muebles';
  
  if (typeof item.categoria === 'string') {
    const normalizedCat = item.categoria.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
      
    if (PRODUCT_CATEGORIES.includes(normalizedCat as Producto['categoria'])) {
      categoriaValue = normalizedCat as Producto['categoria'];
    } else if (normalizedCat === 'electrodomestico') { // Handle singular/plural mismatch if any
      categoriaValue = 'electrodomesticos';
    } else if (normalizedCat === 'colchon') {
      categoriaValue = 'colchones';
    } else if (normalizedCat === 'mueble') {
      categoriaValue = 'muebles';
    }
  }

  return {
    id_productos: Number(item.id_productos ?? 0),
    nombre_productos:
      typeof item.nombre_productos === 'string' && item.nombre_productos.trim().length > 0
        ? item.nombre_productos
        : 'Producto sin nombre',
    descripcion: typeof item.descripcion === 'string' ? item.descripcion : '',
    categoria: categoriaValue,
    stock: Number(item.stock ?? 0),
    precio_contado: Number(item.precio_contado ?? 0),
    precio_credito: Number(item.precio_credito ?? 0),
    estado_productos: item.estado_productos === 'Inactivo' ? 'Inactivo' : 'Activo',
    id_proveedor:
      item.id_proveedor !== undefined && item.id_proveedor !== null && item.id_proveedor !== ''
        ? Number(item.id_proveedor)
        : undefined,
  };
};

export const Productos = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { page, setPage, limit, setLimit } = usePagination();

  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [tabIndex, setTabIndex] = useState(0);

  const { data: response, isLoading, isError } = useQuery<ProductosResponse>({
    queryKey: ['productos', page, limit, categoriaFiltro, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        busqueda: debouncedSearchTerm,
      });
      
      if (categoriaFiltro !== 'todos' && categoriaFiltro !== 'stock-bajo') {
        params.append('categoria', categoriaFiltro);
      }

      const res = await api.get(`/productos?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const { data: productosStockBajo, isLoading: isLoadingStockBajo } = useQuery<Producto[]>({
    queryKey: ['productos-stock-bajo'],
    queryFn: async () => {
      const response = await api.get('/productos/stock-bajo');
      return response.data;
    },
    enabled: categoriaFiltro === 'stock-bajo',
  });

  const rawProductosData = (response as { data?: unknown })?.data;
  const productosDataIsArray = Array.isArray(rawProductosData);
  const productosDataError = Boolean(response) && !productosDataIsArray;
  
  let productos: Producto[] = [];
  try {
    productos = productosDataIsArray ? rawProductosData.map(sanitizeProducto) : [];
  } catch (e) {
    console.error('Error sanitizing productos:', e);
    productos = [];
  }

  const pagination = response?.pagination;

  const rawStockBajoData = productosStockBajo as unknown;
  const productosStockBajoIsArray = Array.isArray(rawStockBajoData);
  const productosStockBajoError = productosStockBajo !== undefined && !productosStockBajoIsArray;
  
  let productosStockBajoList: Producto[] = [];
  try {
    productosStockBajoList = productosStockBajoIsArray ? rawStockBajoData.map(sanitizeProducto) : [];
  } catch (e) {
    console.error('Error sanitizing stock bajo:', e);
    productosStockBajoList = [];
  }

  console.log('Productos render:', { isLoading, isError, productos, productosStockBajo: productosStockBajoList });

  const handleOpenCreate = () => {
    setEditingProducto(null);
    onOpen();
  };

  const handleOpenEdit = (producto: Producto) => {
    setEditingProducto(producto);
    onOpen();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  return (
    <ErrorBoundary>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Gestión de Productos</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={handleOpenCreate}>
            Nuevo Producto
          </Button>
        </HStack>

        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </InputGroup>

        <Tabs 
          colorScheme="brand" 
          index={tabIndex}
          onChange={(index) => {
            setTabIndex(index);
            const categorias = ['todos', 'muebles', 'electrodomesticos', 'colchones', 'stock-bajo'];
            setCategoriaFiltro(categorias[index]);
            setPage(1);
          }}
          isLazy
        >
          <TabList>
            <Tab>Todos</Tab>
            <Tab>Muebles</Tab>
            <Tab>Electrodomésticos</Tab>
            <Tab>Colchones</Tab>
            <Tab>
              <HStack>
                <Text>Stock Bajo</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {isLoading && productos.length === 0 ? (
                <Center py={10} w="full">
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text ml={4} color="gray.500">Cargando productos...</Text>
                </Center>
              ) : isError || productosDataError ? (
                <Center py={10} w="full">
                  <Text color="red.500">Error al cargar los productos. Por favor, intente nuevamente.</Text>
                </Center>
              ) : (
                <>
                  <ProductosTable
                    productos={productos}
                    onEdit={handleOpenEdit}
                    formatCurrency={formatCurrency}
                    bgColor={bgColor}
                  />
                  {pagination && productos.length > 0 && (
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
                  )}
                </>
              )}
            </TabPanel>
            <TabPanel px={0}>
              {/* Muebles - Reusing same logic as 'Todos' but filtered by backend */}
              {isLoading && productos.length === 0 ? (
                <Center py={10} w="full">
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text ml={4} color="gray.500">Cargando muebles...</Text>
                </Center>
              ) : (
                <>
                  <ProductosTable
                    productos={productos}
                    onEdit={handleOpenEdit}
                    formatCurrency={formatCurrency}
                    bgColor={bgColor}
                  />
                  {pagination && productos.length > 0 && (
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
                  )}
                </>
              )}
            </TabPanel>
            <TabPanel px={0}>
              {/* Electrodomesticos */}
              {isLoading && productos.length === 0 ? (
                <Center py={10} w="full">
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text ml={4} color="gray.500">Cargando electrodomésticos...</Text>
                </Center>
              ) : (
                <>
                  <ProductosTable
                    productos={productos}
                    onEdit={handleOpenEdit}
                    formatCurrency={formatCurrency}
                    bgColor={bgColor}
                  />
                  {pagination && productos.length > 0 && (
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
                  )}
                </>
              )}
            </TabPanel>
            <TabPanel px={0}>
              {/* Colchones */}
              {isLoading && productos.length === 0 ? (
                <Center py={10} w="full">
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text ml={4} color="gray.500">Cargando colchones...</Text>
                </Center>
              ) : (
                <>
                  <ProductosTable
                    productos={productos}
                    onEdit={handleOpenEdit}
                    formatCurrency={formatCurrency}
                    bgColor={bgColor}
                  />
                  {pagination && productos.length > 0 && (
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
                  )}
                </>
              )}
            </TabPanel>
            <TabPanel px={0}>
              {/* Stock Bajo */}
              {isLoadingStockBajo && productosStockBajoList.length === 0 ? (
                <Center py={10} w="full">
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text ml={4} color="gray.500">Cargando stock bajo...</Text>
                </Center>
              ) : productosStockBajoError ? (
                <Center py={10} w="full">
                  <Text color="red.500">Error al cargar el listado de stock bajo.</Text>
                </Center>
              ) : (
                <ProductosTable
                  productos={productosStockBajoList}
                  onEdit={handleOpenEdit}
                  formatCurrency={formatCurrency}
                  bgColor={bgColor}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        <ProductoModal
          isOpen={isOpen}
          onClose={onClose}
          productoToEdit={editingProducto}
        />
      </VStack>
    </ErrorBoundary>
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
    <Box overflowX="auto">
      <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="820px">
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
        {productos.length === 0 ? (
          <Tr>
            <Td colSpan={6} textAlign="center" py={8}>
              <Text color="gray.500">No se encontraron productos.</Text>
            </Td>
          </Tr>
        ) : (
          productos.map((producto) => {
            if (!producto) return null;
            return (
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
                  {Number(producto.stock) < 10 && <WarningIcon color="red.500" />}
                  <Text fontWeight={Number(producto.stock) < 10 ? 'bold' : 'normal'} color={Number(producto.stock) < 10 ? 'red.500' : 'inherit'}>
                    {producto.stock}
                  </Text>
                </HStack>
              </Td>
              <Td isNumeric fontWeight="medium">{formatCurrency(Number(producto.precio_contado))}</Td>
              <Td isNumeric fontWeight="medium">{formatCurrency(Number(producto.precio_credito))}</Td>
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
            );
          })
        )}
      </Tbody>
      </Table>
    </Box>
  </Box>
);
