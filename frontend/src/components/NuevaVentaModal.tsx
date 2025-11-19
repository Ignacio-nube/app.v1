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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteIcon, SearchIcon, AddIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Cliente, Producto, VentaCrear } from '../types';

interface NuevaVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
}

export const NuevaVentaModal = ({ isOpen, onClose }: NuevaVentaModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  // State for Step 1: Client Selection
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteSearch, setClienteSearch] = useState('');
  
  // State for Step 2: Product Selection
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productoSearch, setProductoSearch] = useState('');
  
  // State for Step 3: Payment & Config
  const [tipoVenta, setTipoVenta] = useState<'Contado' | 'Credito'>('Contado');
  const [cuotasConfig, setCuotasConfig] = useState({
    cantidad_cuotas: 1,
    frecuencia: 'Mensual' as 'Semanal' | 'Mensual',
    fecha_primer_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Queries
  const { data: clientes } = useQuery<Cliente[]>({
    queryKey: ['clientes-search', clienteSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ busqueda: clienteSearch, limit: '10' });
      const res = await api.get(`/api/clientes?${params}`);
      return res.data.data;
    },
    enabled: isOpen && step === 1,
  });

  const { data: productos } = useQuery<Producto[]>({
    queryKey: ['productos-search', productoSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ busqueda: productoSearch, limit: '10' });
      const res = await api.get(`/api/productos?${params}`);
      return res.data.data;
    },
    enabled: isOpen && step === 2,
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
    onError: (error: any) => {
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
    setStep(1);
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

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito;
      return total + price * item.cantidad;
    }, 0);
  };

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>Nueva Venta - Paso {step} de 3</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {step === 1 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Seleccionar Cliente</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                />
              </InputGroup>
              
              <Box maxH="300px" overflowY="auto" borderWidth="1px" borderRadius="md">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nombre</Th>
                      <Th>DNI</Th>
                      <Th>Acción</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {clientes?.map((cliente) => (
                      <Tr key={cliente.id_cliente} bg={selectedCliente?.id_cliente === cliente.id_cliente ? 'blue.50' : undefined}>
                        <Td>{cliente.nombre_cliente} {cliente.apell_cliente}</Td>
                        <Td>{cliente.DNI_cliente}</Td>
                        <Td>
                          <Button
                            size="xs"
                            colorScheme={selectedCliente?.id_cliente === cliente.id_cliente ? 'green' : 'blue'}
                            onClick={() => setSelectedCliente(cliente)}
                          >
                            {selectedCliente?.id_cliente === cliente.id_cliente ? 'Seleccionado' : 'Seleccionar'}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              {selectedCliente && (
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold">Cliente Seleccionado:</Text>
                  <Text>{selectedCliente.nombre_cliente} {selectedCliente.apell_cliente}</Text>
                  <Text fontSize="sm" color="gray.600">DNI: {selectedCliente.DNI_cliente}</Text>
                </Box>
              )}
            </VStack>
          )}

          {step === 2 && (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold">Seleccionar Productos</Text>
                <Select 
                  w="200px" 
                  value={tipoVenta} 
                  onChange={(e) => setTipoVenta(e.target.value as 'Contado' | 'Credito')}
                >
                  <option value="Contado">Precio Contado</option>
                  <option value="Credito">Precio Crédito</option>
                </Select>
              </HStack>

              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar productos..."
                  value={productoSearch}
                  onChange={(e) => setProductoSearch(e.target.value)}
                />
              </InputGroup>

              <Box maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="md">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Producto</Th>
                      <Th isNumeric>Precio</Th>
                      <Th isNumeric>Stock</Th>
                      <Th>Acción</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {productos?.map((producto) => (
                      <Tr key={producto.id_productos}>
                        <Td>{producto.nombre_productos}</Td>
                        <Td isNumeric>
                          {formatCurrency(tipoVenta === 'Contado' ? producto.precio_contado : producto.precio_credito)}
                        </Td>
                        <Td isNumeric>{producto.stock}</Td>
                        <Td>
                          <IconButton
                            aria-label="Agregar"
                            icon={<AddIcon />}
                            size="xs"
                            colorScheme="green"
                            isDisabled={producto.stock === 0}
                            onClick={() => addToCart(producto)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Divider />

              <Text fontWeight="bold">Carrito de Compras</Text>
              <Box maxH="200px" overflowY="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Producto</Th>
                      <Th isNumeric>Precio Unit.</Th>
                      <Th>Cantidad</Th>
                      <Th isNumeric>Subtotal</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cart.map((item) => (
                      <Tr key={item.producto.id_productos}>
                        <Td>{item.producto.nombre_productos}</Td>
                        <Td isNumeric>
                          {formatCurrency(tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito)}
                        </Td>
                        <Td>
                          <NumberInput
                            size="xs"
                            maxW="60px"
                            min={1}
                            max={item.producto.stock}
                            value={item.cantidad}
                            onChange={(_, val) => updateQuantity(item.producto.id_productos, val)}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Td>
                        <Td isNumeric>
                          {formatCurrency(
                            (tipoVenta === 'Contado' ? item.producto.precio_contado : item.producto.precio_credito) * item.cantidad
                          )}
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Eliminar"
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeFromCart(item.producto.id_productos)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              <HStack justify="flex-end" p={2} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="lg">Total: {formatCurrency(calculateTotal())}</Text>
              </HStack>
            </VStack>
          )}

          {step === 3 && (
            <VStack spacing={4} align="stretch">
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Heading size="sm" mb={2}>Resumen de Venta</Heading>
                <Text><strong>Cliente:</strong> {selectedCliente?.nombre_cliente} {selectedCliente?.apell_cliente}</Text>
                <Text><strong>Tipo de Venta:</strong> {tipoVenta}</Text>
                <Text><strong>Total:</strong> {formatCurrency(calculateTotal())}</Text>
                <Text><strong>Items:</strong> {cart.length}</Text>
              </Box>

              {tipoVenta === 'Credito' && (
                <Box p={4} borderWidth="1px" borderRadius="md" bg="orange.50">
                  <Heading size="sm" mb={4}>Configuración de Cuotas</Heading>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Cantidad de Cuotas</FormLabel>
                      <NumberInput
                        min={1}
                        max={24}
                        value={cuotasConfig.cantidad_cuotas}
                        onChange={(_, val) => {
                          const value = Number(val);
                          if (!isNaN(value) && value > 0) {
                            setCuotasConfig({ ...cuotasConfig, cantidad_cuotas: value });
                          }
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Frecuencia</FormLabel>
                      <Select
                        value={cuotasConfig.frecuencia}
                        onChange={(e) => setCuotasConfig({ ...cuotasConfig, frecuencia: e.target.value as any })}
                      >
                        <option value="Mensual">Mensual</option>
                        <option value="Semanal">Semanal</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Fecha Primer Vencimiento</FormLabel>
                      <Input
                        type="date"
                        value={cuotasConfig.fecha_primer_vencimiento}
                        onChange={(e) => setCuotasConfig({ ...cuotasConfig, fecha_primer_vencimiento: e.target.value })}
                      />
                    </FormControl>

                    <Box w="full" p={2} bg="white" borderRadius="md">
                      <Text fontWeight="bold">Proyección de Cuotas:</Text>
                      <Text>
                        {cuotasConfig.cantidad_cuotas} cuotas de {formatCurrency(
                          cuotasConfig.cantidad_cuotas > 0 
                            ? calculateTotal() / cuotasConfig.cantidad_cuotas 
                            : 0
                        )}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          {step > 1 && (
            <Button mr={3} onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          )}
          {step < 3 ? (
            <Button
              colorScheme="brand"
              onClick={() => setStep(step + 1)}
              isDisabled={
                (step === 1 && !selectedCliente) ||
                (step === 2 && cart.length === 0)
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={createVentaMutation.isPending}
            >
              Confirmar Venta
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
