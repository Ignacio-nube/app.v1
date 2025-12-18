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
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { AddIcon, EditIcon, SearchIcon } from '@chakra-ui/icons';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../config/api';
import type { ClienteConDeuda } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

import { ClienteModal } from '../components/ClienteModal';

interface ClientesResponse {
  data: ClienteConDeuda[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const Clientes = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { page, setPage, limit, setLimit } = usePagination();

  const [editingCliente, setEditingCliente] = useState<ClienteConDeuda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useQuery<ClientesResponse>({
    queryKey: ['clientes', page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        busqueda: searchTerm,
      });
      const res = await api.get(`/clientes?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const clientes = response?.data;
  const pagination = response?.pagination;

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/clientes/${id}/estado`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Estado actualizado', status: 'success', duration: 3000, isClosable: true });
    },
  });

  const handleOpenCreate = () => {
    setEditingCliente(null);
    onOpen();
  };

  const handleOpenEdit = (cliente: ClienteConDeuda) => {
    setEditingCliente(cliente);
    onOpen();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  if (isLoading && !clientes) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Gestión de Clientes</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={handleOpenCreate}>
          Nuevo Cliente
        </Button>
      </HStack>

      <InputGroup maxW="400px">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </InputGroup>

      <Box bg={bgColor} borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }} minW="720px">
          <Thead>
            <Tr>
              <Th>Cliente</Th>
              <Th>DNI</Th>
              <Th>Teléfono</Th>
              <Th>Deuda</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {clientes?.map((cliente) => (
              <Tr key={cliente.id_cliente}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">
                      {cliente.nombre_cliente} {cliente.apell_cliente}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {cliente.mail_cliente}
                    </Text>
                  </VStack>
                </Td>
                <Td>{cliente.DNI_cliente}</Td>
                <Td>{cliente.telefono_cliente || '-'}</Td>
                <Td>
                  {cliente.tiene_deuda ? (
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color="red.500">
                        {formatCurrency(cliente.total_deuda)}
                      </Text>
                      {cliente.cuotas_vencidas > 0 && (
                        <Badge colorScheme="red" fontSize="xs">
                          {cliente.cuotas_vencidas} vencidas
                        </Badge>
                      )}
                    </VStack>
                  ) : (
                    <Text color="green.500" fontWeight="medium">
                      Sin deuda
                    </Text>
                  )}
                </Td>
                <Td>
                  <Badge colorScheme={cliente.estado_cliente === 'Activo' ? 'green' : 'red'}>
                    {cliente.estado_cliente}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar"
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => handleOpenEdit(cliente)}
                    />
                    <IconButton
                      aria-label="Cambiar estado"
                      icon={cliente.estado_cliente === 'Activo' ? <FiXCircle /> : <FiCheckCircle />}
                      size="sm"
                      colorScheme={cliente.estado_cliente === 'Activo' ? 'red' : 'green'}
                      variant="ghost"
                      onClick={() => toggleStatusMutation.mutate(cliente.id_cliente)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
          </Table>
        </Box>
        
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
      </Box>

      <ClienteModal
        isOpen={isOpen}
        onClose={onClose}
        clienteToEdit={editingCliente}
      />
    </VStack>
  );
};
