import {
  Box,
  Heading,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Skeleton,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useDisclosure,
  IconButton,
  Tooltip,
  Center,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import {
  FiPrinter,
  FiClock,
  FiAlertCircle,
  FiList,
  FiInbox,
  FiDollarSign,
} from 'react-icons/fi';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import api from '../config/api';
import type { Cuota, PagoHistorial } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { ComprobantePago } from '../components/ComprobantePago';
import { RegistrarPagoModal } from '../components/RegistrarPagoModal';

// ─── Types ──────────────────────────────────────────────────────────────────

type ActiveTab = 'pendiente' | 'vencida' | 'historial';

interface CuotasResponse {
  data: Cuota[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface PagosHistorialResponse {
  data: PagoHistorial[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const SKELETON_ROWS = 6;

// ─── Main Page ───────────────────────────────────────────────────────────────

export const Pagos = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const { page, setPage, limit, setLimit } = usePagination();

  const [activeTab, setActiveTab] = useState<ActiveTab>('pendiente');
  const [searchInput, setSearchInput] = useState('');
  const busqueda = useDebounce(searchInput, 400);

  useEffect(() => { setPage(1); }, [busqueda]);

  const tabIndex: Record<ActiveTab, number> = { pendiente: 0, vencida: 1, historial: 2 };
  const estadoFiltro = activeTab === 'vencida' ? 'Vencida' : 'Pendiente';

  const {
    data: cuotasResponse,
    isLoading: isLoadingCuotas,
    isFetching: isFetchingCuotas,
  } = useQuery<CuotasResponse>({
    queryKey: ['cuotas', page, limit, estadoFiltro, busqueda],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        estado: estadoFiltro,
        busqueda,
      });
      return (await api.get(`/pagos/cuotas?${params}`)).data;
    },
    placeholderData: keepPreviousData,
    enabled: activeTab !== 'historial',
  });

  const {
    data: historialResponse,
    isLoading: isLoadingHistorial,
    isFetching: isFetchingHistorial,
  } = useQuery<PagosHistorialResponse>({
    queryKey: ['historial-pagos', page, limit, busqueda],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        busqueda,
      });
      return (await api.get(`/pagos/historial?${params}`)).data;
    },
    placeholderData: keepPreviousData,
    enabled: activeTab === 'historial',
  });

  const isFetching = activeTab !== 'historial' ? isFetchingCuotas : isFetchingHistorial;
  const pagination =
    activeTab !== 'historial' ? cuotasResponse?.pagination : historialResponse?.pagination;
  const total = pagination?.total ?? 0;

  const handleTabChange = (index: number) => {
    const tabs: ActiveTab[] = ['pendiente', 'vencida', 'historial'];
    setActiveTab(tabs[index]);
    setPage(1);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Pagos y Cuotas</Heading>

      {/* Search bar — debounced, spinner appears while fetching */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Buscar por cliente, apellido o DNI..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          bg={bg}
          borderRadius="lg"
        />
        {isFetching && (
          <InputRightElement>
            <Spinner size="xs" color="brand.500" />
          </InputRightElement>
        )}
      </InputGroup>

      {/* Tabs */}
      <Tabs
        colorScheme="brand"
        index={tabIndex[activeTab]}
        onChange={handleTabChange}
        isLazy
      >
        <TabList>
          {/* Pendientes */}
          <Tab>
            <HStack spacing={2}>
              <Icon as={FiClock} />
              <Text>Pendientes</Text>
              {activeTab === 'pendiente' && total > 0 && (
                <Badge colorScheme="yellow" borderRadius="full" fontSize="xs" ml={1}>
                  {total}
                </Badge>
              )}
            </HStack>
          </Tab>

          {/* Vencidas */}
          <Tab>
            <HStack spacing={2}>
              <Icon as={FiAlertCircle} color={activeTab === 'vencida' ? 'red.500' : undefined} />
              <Text>Vencidas</Text>
              {activeTab === 'vencida' && total > 0 && (
                <Badge colorScheme="red" borderRadius="full" fontSize="xs" ml={1}>
                  {total}
                </Badge>
              )}
            </HStack>
          </Tab>

          {/* Historial */}
          <Tab>
            <HStack spacing={2}>
              <Icon as={FiList} />
              <Text>Historial de Pagos</Text>
              {activeTab === 'historial' && total > 0 && (
                <Badge colorScheme="green" borderRadius="full" fontSize="xs" ml={1}>
                  {total}
                </Badge>
              )}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <CuotasTable
              cuotas={cuotasResponse?.data || []}
              isLoading={isLoadingCuotas}
              bg={bg}
              borderColor={borderColor}
            />
          </TabPanel>

          <TabPanel px={0}>
            <CuotasTable
              cuotas={cuotasResponse?.data || []}
              isLoading={isLoadingCuotas}
              bg={bg}
              borderColor={borderColor}
            />
          </TabPanel>

          <TabPanel px={0}>
            <HistorialTable
              pagos={historialResponse?.data || []}
              isLoading={isLoadingHistorial}
              bg={bg}
              borderColor={borderColor}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Pagination — shared, outside tabs */}
      {pagination && (
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
    </VStack>
  );
};

// ─── CuotasTable ─────────────────────────────────────────────────────────────

interface CuotasTableProps {
  cuotas: Cuota[];
  isLoading: boolean;
  bg: string;
  borderColor: string;
}

const CuotasTable = ({ cuotas, isLoading, bg, borderColor }: CuotasTableProps) => {
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isReceiptOpen, onOpen: onReceiptOpen, onClose: onReceiptClose } = useDisclosure();
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<Cuota | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleRegistrarPago = (cuota: Cuota) => {
    setCuotaSeleccionada(cuota);
    onOpen();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaymentSuccess = (data: any) => {
    setReceiptData({
      id_pago: data.id_pago,
      fecha_pago: data.fecha_pago,
      monto: data.monto,
      cliente: `${cuotaSeleccionada?.nombre_cliente} ${cuotaSeleccionada?.apell_cliente}`,
      dni: cuotaSeleccionada?.DNI_cliente || 'N/A',
      concepto: `Cuota ${cuotaSeleccionada?.numero_cuota} de Venta #${cuotaSeleccionada?.id_venta}`,
      metodo_pago: data.descripcion_tipo_pago,
    });
    onReceiptOpen();
  };

  return (
    <>
      <Box bg={bg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="720px">
            <Thead>
              <Tr>
                <Th>Cliente</Th>
                <Th>Venta</Th>
                <Th>Tipo</Th>
                <Th>Cuota</Th>
                <Th isNumeric>Monto</Th>
                <Th>Vencimiento</Th>
                <Th>Acción</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <Tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Td key={j}>
                        <Skeleton h="4" borderRadius="md" />
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : cuotas.length === 0 ? (
                <Tr>
                  <Td colSpan={7} border="none">
                    <Center py={12} flexDirection="column" gap={3}>
                      <Icon as={FiInbox} boxSize={10} color="gray.300" />
                      <Text color="gray.400" fontSize="sm">
                        No hay cuotas en esta categoría
                      </Text>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                cuotas.map((cuota) => (
                  <Tr key={cuota.id_cuota} _hover={{ bg: hoverBg }} transition="background 0.15s">
                    <Td fontWeight="medium">
                      {cuota.nombre_cliente} {cuota.apell_cliente}
                    </Td>
                    <Td>
                      <Text fontWeight="bold" color="gray.500" fontSize="sm">
                        #{cuota.id_venta}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={cuota.tipo_venta === 'Contado' ? 'blue' : 'purple'}
                        fontSize="xs"
                      >
                        {cuota.tipo_venta || '—'}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="semibold">
                          #{cuota.numero_cuota}
                        </Text>
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="bold" color="brand.500">
                        {formatCurrency(cuota.monto_cuota)}
                      </Text>
                    </Td>
                    <Td>
                      <Text
                        fontSize="sm"
                        color={cuota.estado_cuota === 'Vencida' ? 'red.500' : undefined}
                        fontWeight={cuota.estado_cuota === 'Vencida' ? 'semibold' : undefined}
                      >
                        {formatDate(cuota.fecha_vencimiento)}
                      </Text>
                    </Td>
                    <Td>
                      {cuota.estado_cuota !== 'Pagada' && (
                        <Tooltip label="Registrar pago de esta cuota">
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<FiDollarSign />}
                            _dark={{ bg: 'green.300', color: 'gray.900', _hover: { bg: 'green.400' } }}
                            onClick={() => handleRegistrarPago(cuota)}
                          >
                            Pagar
                          </Button>
                        </Tooltip>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <RegistrarPagoModal
        isOpen={isOpen}
        onClose={onClose}
        cuota={cuotaSeleccionada}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <ComprobantePago
        isOpen={isReceiptOpen}
        onClose={onReceiptClose}
        pago={receiptData}
      />
    </>
  );
};

// ─── HistorialTable ───────────────────────────────────────────────────────────

interface HistorialTableProps {
  pagos: PagoHistorial[];
  isLoading: boolean;
  bg: string;
  borderColor: string;
}

const HistorialTable = ({ pagos, isLoading, bg, borderColor }: HistorialTableProps) => {
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const { isOpen: isReceiptOpen, onOpen: onReceiptOpen, onClose: onReceiptClose } = useDisclosure();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPago, setSelectedPago] = useState<any>(null);

  const handleReimprimir = (pago: PagoHistorial) => {
    setSelectedPago({
      id_pago: pago.id_pago,
      fecha_pago: pago.fecha_pago,
      monto: pago.monto,
      cliente: `${pago.nombre_cliente} ${pago.apell_cliente}`,
      dni: pago.DNI_cliente || 'N/A',
      concepto: `${pago.cuotas_pagadas} cuota(s) — Venta #${pago.id_venta}`,
      metodo_pago: pago.descripcion_tipo_pago,
    });
    onReceiptOpen();
  };

  return (
    <>
      <Box bg={bg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="720px">
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Cliente</Th>
                <Th>Venta</Th>
                <Th>Método de Pago</Th>
                <Th>Cuotas</Th>
                <Th isNumeric>Monto</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <Tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Td key={j}>
                        <Skeleton h="4" borderRadius="md" />
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : pagos.length === 0 ? (
                <Tr>
                  <Td colSpan={7} border="none">
                    <Center py={12} flexDirection="column" gap={3}>
                      <Icon as={FiInbox} boxSize={10} color="gray.300" />
                      <Text color="gray.400" fontSize="sm">
                        No hay pagos registrados
                      </Text>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                pagos.map((pago) => (
                  <Tr key={pago.id_pago} _hover={{ bg: hoverBg }} transition="background 0.15s">
                    <Td>
                      <Text fontSize="sm">{formatDate(pago.fecha_pago)}</Text>
                    </Td>
                    <Td fontWeight="medium">
                      {pago.nombre_cliente} {pago.apell_cliente}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Text fontWeight="bold" color="gray.500" fontSize="sm">
                          #{pago.id_venta}
                        </Text>
                        <Badge
                          colorScheme={pago.tipo_venta === 'Contado' ? 'blue' : 'purple'}
                          fontSize="xs"
                        >
                          {pago.tipo_venta}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{pago.descripcion_tipo_pago}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="gray" variant="outline" fontSize="xs">
                        {pago.cuotas_pagadas} cuota{Number(pago.cuotas_pagadas) !== 1 ? 's' : ''}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="bold" color="brand.500">
                        {formatCurrency(pago.monto)}
                      </Text>
                    </Td>
                    <Td>
                      <Tooltip label="Reimprimir comprobante">
                        <IconButton
                          aria-label="Reimprimir comprobante"
                          icon={<FiPrinter />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleReimprimir(pago)}
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <ComprobantePago
        isOpen={isReceiptOpen}
        onClose={onReceiptClose}
        pago={selectedPago}
      />
    </>
  );
};
