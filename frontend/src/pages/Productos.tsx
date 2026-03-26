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
import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AddIcon, EditIcon, WarningIcon, SearchIcon } from '@chakra-ui/icons';
import api from '../config/api';
import type { Producto, Categoria } from '../types';
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

const sanitizeProducto = (producto: unknown): Producto => {
  if (!producto || typeof producto !== 'object') {
    return {
      id_productos: 0,
      nombre_productos: 'Error: Datos inválidos',
      descripcion: '',
      categoria: '',
      stock: 0,
      precio_contado: 0,
      estado_productos: 'Inactivo',
      id_proveedor: undefined,
    };
  }

  const item = producto as Partial<Record<keyof Producto, unknown>>;

  return {
    id_productos: Number(item.id_productos ?? 0),
    nombre_productos:
      typeof item.nombre_productos === 'string' && item.nombre_productos.trim().length > 0
        ? item.nombre_productos
        : 'Producto sin nombre',
    descripcion: typeof item.descripcion === 'string' ? item.descripcion : '',
    categoria: typeof item.categoria === 'string' ? item.categoria : '',
    stock: Number(item.stock ?? 0),
    precio_contado: Number(item.precio_contado ?? 0),
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

  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias');
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Reset tabIndex if categorias change and current index is out of range
  useEffect(() => {
    const totalTabs = 1 + categorias.length + 1;
    if (categorias.length > 0 && tabIndex >= totalTabs) {
      setTabIndex(0);
      setCategoriaFiltro('todos');
    }
  }, [categorias, tabIndex]);

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

  let productosStockBajoList: Producto[] = [];
  try {
    productosStockBajoList = productosStockBajoIsArray ? rawStockBajoData.map(sanitizeProducto) : [];
  } catch (e) {
    console.error('Error sanitizing stock bajo:', e);
    productosStockBajoList = [];
  }

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

  const tabCategorias = ['todos', ...categorias.map(c => c.nombre), 'stock-bajo'];

  const renderProductosPanel = (loading: boolean, error: boolean, label?: string) => (
    loading && productos.length === 0 ? (
      <Center py={10} w="full">
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text ml={4} color="gray.500">Cargando {label ?? 'productos'}...</Text>
      </Center>
    ) : error ? (
      <Center py={10} w="full">
        <Text color="red.500">Error al cargar los productos. Por favor, intente nuevamente.</Text>
      </Center>
    ) : (
      <>
        <ProductosTable
          productos={productos}
          categorias={categorias}
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
    )
  );

  return (
    <ErrorBoundary>
      <VStack spacing={6} align="stretch">
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          spacing={4}
        >
          <Heading size="lg">Gestión de Productos</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="brand"
            onClick={handleOpenCreate}
            w={{ base: 'full', sm: 'auto' }}
          >
            Nuevo Producto
          </Button>
        </Stack>

        <InputGroup maxW={{ base: 'full', md: '400px' }}>
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
            setCategoriaFiltro(tabCategorias[index] ?? 'todos');
            setPage(1);
          }}
          isLazy
        >
          <TabList overflowX="auto" overflowY="hidden" sx={{
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': { display: 'none' },
            WebkitOverflowScrolling: 'touch',
            whiteSpace: 'nowrap',
          }}>
            <Tab>Todos</Tab>
            {categorias.map(cat => <Tab key={cat.id_categoria}>{cat.nombre}</Tab>)}
            <Tab>Stock Bajo</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {renderProductosPanel(isLoading, isError || productosDataError)}
            </TabPanel>

            {categorias.map(cat => (
              <TabPanel key={cat.id_categoria} px={0}>
                {renderProductosPanel(isLoading, false, cat.nombre.toLowerCase())}
              </TabPanel>
            ))}

            <TabPanel px={0}>
              {isLoadingStockBajo && productosStockBajoList.length === 0 ? (
                <Center py={10} w="full">
                  <Spinner size="xl" color="brand.500" thickness="4px" />
                  <Text ml={4} color="gray.500">Cargando stock bajo...</Text>
                </Center>
              ) : (
                <ProductosTable
                  productos={productosStockBajoList}
                  categorias={categorias}
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
  categorias: Categoria[];
  onEdit: (producto: Producto) => void;
  formatCurrency: (value: number) => string;
  bgColor: string;
}

const ProductosTable = ({ productos, categorias, onEdit, formatCurrency, bgColor }: ProductosTableProps) => (
  <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
    <Box overflowX="auto">
      <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="820px">
      <Thead>
        <Tr>
          <Th>Producto</Th>
          <Th>Categoría</Th>
          <Th isNumeric>Stock</Th>
          <Th isNumeric>Precio Contado</Th>
          <Th>Acciones</Th>
        </Tr>
      </Thead>
      <Tbody>
        {productos.length === 0 ? (
          <Tr>
            <Td colSpan={5} textAlign="center" py={8}>
              <Text color="gray.500">No se encontraron productos.</Text>
            </Td>
          </Tr>
        ) : (
          productos.map((producto) => {
            if (!producto) return null;
            const catColor = categorias.find(c => c.nombre === producto.categoria)?.color ?? 'gray';
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
                <Badge colorScheme={catColor}>
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
