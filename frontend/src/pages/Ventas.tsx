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
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { Venta } from '../types';

export const Ventas = () => {
  const bgColor = useColorModeValue('white', 'gray.800');

  const { data: ventas, isLoading } = useQuery<Venta[]>({
    queryKey: ['ventas'],
    queryFn: async () => {
      const response = await api.get('/api/ventas');
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
        <Heading size="lg">Gestión de Ventas</Heading>
      </HStack>

      <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Tipo</Th>
              <Th isNumeric>Total</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ventas?.map((venta) => (
              <Tr key={venta.id_venta}>
                <Td fontWeight="bold">#{venta.id_venta}</Td>
                <Td>{formatDate(venta.fecha_venta)}</Td>
                <Td>
                  {venta.nombre_cliente && venta.apell_cliente ? (
                    <Text>
                      {venta.nombre_cliente} {venta.apell_cliente}
                    </Text>
                  ) : (
                    <Text color="gray.500">Cliente #{venta.id_cliente}</Text>
                  )}
                </Td>
                <Td>
                  <Badge colorScheme={venta.tipo_venta === 'Contado' ? 'green' : 'blue'}>
                    {venta.tipo_venta}
                  </Badge>
                </Td>
                <Td isNumeric fontWeight="bold" color="brand.500">
                  {formatCurrency(venta.total_venta)}
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      venta.estado_vta === 'Completada'
                        ? 'green'
                        : venta.estado_vta === 'Pendiente'
                        ? 'yellow'
                        : 'gray'
                    }
                  >
                    {venta.estado_vta}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {(!ventas || ventas.length === 0) && (
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" textAlign="center">
          <Text color="gray.500">No hay ventas registradas</Text>
        </Box>
      )}
    </VStack>
  );
};
