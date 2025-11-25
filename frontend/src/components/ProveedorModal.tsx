import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { Proveedor } from '../pages/Proveedores';

interface ProveedorFormData {
  nombre_prov: string;
  contacto_prov: string;
  direccion_prov: string;
  estado_prov: 'Activo' | 'Inactivo';
}

interface ProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorToEdit: Proveedor | null;
}

export const ProveedorModal = ({ isOpen, onClose, proveedorToEdit }: ProveedorModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre_prov: '',
    contacto_prov: '',
    direccion_prov: '',
    estado_prov: 'Activo',
  });

  useEffect(() => {
    if (isOpen) {
      if (proveedorToEdit) {
        setFormData({
          nombre_prov: proveedorToEdit.nombre_prov,
          contacto_prov: proveedorToEdit.contacto_prov || '',
          direccion_prov: proveedorToEdit.direccion_prov || '',
          estado_prov: proveedorToEdit.estado_prov,
        });
      } else {
        setFormData({
          nombre_prov: '',
          contacto_prov: '',
          direccion_prov: '',
          estado_prov: 'Activo',
        });
      }
    }
  }, [isOpen, proveedorToEdit]);

  const createMutation = useMutation({
    mutationFn: async (data: ProveedorFormData) => {
      const response = await api.post('/api/proveedores', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast({ title: 'Proveedor creado', status: 'success', duration: 3000, isClosable: true });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje || 'Error al crear proveedor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: ProveedorFormData }) => {
      const response = await api.put(`/api/proveedores/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast({ title: 'Proveedor actualizado', status: 'success', duration: 3000, isClosable: true });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.mensaje || 'Error al actualizar proveedor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = () => {
    if (proveedorToEdit) {
      updateMutation.mutate({ id: proveedorToEdit.id_proveedor, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{proveedorToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={formData.nombre_prov}
                onChange={(e) => setFormData({ ...formData, nombre_prov: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Contacto (Email/Teléfono)</FormLabel>
              <Input
                value={formData.contacto_prov}
                onChange={(e) => setFormData({ ...formData, contacto_prov: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Dirección</FormLabel>
              <Input
                value={formData.direccion_prov}
                onChange={(e) => setFormData({ ...formData, direccion_prov: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Estado</FormLabel>
              <Select
                value={formData.estado_prov}
                onChange={(e) => setFormData({ ...formData, estado_prov: e.target.value as 'Activo' | 'Inactivo' })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Select>
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
            isDisabled={!formData.nombre_prov}
          >
            {proveedorToEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
