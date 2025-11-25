import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Heading,
  VStack,
  HStack,
  Icon,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Center,
  Select,
  Button,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FiDollarSign, FiUsers, FiAlertCircle, FiUserCheck, FiPrinter } from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../config/api';
import { DashboardData, Usuario } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { ReporteDashboard } from '../components/ReporteDashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorScheme: string;
  helpText?: string;
  increase?: number;
}

const StatCard = ({ title, value, icon, colorScheme, helpText, increase }: StatCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      className="print-card no-print"
    >
      <Stat>
        <HStack justify="space-between" mb={2}>
          <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">
            {title}
          </StatLabel>
          <Icon as={icon} boxSize={5} color={`${colorScheme}.500`} />
        </HStack>
        <StatNumber fontSize="3xl" fontWeight="bold" color={`${colorScheme}.500`}>
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText mb={0}>
            {increase !== undefined && (
              <StatArrow type={increase >= 0 ? 'increase' : 'decrease'} />
            )}
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

export const Dashboard = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const { usuario } = useAuth();
  const [tipoVenta, setTipoVenta] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', tipoVenta, usuarioFiltro],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tipoVenta) params.append('tipo_venta', tipoVenta);
      if (usuarioFiltro) params.append('id_usuario', usuarioFiltro);
      
      const response = await api.get(`/api/reportes/dashboard?${params}`);
      return response.data;
    },
    refetchInterval: 60000, // Refrescar cada minuto
  });

  const { data: mejoresVendedores } = useQuery({
    queryKey: ['mejores-vendedores'],
    queryFn: async () => {
      const response = await api.get('/api/reportes/mejores-vendedores');
      return response.data;
    },
    enabled: usuario?.rol === 'Administrador',
  });

  const { data: usuarios } = useQuery<Usuario[]>({
    queryKey: ['usuarios-filtro'],
    queryFn: async () => {
      const response = await api.get('/api/usuarios');
      return response.data.data || response.data; // Handle both paginated and non-paginated responses if necessary
    },
    enabled: usuario?.rol === 'Administrador',
  });

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

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

  const chartData = dashboardData?.ventas_ultimos_dias.map((venta) => ({
    fecha: formatDate(venta.fecha),
    Ventas: venta.total,
    Cantidad: venta.cantidad,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Componente de Reporte para Impresión */}
      <ReporteDashboard 
        data={dashboardData} 
        chartData={chartData || []} 
        usuario={usuario} 
        mejoresVendedores={mejoresVendedores} 
      />

      <HStack justify="space-between" wrap="wrap" spacing={4}>
        <Heading size="lg" className="no-print">Panel de Control</Heading>
        <HStack className="no-print">
          <Button leftIcon={<FiPrinter />} onClick={handlePrint} colorScheme="blue" variant="outline">
            Imprimir Reporte
          </Button>
          {usuario?.rol === 'Administrador' && (
            <Select
              w="200px"
              placeholder="Todos los usuarios"
              value={usuarioFiltro}
              onChange={(e) => setUsuarioFiltro(e.target.value)}
              bg={bgColor}
            >
              {usuarios?.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_usuario}
                </option>
              ))}
            </Select>
          )}
          <Select
            w="200px"
            value={tipoVenta}
            onChange={(e) => setTipoVenta(e.target.value)}
            bg={bgColor}
          >
            <option value="">Todas las Ventas</option>
            <option value="Contado">Contado</option>
            <option value="Credito">Crédito</option>
          </Select>
        </HStack>
      </HStack>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} className="stats-grid no-print">
        <StatCard
          title="Ventas del Mes"
          value={formatCurrency(dashboardData?.ventas_mes.total_ventas || 0)}
          icon={FiDollarSign}
          colorScheme="brand"
          helpText={`${dashboardData?.ventas_mes.cantidad_ventas || 0} ventas`}
        />
        <StatCard
          title="Clientes con Deuda"
          value={dashboardData?.clientes_deuda || 0}
          icon={FiUsers}
          colorScheme="red"
          helpText="Requieren seguimiento"
        />
        <StatCard
          title="Stock Bajo"
          value={dashboardData?.productos_stock_bajo || 0}
          icon={FiAlertCircle}
          colorScheme="yellow"
          helpText="Productos < 10 unidades"
        />
        <StatCard
          title="Usuarios Activos"
          value={dashboardData?.total_usuarios || 0}
          icon={FiUserCheck}
          colorScheme="green"
          helpText="En el sistema"
        />
      </SimpleGrid>

      {/* Gráficos */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} className="charts-grid no-print">
        {/* Gráfico de Ventas */}
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" className="print-chart">
          <Heading size="md" mb={4}>
            Ventas Últimos 7 Días
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: useColorModeValue('white', '#1A202C'),
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Ventas"
                stroke="#FF6B00"
                strokeWidth={3}
                dot={{ fill: '#FF6B00', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Gráfico de Cantidad de Ventas */}
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" className="print-chart">
          <Heading size="md" mb={4}>
            Cantidad de Ventas
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: useColorModeValue('white', '#1A202C'),
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="Cantidad" fill="#003087" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Mejores Vendedores (Solo Admin) */}
      {usuario?.rol === 'Administrador' && mejoresVendedores && (
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" className="print-chart no-print">
          <Heading size="md" mb={4}>
            Mejores Vendedores
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Vendedor</Th>
                <Th isNumeric>Total Ventas</Th>
                <Th isNumeric>Cantidad</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mejoresVendedores.map((vendedor: any, index: number) => (
                <Tr key={index}>
                  <Td fontWeight="medium">{vendedor.nombre_usuario}</Td>
                  <Td isNumeric>{formatCurrency(vendedor.total_vendido)}</Td>
                  <Td isNumeric>{vendedor.cantidad_ventas}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Cuotas Vencen Hoy */}
      {dashboardData?.cuotas_hoy && dashboardData.cuotas_hoy.length > 0 && (
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" className="no-print">
          <Heading size="md" mb={4}>
            Cuotas que Vencen Hoy
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Venta</Th>
                <Th>Cuota</Th>
                <Th isNumeric>Monto</Th>
                <Th>Estado</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dashboardData.cuotas_hoy.map((cuota) => (
                <Tr key={cuota.id_cuota}>
                  <Td>#{cuota.id_venta}</Td>
                  <Td>Cuota {cuota.numero_cuota}</Td>
                  <Td isNumeric fontWeight="bold">
                    {formatCurrency(cuota.monto_cuota)}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        cuota.estado_cuota === 'Pagada'
                          ? 'green'
                          : cuota.estado_cuota === 'Vencida'
                          ? 'red'
                          : 'yellow'
                      }
                    >
                      {cuota.estado_cuota}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {(!dashboardData?.cuotas_hoy || dashboardData.cuotas_hoy.length === 0) && (
        <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="sm" textAlign="center" className="no-print">
          <Text color="gray.500">No hay cuotas que venzan hoy</Text>
        </Box>
      )}
    </VStack>
  );
};
