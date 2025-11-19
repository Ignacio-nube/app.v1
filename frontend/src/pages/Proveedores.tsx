import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Select,
  useToast,
  Text,
  Badge,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../config/api';

interface Proveedor {
  id_proveedor: number;
  nombre_prov: string;
  contacto_prov: string;
  direccion_prov: string;
  estado_prov: 'Activo' | 'Inactivo';
}

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchProveedores = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/proveedores');
      setProveedores(response.data);
    } catch (error) {
      toast({
        title: 'Error al cargar proveedores',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nombre_prov: formData.get('nombre_prov'),
      contacto_prov: formData.get('contacto_prov'),
      direccion_prov: formData.get('direccion_prov'),
      estado_prov: formData.get('estado_prov'),
    };

    try {
      if (selectedProveedor) {
        await api.put(`/api/proveedores/${selectedProveedor.id_proveedor}`, data);
        toast({ title: 'Proveedor actualizado', status: 'success' });
      } else {
        await api.post('/api/proveedores', data);
        toast({ title: 'Proveedor creado', status: 'success' });
      }
      onClose();
      fetchProveedores();
    } catch (error) {
      toast({ title: 'Error al guardar', status: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de desactivar este proveedor?')) return;
    try {
      await api.delete(`/api/proveedores/${id}`);
      toast({ title: 'Proveedor desactivado', status: 'success' });
      fetchProveedores();
    } catch (error) {
      toast({ title: 'Error al eliminar', status: 'error' });
    }
  };

  const openModal = (proveedor?: Proveedor) => {
    setSelectedProveedor(proveedor || null);
    onOpen();
  };

  return (
    <Container maxW="container.xl">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gestión de Proveedores</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={() => openModal()}>
          Nuevo Proveedor
        </Button>
      </Flex>

      <Box bg="white" shadow="sm" borderRadius="lg" overflowX="auto">
        <Table variant="simple">
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
            {proveedores.map((prov) => (
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
                  <IconButton
                    aria-label="Editar"
                    icon={<FiEdit2 />}
                    size="sm"
                    mr={2}
                    onClick={() => openModal(prov)}
                  />
                  <IconButton
                    aria-label="Eliminar"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(prov.id_proveedor)}
                  />
                </Td>
              </Tr>
            ))}
            {proveedores.length === 0 && !isLoading && (
              <Tr>
                <Td colSpan={5} textAlign="center" py={4}>
                  <Text color="gray.500">No hay proveedores registrados</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>
            {selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                name="nombre_prov"
                defaultValue={selectedProveedor?.nombre_prov}
                placeholder="Ej: Samsung Electronics"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Contacto (Email/Teléfono)</FormLabel>
              <Input
                name="contacto_prov"
                defaultValue={selectedProveedor?.contacto_prov || ''}
                placeholder="Ej: contacto@samsung.com"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Dirección</FormLabel>
              <Input
                name="direccion_prov"
                defaultValue={selectedProveedor?.direccion_prov || ''}
                placeholder="Ej: Av. Corrientes 1234"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Estado</FormLabel>
              <Select
                name="estado_prov"
                defaultValue={selectedProveedor?.estado_prov || 'Activo'}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} type="submit">
              Guardar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
