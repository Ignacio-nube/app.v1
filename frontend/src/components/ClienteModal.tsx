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
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { ClienteConDeuda, ClienteFormData } from '../types';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit: ClienteConDeuda | null;
}

export const ClienteModal = ({ isOpen, onClose, clienteToEdit }: ClienteModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre_cliente: '',
    apell_cliente: '',
    DNI_cliente: '',
    telefono_cliente: '',
    mail_cliente: '',
    direccion_cliente: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (clienteToEdit) {
        setFormData({
          nombre_cliente: clienteToEdit.nombre_cliente,
          apell_cliente: clienteToEdit.apell_cliente,
          DNI_cliente: clienteToEdit.DNI_cliente,
          telefono_cliente: clienteToEdit.telefono_cliente || '',
          mail_cliente: clienteToEdit.mail_cliente || '',
          direccion_cliente: clienteToEdit.direccion_cliente || '',
        });
      } else {
        setFormData({
          nombre_cliente: '',
          apell_cliente: '',
          DNI_cliente: '',
          telefono_cliente: '',
          mail_cliente: '',
          direccion_cliente: '',
        });
      }
    }
  }, [isOpen, clienteToEdit]);

  const createMutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      const response = await api.post('/clientes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente creado', status: 'success', duration: 3000, isClosable: true });
      onClose();
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
      const response = await api.put(`/clientes/${data.id}`, data.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente actualizado', status: 'success', duration: 3000, isClosable: true });
      onClose();
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

  const handleSubmit = () => {
    if (clienteToEdit) {
      updateMutation.mutate({ id: clienteToEdit.id_cliente, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</ModalHeader>
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
            {clienteToEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
