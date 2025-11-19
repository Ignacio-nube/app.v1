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
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../config/api';
import { Cuota } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

interface CuotasResponse {
  data: Cuota[];
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

  const { data: response, isLoading } = useQuery<CuotasResponse>({
    queryKey: ['cuotas', page, limit, estadoFiltro],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        estado: estadoFiltro,
      });
      const res = await api.get(`/api/pagos/cuotas?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const cuotas = response?.data;
  const pagination = response?.pagination;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading && !cuotas) {
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

      <Tabs colorScheme="brand" onChange={(index) => {
        const estados = ['Pendiente', 'Vencida', 'Pagada'];
        setEstadoFiltro(estados[index]);
        setPage(1);
      }}>
        <TabList>
          <Tab>Pendientes</Tab>
          <Tab>Vencidas</Tab>
          <Tab>Pagadas</Tab>
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
  if (!cuotas || cuotas.length === 0) {
    return (
      <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" textAlign="center">
        <Text color="gray.500">No hay cuotas en esta categoría</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Venta</Th>
            <Th>Cuota N°</Th>
            <Th isNumeric>Monto</Th>
            <Th>Vencimiento</Th>
            <Th>Estado</Th>
          </Tr>
        </Thead>
        <Tbody>
          {cuotas.map((cuota) => (
            <Tr key={cuota.id_cuota}>
              <Td fontWeight="bold">#{cuota.id_venta}</Td>
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
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
