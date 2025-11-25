import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Heading,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Divider,
  Badge,
  InputGroup,
  InputLeftElement,
  Grid,
  GridItem,
  Card,
  CardBody,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteIcon, SearchIcon, AddIcon, CheckCircleIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Cliente, Producto, VentaCrear } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface NuevaVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
}

const steps = [
  { title: 'Cliente', description: 'Seleccionar cliente' },
  { title: 'Productos', description: 'Agregar items' },
  { title: 'Confirmar', description: 'Revisar y finalizar' },
];

export const NuevaVentaModal = ({ isOpen, onClose }: NuevaVentaModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Color Mode Values
  const bgColor = useColorModeValue('white', 'gray.800');
  const secondaryBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const selectedBg = useColorModeValue('brand.50', 'rgba(66, 153, 225, 0.16)'); // brand.50 equivalent in dark mode
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const headerBg = useColorModeValue('brand.50', 'brand.900');
  const footerBg = useColorModeValue('gray.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  const brandBorderColor = useColorModeValue('brand.200', 'brand.700');
  const brandHeaderBorderColor = useColorModeValue('brand.100', 'brand.600');
  const brandTextColor = useColorModeValue('brand.700', 'brand.200');
  const brandSubTextColor = useColorModeValue('brand.600', 'brand.300');
  
  const orangeBg = useColorModeValue('orange.50', 'orange.900');
  const orangeBorder = useColorModeValue('orange.200', 'orange.700');
  const orangeText = useColorModeValue('orange.700', 'orange.200');
  
  const greenBg = useColorModeValue('green.50', 'green.900');
  const greenBorder = useColorModeValue('green.200', 'green.700');
  const greenText = useColorModeValue('green.700', 'green.200');
  const greenSubText = useColorModeValue('green.600', 'green.300');

  const [activeStep, setActiveStep] = useState(0);
  
  // State for Step 1: Client Selection
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteSearch, setClienteSearch] = useState('');
  const debouncedClienteSearch = useDebounce(clienteSearch, 500);
  
  // State for Step 2: Product Selection
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productoSearch, setProductoSearch] = useState('');
  const debouncedProductoSearch = useDebounce(productoSearch, 300);
  
  // State for Step 3: Payment & Config
  const [tipoVenta, setTipoVenta] = useState<'Contado' | 'Credito'>('Contado');
  const [cuotasConfig, setCuotasConfig] = useState(() => ({
    cantidad_cuotas: 1,
    frecuencia: 'Mensual' as 'Semanal' | 'Mensual',
    fecha_primer_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));

  // Queries
  const { data: clientes, isLoading: isLoadingClientes } = useQuery<Cliente[]>({
    queryKey: ['clientes-search', debouncedClienteSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ busqueda: debouncedClienteSearch, limit: '10' });
      const res = await api.get(`/api/clientes?${params}`);
      return res.data.data;
    },
    enabled: isOpen && activeStep === 0,
  });

  const { data: productos, isLoading: isLoadingProductos } = useQuery<Producto[]>({
    queryKey: ['productos-search', debouncedProductoSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ busqueda: debouncedProductoSearch, limit: '10' });
      const res = await api.get(`/api/productos?${params}`);
      return res.data.data;
    },
    enabled: isOpen && activeStep === 1,
  });

  // Mutation
  const createVentaMutation = useMutation({
    mutationFn: async (data: VentaCrear) => {
      const response = await api.post('/api/ventas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast({
        title: 'Venta registrada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleClose();
    },
    onError: (error: { response?: { data?: { mensaje?: string } } }) => {
      toast({
        title: 'Error al registrar venta',
        description: error.response?.data?.mensaje || 'Ocurrió un error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleClose = () => {
    setActiveStep(0);
    setSelectedCliente(null);
    setCart([]);
    setTipoVenta('Contado');
    setClienteSearch('');
    setProductoSearch('');
    onClose();
  };

  const addToCart = (producto: Producto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id_productos === producto.id_productos);
      if (existing) {
        return prev.map((item) =>
          item.producto.id_productos === producto.id_productos
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.producto.id_productos !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.producto.id_productos === productId ? { ...item, cantidad: quantity } : item
      )
    );
  };

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito;
      return total + price * item.cantidad;
    }, 0);
  }, [cart, tipoVenta]);

  const handleSubmit = () => {
    if (!selectedCliente) return;

    const ventaData: VentaCrear = {
      id_cliente: selectedCliente.id_cliente,
      tipo_venta: tipoVenta,
      detalles: cart.map((item) => ({
        id_productos: item.producto.id_productos,
        cantidad: item.cantidad,
        precio_unitario: tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito,
      })),
      ...(tipoVenta === 'Credito' && {
        configuracion_cuotas: cuotasConfig,
      }),
    };

    createVentaMutation.mutate(ventaData);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  // Calculate installments preview
  const installmentsPreview = useMemo(() => {
    if (tipoVenta !== 'Credito' || cuotasConfig.cantidad_cuotas <= 0) return [];
    const total = calculateTotal();
    const amountPerQuota = total / cuotasConfig.cantidad_cuotas;
    const dates = [];
    
    // Validate date
    const startDate = new Date(cuotasConfig.fecha_primer_vencimiento);
    if (isNaN(startDate.getTime())) return [];

    const currentDate = new Date(startDate);
    
    for (let i = 0; i < cuotasConfig.cantidad_cuotas; i++) {
      dates.push({
        number: i + 1,
        date: new Date(currentDate),
        amount: amountPerQuota
      });
      
      if (cuotasConfig.frecuencia === 'Mensual') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
    return dates;
  }, [tipoVenta, cuotasConfig, calculateTotal]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent h="90vh">
        <ModalHeader borderBottomWidth="1px" pb={4}>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Nueva Venta</Heading>
            {/* Stepper removed to fix crash */}
            <HStack spacing={0} w="full" justify="space-between" position="relative">
              {steps.map((step, index) => (
                <Box key={index} flex="1" position="relative">
                  <HStack spacing={2} align="center" justify={index === 0 ? 'flex-start' : index === steps.length - 1 ? 'flex-end' : 'center'}>
                    <Box
                      w="30px"
                      h="30px"
                      borderRadius="full"
                      bg={index <= activeStep ? 'brand.500' : 'gray.200'}
                      color={index <= activeStep ? 'white' : 'gray.500'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      zIndex={2}
                    >
                      {index < activeStep ? <CheckCircleIcon boxSize={3} /> : index + 1}
                    </Box>
                    <VStack align={index === 0 ? 'start' : index === steps.length - 1 ? 'end' : 'center'} spacing={0} display={{ base: 'none', md: 'flex' }}>
                      <Text fontWeight="bold" fontSize="sm" color={index <= activeStep ? 'gray.800' : 'gray.500'}>
                        {step.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {step.description}
                      </Text>
                    </VStack>
                  </HStack>
                  {index < steps.length - 1 && (
                    <Box
                      position="absolute"
                      top="15px"
                      left="50%"
                      w="100%"
                      h="2px"
                      bg={index < activeStep ? 'brand.500' : 'gray.200'}
                      zIndex={1}
                    />
                  )}
                </Box>
              ))}
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6} bg={secondaryBg}>
          {activeStep === 0 && (
            <VStack spacing={6} align="stretch" maxW="800px" mx="auto">
              <Card variant="outline" bg={bgColor} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>Buscar Cliente</Text>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.300" />
                      </InputLeftElement>
                      <Input
                        placeholder="Buscar por nombre, apellido o DNI..."
                        value={clienteSearch}
                        onChange={(e) => setClienteSearch(e.target.value)}
                        autoFocus
                        bg={inputBg}
                        borderColor={borderColor}
                        color={textColor}
                      />
                    </InputGroup>
                  </VStack>
                </CardBody>
              </Card>
              
              <Box 
                bg={bgColor} 
                borderRadius="lg" 
                borderWidth="1px" 
                borderColor={borderColor}
                flex="1" 
                overflow="hidden"
                boxShadow="sm"
              >
                <Table variant="simple" size="md">
                  <Thead bg={secondaryBg}>
                    <Tr>
                      <Th color={mutedColor}>Cliente</Th>
                      <Th color={mutedColor}>DNI</Th>
                      <Th color={mutedColor}>Estado</Th>
                      <Th width="100px" color={mutedColor}>Acción</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoadingClientes ? (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={8}>
                          <Text color={mutedColor}>Buscando clientes...</Text>
                        </Td>
                      </Tr>
                    ) : clientes?.map((cliente) => (
                      <Tr 
                        key={cliente.id_cliente} 
                        bg={selectedCliente?.id_cliente === cliente.id_cliente ? selectedBg : undefined}
                        _hover={{ bg: hoverBg }}
                        cursor="pointer"
                        onClick={() => setSelectedCliente(cliente)}
                      >
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={`${cliente.nombre_cliente} ${cliente.apell_cliente}`} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" color={textColor}>{cliente.nombre_cliente} {cliente.apell_cliente}</Text>
                              <Text fontSize="xs" color={mutedColor}>ID: #{cliente.id_cliente}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td color={textColor}>{cliente.DNI_cliente}</Td>
                        <Td>
                          <Badge colorScheme="green">Activo</Badge>
                        </Td>
                        <Td>
                          {selectedCliente?.id_cliente === cliente.id_cliente && (
                            <CheckCircleIcon color="green.500" boxSize={6} />
                          )}
                        </Td>
                      </Tr>
                    ))}
                    {!isLoadingClientes && clientes?.length === 0 && (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={8}>
                          <Text color={mutedColor}>No se encontraron clientes</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          )}

          {activeStep === 1 && (
            <Grid templateColumns="repeat(12, 1fr)" gap={6} h="full">
              {/* Left Column: Product Search & List */}
              <GridItem colSpan={7} display="flex" flexDirection="column" gap={4}>
                <Card variant="outline" bg={bgColor} borderColor={borderColor}>
                  <CardBody>
                    <HStack spacing={4}>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Buscar productos..."
                          value={productoSearch}
                          onChange={(e) => setProductoSearch(e.target.value)}
                          autoFocus
                          bg={inputBg}
                          borderColor={borderColor}
                          color={textColor}
                        />
                      </InputGroup>
                      <Select 
                        w="200px" 
                        value={tipoVenta} 
                        onChange={(e) => setTipoVenta(e.target.value as 'Contado' | 'Credito')}
                        variant="filled"
                        bg={inputBg}
                        borderColor={borderColor}
                        color={textColor}
                      >
                        <option value="Contado">Precio Contado</option>
                        <option value="Credito">Precio Crédito</option>
                      </Select>
                    </HStack>
                  </CardBody>
                </Card>

                <Box 
                  bg={bgColor} 
                  borderRadius="lg" 
                  borderWidth="1px" 
                  borderColor={borderColor}
                  flex="1" 
                  overflowY="auto"
                  boxShadow="sm"
                >
                  <Table variant="simple" size="sm">
                    <Thead bg={secondaryBg} position="sticky" top={0} zIndex={1}>
                      <Tr>
                        <Th color={mutedColor}>Producto</Th>
                        <Th isNumeric color={mutedColor}>Precio</Th>
                        <Th isNumeric color={mutedColor}>Stock</Th>
                        <Th width="50px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {isLoadingProductos ? (
                        <Tr>
                          <Td colSpan={4} textAlign="center" py={8} color={mutedColor}>Cargando...</Td>
                        </Tr>
                      ) : productos?.map((producto) => (
                        <Tr key={producto.id_productos} _hover={{ bg: hoverBg }}>
                          <Td>
                            <Text fontWeight="medium" color={textColor}>{producto.nombre_productos}</Text>
                            <Text fontSize="xs" color={mutedColor}>{producto.descripcion_productos}</Text>
                          </Td>
                          <Td isNumeric fontWeight="bold" color={textColor}>
                            {formatCurrency(tipoVenta === 'Contado' ? producto.precio_contado : producto.precio_credito)}
                          </Td>
                          <Td isNumeric>
                            <Badge colorScheme={producto.stock > 5 ? 'green' : producto.stock > 0 ? 'orange' : 'red'}>
                              {producto.stock} u.
                            </Badge>
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Agregar"
                              icon={<AddIcon />}
                              size="sm"
                              colorScheme="brand"
                              variant="ghost"
                              isDisabled={producto.stock === 0}
                              onClick={() => addToCart(producto)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </GridItem>

              {/* Right Column: Cart */}
              <GridItem colSpan={5} display="flex" flexDirection="column" h="full">
                <Card h="full" variant="outline" borderColor={brandBorderColor} borderWidth="2px" bg={bgColor}>
                  <CardBody display="flex" flexDirection="column" p={0}>
                    <Box p={4} bg={headerBg} borderBottomWidth="1px" borderColor={brandHeaderBorderColor}>
                      <Heading size="sm" color={brandTextColor}>Carrito de Compras</Heading>
                      <Text fontSize="sm" color={brandSubTextColor}>{cart.length} items seleccionados</Text>
                    </Box>
                    
                    <Box flex="1" overflowY="auto" p={2}>
                      {cart.length === 0 ? (
                        <VStack justify="center" h="full" color={mutedColor} spacing={4}>
                          <Box as={AddIcon} boxSize={10} />
                          <Text>Agrega productos para comenzar</Text>
                        </VStack>
                      ) : (
                        <VStack align="stretch" spacing={2}>
                          {cart.map((item) => (
                            <Box 
                              key={item.producto.id_productos} 
                              p={3} 
                              bg={bgColor} 
                              borderRadius="md" 
                              borderWidth="1px"
                              borderColor={borderColor}
                              boxShadow="sm"
                            >
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="bold" noOfLines={1} color={textColor}>{item.producto.nombre_productos}</Text>
                                <IconButton
                                  aria-label="Eliminar"
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.producto.id_productos)}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={mutedColor}>
                                  {formatCurrency(tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito)}
                                </Text>
                                <HStack>
                                  <NumberInput
                                    size="xs"
                                    maxW="70px"
                                    min={1}
                                    max={item.producto.stock}
                                    value={item.cantidad}
                                    onChange={(_, val) => updateQuantity(item.producto.id_productos, val)}
                                  >
                                    <NumberInputField color={textColor} />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                  <Text fontWeight="bold" minW="80px" textAlign="right" color={textColor}>
                                    {formatCurrency(
                                      (tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito) * item.cantidad
                                    )}
                                  </Text>
                                </HStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>

                    <Box p={4} bg={footerBg} borderTopWidth="1px" borderColor={borderColor}>
                      <HStack justify="space-between" mb={2}>
                        <Text color={mutedColor}>Subtotal</Text>
                        <Text fontWeight="bold" color={textColor}>{formatCurrency(calculateTotal())}</Text>
                      </HStack>
                      <Divider mb={2} borderColor={borderColor} />
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>Total</Text>
                        <Text fontSize="xl" fontWeight="bold" color={brandSubTextColor}>
                          {formatCurrency(calculateTotal())}
                        </Text>
                      </HStack>
                    </Box>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <VStack spacing={4} align="stretch">
                  <Card variant="outline" bg={bgColor} borderColor={borderColor}>
                    <CardBody>
                      <Heading size="sm" mb={4} display="flex" alignItems="center" color={textColor}>
                        <Avatar size="xs" mr={2} />
                        Datos del Cliente
                      </Heading>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Text fontWeight="bold" w="100px" color={textColor}>Nombre:</Text>
                          <Text color={textColor}>{selectedCliente?.nombre_cliente} {selectedCliente?.apell_cliente}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="bold" w="100px" color={textColor}>DNI:</Text>
                          <Text color={textColor}>{selectedCliente?.DNI_cliente}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="bold" w="100px" color={textColor}>Dirección:</Text>
                          <Text color={textColor}>{selectedCliente?.direccion_cliente || '-'}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card variant="outline" bg={bgColor} borderColor={borderColor}>
                    <CardBody>
                      <Heading size="sm" mb={4} color={textColor}>Resumen de Pago</Heading>
                      <VStack align="start" spacing={2}>
                        <HStack w="full" justify="space-between">
                          <Text color={mutedColor}>Tipo de Venta</Text>
                          <Badge colorScheme={tipoVenta === 'Contado' ? 'green' : 'blue'} fontSize="0.9em">
                            {tipoVenta}
                          </Badge>
                        </HStack>
                        <HStack w="full" justify="space-between">
                          <Text color={mutedColor}>Items</Text>
                          <Text fontWeight="bold" color={textColor}>{cart.length}</Text>
                        </HStack>
                        <Divider borderColor={borderColor} />
                        <HStack w="full" justify="space-between">
                          <Text fontSize="lg" fontWeight="bold" color={textColor}>Total a Pagar</Text>
                          <Text fontSize="2xl" fontWeight="bold" color={brandTextColor}>
                            {formatCurrency(calculateTotal())}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </GridItem>

              <GridItem>
                {tipoVenta === 'Credito' ? (
                  <Card variant="outline" h="full" bg={orangeBg} borderColor={orangeBorder}>
                    <CardBody>
                      <Heading size="sm" mb={4} color={orangeText}>Configuración de Cuotas</Heading>
                      <VStack spacing={4} align="stretch">
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" color={orangeText}>Cantidad</FormLabel>
                            <NumberInput
                              min={1}
                              max={24}
                              bg={inputBg}
                              value={cuotasConfig.cantidad_cuotas}
                              onChange={(_, val) => {
                                const value = Number(val);
                                if (!isNaN(value) && value > 0) {
                                  setCuotasConfig({ ...cuotasConfig, cantidad_cuotas: value });
                                }
                              }}
                            >
                              <NumberInputField color={textColor} />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm" color={orangeText}>Frecuencia</FormLabel>
                            <Select
                              bg={inputBg}
                              value={cuotasConfig.frecuencia}
                              onChange={(e) => setCuotasConfig({ ...cuotasConfig, frecuencia: e.target.value as 'Semanal' | 'Mensual' })}
                              color={textColor}
                            >
                              <option value="Mensual">Mensual</option>
                              <option value="Semanal">Semanal</option>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <FormControl>
                          <FormLabel fontSize="sm" color={orangeText}>Primer Vencimiento</FormLabel>
                          <Input
                            type="date"
                            bg={inputBg}
                            value={cuotasConfig.fecha_primer_vencimiento}
                            onChange={(e) => setCuotasConfig({ ...cuotasConfig, fecha_primer_vencimiento: e.target.value })}
                            color={textColor}
                          />
                        </FormControl>

                        <Box flex="1" bg={bgColor} borderRadius="md" p={3} overflowY="auto" maxH="250px">
                          <Text fontWeight="bold" mb={2} fontSize="sm" color={textColor}>Proyección de Pagos:</Text>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th color={mutedColor}>#</Th>
                                <Th color={mutedColor}>Vencimiento</Th>
                                <Th isNumeric color={mutedColor}>Monto</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {installmentsPreview.map((inst) => (
                                <Tr key={inst.number}>
                                  <Td color={textColor}>{inst.number}</Td>
                                  <Td color={textColor}>{inst.date.toLocaleDateString()}</Td>
                                  <Td isNumeric fontWeight="medium" color={textColor}>{formatCurrency(inst.amount)}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  <VStack h="full" justify="center" spacing={4} p={8} bg={greenBg} borderRadius="xl" border="1px dashed" borderColor={greenBorder}>
                    <CheckCircleIcon boxSize={12} color={greenText} />
                    <Heading size="md" color={greenText}>Venta al Contado</Heading>
                    <Text textAlign="center" color={greenSubText}>
                      El pago se debe realizar en su totalidad al momento de la entrega.
                    </Text>
                  </VStack>
                )}
              </GridItem>
            </Grid>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" bg={useColorModeValue('gray.50', 'gray.700')}>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          {activeStep > 0 && (
            <Button mr={3} onClick={() => setActiveStep(activeStep - 1)}>
              Atrás
            </Button>
          )}
          {activeStep < 2 ? (
            <Button
              colorScheme="brand"
              onClick={() => setActiveStep(activeStep + 1)}
              isDisabled={
                (activeStep === 0 && !selectedCliente) ||
                (activeStep === 1 && cart.length === 0)
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              colorScheme="green"
              size="lg"
              onClick={handleSubmit}
              isLoading={createVentaMutation.isPending}
              leftIcon={<CheckCircleIcon />}
            >
              Confirmar Venta
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
