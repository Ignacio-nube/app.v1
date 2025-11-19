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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddIcon, EditIcon, SearchIcon } from '@chakra-ui/icons';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../config/api';
import { ClienteConDeuda, ClienteFormData } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

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
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre_cliente: '',
    apell_cliente: '',
    DNI_cliente: '',
    telefono_cliente: '',
    mail_cliente: '',
    direccion_cliente: '',
  });

  const { data: response, isLoading } = useQuery<ClientesResponse>({
    queryKey: ['clientes', page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        busqueda: searchTerm,
      });
      const res = await api.get(`/api/clientes?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const clientes = response?.data;
  const pagination = response?.pagination;

  const createMutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      const response = await api.post('/api/clientes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente creado', status: 'success', duration: 3000, isClosable: true });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: ClienteFormData }) => {
      const response = await api.put(`/api/clientes/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente actualizado', status: 'success', duration: 3000, isClosable: true });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/api/clientes/${id}/estado`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Estado actualizado', status: 'success', duration: 3000, isClosable: true });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre_cliente: '',
      apell_cliente: '',
      DNI_cliente: '',
      telefono_cliente: '',
      mail_cliente: '',
      direccion_cliente: '',
    });
    setEditingCliente(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (cliente: ClienteConDeuda) => {
    setEditingCliente(cliente);
    setFormData({
      nombre_cliente: cliente.nombre_cliente,
      apell_cliente: cliente.apell_cliente,
      DNI_cliente: cliente.DNI_cliente,
      telefono_cliente: cliente.telefono_cliente || '',
      mail_cliente: cliente.mail_cliente || '',
      direccion_cliente: cliente.direccion_cliente || '',
    });
    onOpen();
  };

  const handleSubmit = () => {
    if (editingCliente) {
      updateMutation.mutate({ id: editingCliente.id_cliente, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
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
        <Table variant="simple">
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    value={formData.nombre_cliente}
                    onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Apellido</FormLabel>
                  <Input
                    value={formData.apell_cliente}
                    onChange={(e) => setFormData({ ...formData, apell_cliente: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <HStack w="full" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>DNI</FormLabel>
                  <Input
                    value={formData.DNI_cliente}
                    onChange={(e) => setFormData({ ...formData, DNI_cliente: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    value={formData.telefono_cliente}
                    onChange={(e) => setFormData({ ...formData, telefono_cliente: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.mail_cliente}
                  onChange={(e) => setFormData({ ...formData, mail_cliente: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Input
                  value={formData.direccion_cliente}
                  onChange={(e) => setFormData({ ...formData, direccion_cliente: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isDisabled={
                !formData.nombre_cliente || !formData.apell_cliente || !formData.DNI_cliente
              }
            >
              {editingCliente ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
