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
import api from '../config/api';
import { Cuota } from '../types';

export const Pagos = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  const { data: cuotas, isLoading } = useQuery<Cuota[]>({
    queryKey: ['cuotas-pendientes'],
    queryFn: async () => {
      const response = await api.get('/api/pagos/cuotas-cliente');
      return response.data;
    },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const cuotasPendientes = cuotas?.filter((c) => c.estado_cuota === 'Pendiente') || [];
  const cuotasVencidas = cuotas?.filter((c) => c.estado_cuota === 'Vencida') || [];
  const cuotasPagadas = cuotas?.filter((c) => c.estado_cuota === 'Pagada') || [];

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
        <Heading size="lg">Gestión de Pagos y Cuotas</Heading>
      </HStack>

      <Tabs colorScheme="brand">
        <TabList>
          <Tab>
            Pendientes{' '}
            {cuotasPendientes.length > 0 && (
              <Badge ml={2} colorScheme="yellow">
                {cuotasPendientes.length}
              </Badge>
            )}
          </Tab>
          <Tab>
            Vencidas{' '}
            {cuotasVencidas.length > 0 && (
              <Badge ml={2} colorScheme="red">
                {cuotasVencidas.length}
              </Badge>
            )}
          </Tab>
          <Tab>Pagadas</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <CuotasTable
              cuotas={cuotasPendientes}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              bgColor={bgColor}
            />
          </TabPanel>
          <TabPanel px={0}>
            <CuotasTable
              cuotas={cuotasVencidas}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              bgColor={bgColor}
            />
          </TabPanel>
          <TabPanel px={0}>
            <CuotasTable
              cuotas={cuotasPagadas}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              bgColor={bgColor}
            />
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
