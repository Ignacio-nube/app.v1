import {
  Box,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';
import type { Cuota, PagoHistorial } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { ComprobantePago } from '../components/ComprobantePago';
import { RegistrarPagoModal } from '../components/RegistrarPagoModal';

interface CuotasResponse {
  data: Cuota[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PagosHistorialResponse {
  data: PagoHistorial[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const Pagos = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { page, setPage, limit, setLimit } = usePagination();
  const [estadoFiltro, setEstadoFiltro] = useState<string>('Pendiente');
  const [vistaActual, setVistaActual] = useState<'cuotas' | 'historial'>('cuotas');
  const [tabIndex, setTabIndex] = useState(0);
  const [busqueda, setBusqueda] = useState('');

  const { data: cuotasResponse, isLoading: isLoadingCuotas } = useQuery<CuotasResponse>({
    queryKey: ['cuotas', page, limit, estadoFiltro, busqueda],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        estado: estadoFiltro,
        busqueda,
      });
      const res = await api.get(`/api/pagos/cuotas?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: vistaActual === 'cuotas',
  });

  const { data: historialResponse, isLoading: isLoadingHistorial } = useQuery<PagosHistorialResponse>({
    queryKey: ['historial-pagos', page, limit, busqueda],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        busqueda,
      });
      const res = await api.get(`/api/pagos/historial?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: vistaActual === 'historial',
  });

  const cuotas = cuotasResponse?.data;
  const historial = historialResponse?.data;
  const pagination = vistaActual === 'cuotas' ? cuotasResponse?.pagination : historialResponse?.pagination;
  const isLoading = vistaActual === 'cuotas' ? isLoadingCuotas : isLoadingHistorial;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading && !cuotas && !historial) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Gestión de Pagos y Cuotas</Heading>
      </HStack>

      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Buscar por cliente (Nombre, Apellido, DNI)..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPage(1); // Reset page on search
          }}
          bg={bgColor}
        />
      </InputGroup>

      <Tabs 
        colorScheme="brand" 
        index={tabIndex}
        onChange={(index) => {
          setTabIndex(index);
          if (index === 3) {
            setVistaActual('historial');
            setPage(1);
          } else {
            setVistaActual('cuotas');
            const estados = ['Pendiente', 'Vencida', 'Pagada'];
            setEstadoFiltro(estados[index]);
            setPage(1);
          }
        }}
      >
        <TabList>
          <Tab>Pendientes</Tab>
          <Tab>Vencidas</Tab>
          <Tab>Pagadas</Tab>
          <Tab>Historial de Pagos</Tab>
        </TabList>

        <TabPanels>
          {['Pendiente', 'Vencida', 'Pagada'].map((estado) => (
            <TabPanel key={estado} px={0}>
              <CuotasTable
                cuotas={cuotas || []}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                bgColor={bgColor}
              />
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
            </TabPanel>
          ))}
          <TabPanel px={0}>
            <HistorialTable
              pagos={historial || []}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              bgColor={bgColor}
            />
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

interface CuotasTableProps {
  cuotas: Cuota[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  bgColor: string;
}

const CuotasTable = ({ cuotas, formatCurrency, formatDate, bgColor }: CuotasTableProps) => {
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
      metodo_pago: data.descripcion_tipo_pago
    });
    onReceiptOpen();
  };

  if (!cuotas || cuotas.length === 0) {
    return (
      <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" textAlign="center">
        <Text color="gray.500">No hay cuotas en esta categoría</Text>
      </Box>
    );
  }

  return (
    <>
      <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="860px">
          <Thead>
            <Tr>
              <Th>Cliente</Th>
              <Th>Venta</Th>
              <Th>Tipo</Th>
              <Th>Cuota N°</Th>
              <Th isNumeric>Monto</Th>
              <Th>Vencimiento</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cuotas.map((cuota) => (
              <Tr key={cuota.id_cuota}>
                <Td>{cuota.nombre_cliente} {cuota.apell_cliente}</Td>
                <Td fontWeight="bold">#{cuota.id_venta}</Td>
                <Td>
                  <Badge colorScheme={cuota.tipo_venta === 'Contado' ? 'blue' : 'purple'}>
                    {cuota.tipo_venta || 'N/A'}
                  </Badge>
                </Td>
                <Td>{cuota.numero_cuota}</Td>
                <Td isNumeric fontWeight="bold" color="brand.500">
                  {formatCurrency(cuota.monto_cuota)}
                </Td>
                <Td>{formatDate(cuota.fecha_vencimiento)}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      cuota.estado_cuota === 'Pagada'
                        ? 'green'
                        : cuota.estado_cuota === 'Vencida'
                        ? 'red'
                        : 'yellow'
                    }
                  >
                    {cuota.estado_cuota}
                  </Badge>
                </Td>
                <Td>
                  {cuota.estado_cuota !== 'Pagada' && (
                    <Button
                      size="sm"
                      colorScheme="green"
                      _dark={{ bg: "green.300", color: "gray.900", _hover: { bg: "green.400" } }}
                      onClick={() => handleRegistrarPago(cuota)}
                    >
                      Registrar Pago
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
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

interface HistorialTableProps {
  pagos: PagoHistorial[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  bgColor: string;
}

const HistorialTable = ({ pagos, formatCurrency, formatDate, bgColor }: HistorialTableProps) => {
  if (!pagos || pagos.length === 0) {
    return (
      <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" textAlign="center">
        <Text color="gray.500">No hay pagos registrados</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
      <Box overflowX="auto">
        <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="760px">
          <Thead>
            <Tr>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Venta</Th>
              <Th>Tipo Venta</Th>
              <Th>Método Pago</Th>
              <Th isNumeric>Monto</Th>
              <Th>Cuotas Pagadas</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pagos.map((pago) => (
              <Tr key={pago.id_pago}>
                <Td>{formatDate(pago.fecha_pago)}</Td>
                <Td>
                  {pago.nombre_cliente} {pago.apell_cliente}
                </Td>
                <Td fontWeight="bold">#{pago.id_venta}</Td>
                <Td>
                  <Badge colorScheme={pago.tipo_venta === 'Contado' ? 'blue' : 'purple'}>
                    {pago.tipo_venta}
                  </Badge>
                </Td>
                <Td>{pago.descripcion_tipo_pago}</Td>
                <Td isNumeric fontWeight="bold" color="brand.500">
                  {formatCurrency(pago.monto)}
                </Td>
                <Td>{pago.cuotas_pagadas}</Td>
                <Td>
                  <Badge colorScheme={pago.estado === 'Completado' ? 'green' : 'yellow'}>
                    {pago.estado}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};
