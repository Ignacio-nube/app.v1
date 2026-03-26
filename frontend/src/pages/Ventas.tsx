import {
  Box,
  Heading,
  VStack,
  Stack,
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
  HStack,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import api from '../config/api';
import { Venta } from '../types';
import { NuevaVentaModal } from '../components/NuevaVentaModal';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

interface VentasResponse {
  data: Venta[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const Ventas = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { page, setPage, limit, setLimit } = usePagination();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: response, isLoading } = useQuery<VentasResponse>({
    queryKey: ['ventas', page, limit],
    queryFn: async () => {
      const res = await api.get(`/ventas?page=${page}&limit=${limit}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const ventas = response?.data;
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

  return (
    <VStack spacing={6} align="stretch">
      <Stack 
        direction={{ base: 'column', sm: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', sm: 'center' }}
        spacing={4}
      >
        <Heading size="lg">Gestión de Ventas</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="brand" 
          onClick={onOpen}
          w={{ base: 'full', sm: 'auto' }}
        >
          Nueva Venta
        </Button>
      </Stack>

      <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="800px">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Tipo</Th>
              <Th isNumeric>Subtotal</Th>
              <Th isNumeric>Interés</Th>
              <Th isNumeric>Total</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <Td key={j}><Skeleton h="4" borderRadius="md" /></Td>
                    ))}
                  </Tr>
                ))
              : ventas?.map((venta) => (
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
                <Td isNumeric>
                  {formatCurrency(venta.total_venta)}
                </Td>
                <Td isNumeric>
                  {venta.porcentaje_interes && venta.porcentaje_interes > 0 ? (
                    <Badge colorScheme="orange">{venta.porcentaje_interes}%</Badge>
                  ) : (
                    <Text color="gray.400">-</Text>
                  )}
                </Td>
                <Td isNumeric fontWeight="bold" color="brand.500">
                  {formatCurrency(venta.total_con_interes || venta.total_venta)}
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
        
        {pagination && (
          <Box p={4} borderTopWidth="1px">
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
          </Box>
        )}
      </Box>

      {(!ventas || ventas.length === 0) && (
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" textAlign="center">
          <Text color="gray.500">No hay ventas registradas</Text>
        </Box>
      )}

      <NuevaVentaModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  );
};
