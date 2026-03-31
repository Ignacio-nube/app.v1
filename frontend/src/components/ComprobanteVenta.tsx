import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Box,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { VentaConDetalles, Cuota } from '../types';

interface ComprobanteVentaProps {
  isOpen: boolean;
  onClose: () => void;
  ventaId: number | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const ComprobanteVenta = ({ isOpen, onClose, ventaId }: ComprobanteVentaProps) => {
  const enabled = isOpen && !!ventaId;

  const { data: venta, isLoading: loadingVenta } = useQuery<VentaConDetalles>({
    queryKey: ['venta', ventaId],
    queryFn: async () => {
      const res = await api.get(`/ventas/${ventaId}`);
      return res.data;
    },
    enabled,
  });

  const { data: cuotas = [], isLoading: loadingCuotas } = useQuery<Cuota[]>({
    queryKey: ['cuotas-venta', ventaId],
    queryFn: async () => {
      const res = await api.get(`/pagos/cuotas/venta/${ventaId}`);
      return res.data;
    },
    enabled,
  });

  const isLoading = loadingVenta || loadingCuotas;

  const cuotasBadgeColor = (estado: string) => {
    if (estado === 'Pagada') return 'green';
    if (estado === 'Vencida') return 'red';
    return 'yellow';
  };

  const handlePrint = () => {
    if (!venta) return;

    const printWindow = window.open('', '', 'height=750,width=900');
    if (!printWindow) return;

    const logoUrl = `${window.location.origin}/logo.svg`;
    const interestRate = venta.porcentaje_interes || 0;
    const subtotal = venta.total_venta;
    const interestAmount = subtotal * (interestRate / 100);
    const total = venta.total_con_interes || subtotal;

    const detallesRows = (venta.detalles || []).map(d => `
      <tr>
        <td>${d.nombre_productos || `Producto #${d.id_productos}`}</td>
        <td style="text-align:center">${d.cantidad}</td>
        <td style="text-align:right">${formatCurrency(d.precio_unitario)}</td>
        <td style="text-align:right">${formatCurrency(d.precio_unitario * d.cantidad)}</td>
      </tr>
    `).join('');

    const cuotasSection = venta.tipo_venta === 'Credito' && cuotas.length > 0
      ? `
        <div class="section-title">CUOTAS</div>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Vencimiento</th>
              <th style="text-align:right">Monto</th>
              <th style="text-align:center">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${cuotas.map(c => `
              <tr>
                <td style="text-align:center">${c.numero_cuota}</td>
                <td>${formatDate(c.fecha_vencimiento)}</td>
                <td style="text-align:right">${formatCurrency(c.monto_cuota)}</td>
                <td style="text-align:center">
                  <span style="
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                    background: ${c.estado_cuota === 'Pagada' ? '#c6f6d5' : c.estado_cuota === 'Vencida' ? '#fed7d7' : '#fefcbf'};
                    color: ${c.estado_cuota === 'Pagada' ? '#276749' : c.estado_cuota === 'Vencida' ? '#9b2c2c' : '#7b6102'};
                  ">${c.estado_cuota}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top:8px;font-size:12px;color:#555;">
          ${cuotas.filter(c => c.estado_cuota === 'Pagada').length} de ${cuotas.length} cuotas pagadas
        </p>
      `
      : `
        <div class="pagado-badge">✓ PAGADO AL CONTADO</div>
      `;

    const html = `
      <html>
      <head>
        <title>Comprobante de Venta #${venta.id_venta}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; font-size: 13px; color: #333; }
          .header { text-align: center; margin-bottom: 16px; }
          .brand-name { font-weight: bold; font-size: 16px; color: #FF6B00; }
          .brand-sub { font-size: 12px; color: #718096; margin-bottom: 4px; }
          h2 { margin: 8px 0 2px; font-size: 18px; }
          .divider { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f7fafc; text-align: left; padding: 6px 8px; font-size: 12px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .totals-row.grand-total { font-weight: bold; font-size: 15px; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 4px; }
          .section-title { font-weight: bold; font-size: 13px; margin: 14px 0 6px; text-transform: uppercase; color: #4a5568; }
          .pagado-badge { display: inline-block; background: #c6f6d5; color: #276749; font-weight: bold; font-size: 16px; padding: 8px 20px; border-radius: 6px; margin: 12px 0; }
          .firma { margin-top: 48px; border-top: 1px solid #ccc; width: 240px; padding-top: 6px; text-align: center; font-size: 12px; color: #777; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #a0aec0; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" style="height:52px;margin-bottom:6px;" onerror="this.style.display='none'">
          <div class="brand-name">CETROHOGAR</div>
          <div class="brand-sub">Mueblería Centro Hogar</div>
          <h2>Comprobante de Venta N° ${venta.id_venta}</h2>
          <div style="color:#718096;font-size:12px;">Fecha: ${formatDate(venta.fecha_venta)}</div>
        </div>

        <hr class="divider">

        <div class="row"><strong>Cliente:</strong> <span>${venta.nombre_cliente || ''} ${venta.apell_cliente || ''}</span></div>
        <div class="row"><strong>DNI:</strong> <span>${venta.DNI_cliente || '-'}</span></div>
        <div class="row"><strong>Tipo de Venta:</strong> <span>${venta.tipo_venta}</span></div>

        <hr class="divider">

        <div class="section-title">DETALLE</div>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center">Cant.</th>
              <th style="text-align:right">Precio Unit.</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${detallesRows}
          </tbody>
        </table>

        <hr class="divider">

        <div class="totals-row"><span>Subtotal:</span> <span>${formatCurrency(subtotal)}</span></div>
        ${interestRate > 0 ? `<div class="totals-row"><span>Interés (${interestRate}%):</span> <span>${formatCurrency(interestAmount)}</span></div>` : ''}
        <div class="totals-row grand-total"><span>TOTAL:</span> <span>${formatCurrency(total)}</span></div>

        <hr class="divider">

        ${cuotasSection}

        <hr class="divider">

        <div class="firma">Firma y aclaración: _______________</div>

        <div class="footer">Gracias por su compra</div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Comprobante de Venta {venta ? `#${venta.id_venta}` : ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <VStack spacing={3} align="stretch">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} h="6" borderRadius="md" />
              ))}
            </VStack>
          ) : venta ? (
            <VStack spacing={4} align="stretch">
              {/* Header */}
              <Box textAlign="center" pb={2}>
                <Heading size="md">Comprobante de Venta #{venta.id_venta}</Heading>
                <Text color="gray.500" fontSize="sm">{formatDate(venta.fecha_venta)}</Text>
              </Box>

              <Divider />

              {/* Cliente */}
              <HStack justify="space-between">
                <Text fontWeight="bold">Cliente:</Text>
                <Text>{venta.nombre_cliente} {venta.apell_cliente}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">DNI:</Text>
                <Text>{venta.DNI_cliente || '-'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">Tipo de Venta:</Text>
                <Badge colorScheme={venta.tipo_venta === 'Contado' ? 'green' : 'blue'}>
                  {venta.tipo_venta}
                </Badge>
              </HStack>

              <Divider />

              {/* Productos */}
              <Text fontWeight="bold" fontSize="sm" color="gray.600" textTransform="uppercase">
                Detalle
              </Text>
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Producto</Th>
                      <Th isNumeric>Cant.</Th>
                      <Th isNumeric>Precio Unit.</Th>
                      <Th isNumeric>Subtotal</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(venta.detalles || []).map(d => (
                      <Tr key={d.id_detalle_venta}>
                        <Td>{d.nombre_productos || `Producto #${d.id_productos}`}</Td>
                        <Td isNumeric>{d.cantidad}</Td>
                        <Td isNumeric>{formatCurrency(d.precio_unitario)}</Td>
                        <Td isNumeric>{formatCurrency(d.precio_unitario * d.cantidad)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Divider />

              {/* Totales */}
              <HStack justify="space-between">
                <Text>Subtotal:</Text>
                <Text>{formatCurrency(venta.total_venta)}</Text>
              </HStack>
              {(venta.porcentaje_interes || 0) > 0 && (
                <HStack justify="space-between">
                  <Text>Interés ({venta.porcentaje_interes}%):</Text>
                  <Text>{formatCurrency(venta.total_venta * ((venta.porcentaje_interes || 0) / 100))}</Text>
                </HStack>
              )}
              <HStack justify="space-between" bg="gray.50" p={2} borderRadius="md">
                <Text fontWeight="bold" fontSize="lg">Total:</Text>
                <Text fontWeight="bold" fontSize="lg" color="green.600">
                  {formatCurrency(venta.total_con_interes || venta.total_venta)}
                </Text>
              </HStack>

              <Divider />

              {/* Pago / Cuotas */}
              {venta.tipo_venta === 'Contado' ? (
                <Box textAlign="center" py={2}>
                  <Badge colorScheme="green" fontSize="md" px={4} py={2}>
                    ✓ PAGADO AL CONTADO
                  </Badge>
                </Box>
              ) : (
                <VStack align="stretch" spacing={2}>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600" textTransform="uppercase">
                    Cuotas
                  </Text>
                  {cuotas.length > 0 ? (
                    <>
                      <Box overflowX="auto">
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>N°</Th>
                              <Th>Vencimiento</Th>
                              <Th isNumeric>Monto</Th>
                              <Th>Estado</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {cuotas.map(c => (
                              <Tr key={c.id_cuota}>
                                <Td>{c.numero_cuota}</Td>
                                <Td>{formatDate(c.fecha_vencimiento)}</Td>
                                <Td isNumeric>{formatCurrency(c.monto_cuota)}</Td>
                                <Td>
                                  <Badge colorScheme={cuotasBadgeColor(c.estado_cuota)}>
                                    {c.estado_cuota}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                      <Text fontSize="sm" color="gray.500">
                        {cuotas.filter(c => c.estado_cuota === 'Pagada').length} de {cuotas.length} cuotas pagadas
                      </Text>
                    </>
                  ) : (
                    <Text color="gray.400" fontSize="sm">No hay cuotas registradas</Text>
                  )}
                </VStack>
              )}
            </VStack>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cerrar
          </Button>
          <Button colorScheme="blue" onClick={handlePrint} isDisabled={!venta || isLoading}>
            Imprimir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
