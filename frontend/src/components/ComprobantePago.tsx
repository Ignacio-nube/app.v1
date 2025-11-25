import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Heading,
  Divider,
  Box,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useRef } from 'react';

interface ComprobantePagoProps {
  isOpen: boolean;
  onClose: () => void;
  pago: {
    id_pago: number;
    fecha_pago: string;
    monto: number;
    cliente: string;
    dni: string;
    concepto: string;
    metodo_pago: string;
  } | null;
}

export const ComprobantePago = ({ isOpen, onClose, pago }: ComprobantePagoProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Comprobante de Pago</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
          .divider { border-bottom: 1px solid #eee; margin: 10px 0; }
        `);
        printWindow.document.write('</style></head><body>');
        
        // Construct HTML manually for better control in print window
        const htmlContent = `
          <div class="header">
            <h2>Comprobante de Pago</h2>
            <p>#${pago?.id_pago}</p>
          </div>
          <div class="divider"></div>
          <div class="row">
            <strong>Fecha:</strong>
            <span>${new Date(pago?.fecha_pago || '').toLocaleString()}</span>
          </div>
          <div class="row">
            <strong>Cliente:</strong>
            <span>${pago?.cliente}</span>
          </div>
          <div class="row">
            <strong>DNI:</strong>
            <span>${pago?.dni}</span>
          </div>
          <div class="divider"></div>
          <div class="row">
            <strong>Concepto:</strong>
            <span>${pago?.concepto}</span>
          </div>
          <div class="row">
            <strong>Método de Pago:</strong>
            <span>${pago?.metodo_pago}</span>
          </div>
          <div class="total row">
            <span>Total Pagado:</span>
            <span>${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pago?.monto || 0)}</span>
          </div>
          <div style="margin-top: 40px; text-align: center; font-size: 0.8em; color: #666;">
            <p>Gracias por su pago</p>
          </div>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  if (!pago) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Comprobante de Pago</ModalHeader>
        <ModalBody>
          <div ref={printRef}>
            <VStack spacing={4} align="stretch" p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
              <Box textAlign="center" mb={4}>
                <Icon as={CheckCircleIcon} w={12} h={12} color="green.500" mb={2} />
                <Heading size="md">Pago Exitoso</Heading>
                <Text color="gray.500">#{pago.id_pago}</Text>
              </Box>
              
              <Divider />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Fecha:</Text>
                <Text>{new Date(pago.fecha_pago).toLocaleString()}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Cliente:</Text>
                <Text>{pago.cliente}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">DNI:</Text>
                <Text>{pago.dni}</Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Concepto:</Text>
                <Text>{pago.concepto}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Método de Pago:</Text>
                <Text>{pago.metodo_pago}</Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between" bg="gray.50" p={2} borderRadius="md">
                <Text fontWeight="bold" fontSize="lg">Total Pagado:</Text>
                <Text fontWeight="bold" fontSize="lg" color="green.600">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pago.monto)}
                </Text>
              </HStack>
            </VStack>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button colorScheme="blue" onClick={handlePrint}>
            Imprimir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
