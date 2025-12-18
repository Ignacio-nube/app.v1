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
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

import { ProveedorModal } from '../components/ProveedorModal';

export interface Proveedor {
  id_proveedor: number;
  nombre_prov: string;
  contacto_prov: string;
  direccion_prov: string;
  estado_prov: 'Activo' | 'Inactivo';
}

interface ProveedoresResponse {
  data: Proveedor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const Proveedores = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { page, setPage, limit, setLimit } = usePagination();

  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useQuery<ProveedoresResponse>({
    queryKey: ['proveedores', page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        busqueda: searchTerm,
      });
      const res = await api.get(`/proveedores?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const proveedores = response?.data;
  const pagination = response?.pagination;

  const toggleStatusMutation = useMutation({
    mutationFn: async (proveedor: Proveedor) => {
      const newStatus = proveedor.estado_prov === 'Activo' ? 'Inactivo' : 'Activo';
      const response = await api.put(`/proveedores/${proveedor.id_proveedor}`, {
        ...proveedor,
        estado_prov: newStatus
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast({ title: 'Estado actualizado', status: 'success', duration: 3000, isClosable: true });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje || 'Error al cambiar estado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingProveedor(null);
    onOpen();
  };

  const handleOpenEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    onOpen();
  };

  if (isLoading && !proveedores) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Gestión de Proveedores</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={handleOpenCreate}>
          Nuevo Proveedor
        </Button>
      </HStack>

      <InputGroup maxW="400px">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Buscar por nombre, contacto o dirección..."
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
              <Th>Nombre</Th>
              <Th>Contacto</Th>
              <Th>Dirección</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {proveedores?.map((prov) => (
              <Tr key={prov.id_proveedor}>
                <Td fontWeight="medium">{prov.nombre_prov}</Td>
                <Td>{prov.contacto_prov || '-'}</Td>
                <Td>{prov.direccion_prov || '-'}</Td>
                <Td>
                  <Badge colorScheme={prov.estado_prov === 'Activo' ? 'green' : 'red'}>
                    {prov.estado_prov}
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
                      onClick={() => handleOpenEdit(prov)}
                    />
                    <IconButton
                      aria-label="Cambiar estado"
                      icon={prov.estado_prov === 'Activo' ? <FiXCircle /> : <FiCheckCircle />}
                      size="sm"
                      colorScheme={prov.estado_prov === 'Activo' ? 'red' : 'green'}
                      variant="ghost"
                      onClick={() => toggleStatusMutation.mutate(prov)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
            {proveedores?.length === 0 && (
              <Tr>
                <Td colSpan={5} textAlign="center" py={4}>
                  <Text color="gray.500">No se encontraron proveedores</Text>
                </Td>
              </Tr>
            )}
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

      <ProveedorModal
        isOpen={isOpen}
        onClose={onClose}
        proveedorToEdit={editingProveedor}
      />
    </VStack>
  );
};
