import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { Cuota, TipoPago } from '../types';

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuota: Cuota | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPaymentSuccess: (data: any) => void;
}

export const RegistrarPagoModal = ({ isOpen, onClose, cuota, onPaymentSuccess }: RegistrarPagoModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState<number>(1);

  const { data: tiposPago } = useQuery<TipoPago[]>({
    queryKey: ['tipos-pago'],
    queryFn: async () => {
      const res = await api.get('/api/pagos/tipos');
      return res.data;
    },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

  const registrarPagoMutation = useMutation({
    mutationFn: async (cuotaToPay: Cuota) => {
      const pagoData = {
        id_venta: cuotaToPay.id_venta,
        id_tipo_pago: tipoPagoSeleccionado,
        monto: cuotaToPay.monto_cuota,
        cuotas_a_pagar: [cuotaToPay.id_cuota],
      };
      const res = await api.post('/api/pagos', pagoData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cuotas'] });
      queryClient.invalidateQueries({ queryKey: ['historial-pagos'] });
      toast({
        title: 'Pago registrado',
        description: 'La cuota ha sido marcada como pagada',
        status: 'success',
        duration: 3000,
      });
      
      onPaymentSuccess(data);
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        title: 'Error al registrar pago',
        description: error.response?.data?.error || 'Error desconocido',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleConfirmarPago = () => {
    if (cuota) {
      registrarPagoMutation.mutate(cuota);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Registrar Pago</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {cuota && (
            <VStack spacing={4} align="stretch">
              <Text>
                <strong>Cliente:</strong> {cuota.nombre_cliente} {cuota.apell_cliente}
              </Text>
              <Text>
                <strong>Venta:</strong> #{cuota.id_venta}
              </Text>
              <Text>
                <strong>Cuota N°:</strong> {cuota.numero_cuota}
              </Text>
              <Text>
                <strong>Monto:</strong> {formatCurrency(cuota.monto_cuota)}
              </Text>
              <FormControl>
                <FormLabel>Método de Pago</FormLabel>
                <Select
                  value={tipoPagoSeleccionado}
                  onChange={(e) => setTipoPagoSeleccionado(Number(e.target.value))}
                >
                  {tiposPago?.map((tipo) => (
                    <option key={tipo.id_tipo_pago} value={tipo.id_tipo_pago}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            onClick={handleConfirmarPago}
            isLoading={registrarPagoMutation.isPending}
          >
            Confirmar Pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
