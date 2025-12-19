import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
  HStack,
  VStack,
  Image,
} from '@chakra-ui/react';
import { DashboardData } from '../types';
import logo from '../assets/logo-recorte.svg';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ReporteDashboardProps {
  data: DashboardData | undefined;
  chartData: any[];
  usuario: any;
  mejoresVendedores: any;
}

export const ReporteDashboard = ({
  data,
  chartData,
  usuario,
  mejoresVendedores,
}: ReporteDashboardProps) => {
  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <Box
      id="reporte-impresion"
      bg="white"
      color="black"
      p={8}
      display="none"
      // Styles are handled in index.css for print media
    >
      {/* Header */}
      <HStack justify="space-between" mb={8} borderBottom="2px solid black" pb={4}>
        <HStack spacing={4}>
          <Image src={logo} h="60px" />
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="black">CETROHOGAR</Heading>
            <Text fontSize="md" color="gray.600">Reporte Ejecutivo</Text>
          </VStack>
        </HStack>
        <VStack align="end" spacing={0}>
          <Text fontWeight="bold">Fecha: {new Date().toLocaleDateString('es-AR')}</Text>
          <Text>Generado por: {usuario?.nombre_usuario}</Text>
        </VStack>
      </HStack>

      {/* Resumen Ejecutivo */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="black">Resumen del Mes</Heading>
        <SimpleGrid columns={4} spacing={4}>
          <Box p={4} border="1px solid #ddd" borderRadius="md">
            <Text fontSize="sm" color="gray.600">Ventas Totales</Text>
            <Text fontSize="2xl" fontWeight="bold">{formatCurrency(data.ventas_mes.total_ventas)}</Text>
            <Text fontSize="xs">{data.ventas_mes.cantidad_ventas} operaciones</Text>
          </Box>
          <Box p={4} border="1px solid #ddd" borderRadius="md">
            <Text fontSize="sm" color="gray.600">Clientes con Deuda</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">{data.clientes_deuda}</Text>
            <Text fontSize="xs">Requieren atención</Text>
          </Box>
          <Box p={4} border="1px solid #ddd" borderRadius="md">
            <Text fontSize="sm" color="gray.600">Stock Crítico</Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.500">{data.productos_stock_bajo}</Text>
            <Text fontSize="xs">Productos bajo mínimo</Text>
          </Box>
          <Box p={4} border="1px solid #ddd" borderRadius="md">
            <Text fontSize="sm" color="gray.600">Usuarios Activos</Text>
            <Text fontSize="2xl" fontWeight="bold">{data.total_usuarios}</Text>
            <Text fontSize="xs">En sistema</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Gráficos */}
      <SimpleGrid columns={2} spacing={8} mb={8}>
        <Box border="1px solid #eee" p={4} borderRadius="md">
          <Heading size="sm" mb={4} textAlign="center" color="black">Evolución de Ventas (7 días)</Heading>
          <Box display="flex" justifyContent="center">
            <LineChart width={300} height={250} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" stroke="#000" fontSize={10} />
              <YAxis stroke="#000" fontSize={10} />
              <Legend />
              <Line
                isAnimationActive={false}
                type="monotone"
                dataKey="Ventas"
                stroke="#000"
                strokeWidth={2}
                dot={{ fill: '#000', r: 4 }}
              />
            </LineChart>
          </Box>
        </Box>

        <Box border="1px solid #eee" p={4} borderRadius="md">
          <Heading size="sm" mb={4} textAlign="center" color="black">Volumen de Operaciones</Heading>
          <Box display="flex" justifyContent="center">
            <BarChart width={300} height={250} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" stroke="#000" fontSize={10} />
              <YAxis stroke="#000" fontSize={10} />
              <Legend />
              <Bar dataKey="Cantidad" fill="#444" isAnimationActive={false} />
            </BarChart>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Tablas de Datos */}
      <SimpleGrid columns={2} spacing={8}>
        <Box>
          <Heading size="sm" mb={4} color="black">Detalle de Ventas Recientes</Heading>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th color="black" borderColor="gray.300">Fecha</Th>
                <Th isNumeric color="black" borderColor="gray.300">Cant.</Th>
                <Th isNumeric color="black" borderColor="gray.300">Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.ventas_ultimos_dias.map((venta, index) => (
                <Tr key={index}>
                  <Td borderColor="gray.200">{formatDate(venta.fecha)}</Td>
                  <Td isNumeric borderColor="gray.200">{venta.cantidad}</Td>
                  <Td isNumeric borderColor="gray.200">{formatCurrency(venta.total)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {mejoresVendedores && (
          <Box>
            <Heading size="sm" mb={4} color="black">Rendimiento de Vendedores</Heading>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th color="black" borderColor="gray.300">Vendedor</Th>
                  <Th isNumeric color="black" borderColor="gray.300">Ventas</Th>
                  <Th isNumeric color="black" borderColor="gray.300">Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mejoresVendedores.slice(0, 5).map((vendedor: any, index: number) => (
                  <Tr key={index}>
                    <Td borderColor="gray.200">{vendedor.nombre_usuario}</Td>
                    <Td isNumeric borderColor="gray.200">{vendedor.cantidad_ventas}</Td>
                    <Td isNumeric borderColor="gray.200">{formatCurrency(vendedor.total_vendido)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </SimpleGrid>

      {/* Footer */}
      <Box mt={12} pt={4} borderTop="1px solid #ddd" textAlign="center">
        <Text fontSize="xs" color="gray.500">
          Documento generado automáticamente por el Sistema de Ventas Cetrohogar.
          Uso interno exclusivo.
        </Text>
      </Box>
    </Box>
  );
};
