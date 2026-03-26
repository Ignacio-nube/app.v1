import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Heading,
  VStack,
  HStack,
  Stack,
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
  Divider,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  FiDollarSign,
  FiUsers,
  FiAlertCircle,
  FiUserCheck,
  FiPrinter,
  FiTrendingDown,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
}

const StatCard = ({ title, value, icon, colorScheme, helpText }: StatCardProps) => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      bg={bg}
      p={5}
      borderRadius="xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={border}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={3}
        right={3}
        bg={`${colorScheme}.50`}
        borderRadius="lg"
        p={2}
      >
        <Icon as={icon} boxSize={5} color={`${colorScheme}.500`} />
      </Box>
      <Stat>
        <StatLabel fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase" letterSpacing="wide">
          {title}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" mt={1} color={useColorModeValue('gray.800', 'white')}>
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText mb={0} fontSize="xs" color="gray.500">
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });

export const Dashboard = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const tooltipBg = useColorModeValue('white', '#1A202C');
  const gridColor = useColorModeValue('#e2e8f0', '#2d3748');
  const { usuario } = useAuth();
  const [tipoVenta, setTipoVenta] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', tipoVenta, usuarioFiltro],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tipoVenta) params.append('tipo_venta', tipoVenta);
      if (usuarioFiltro) params.append('id_usuario', usuarioFiltro);
      const response = await api.get(`/reportes/dashboard?${params}`);
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: mejoresVendedores } = useQuery({
    queryKey: ['mejores-vendedores'],
    queryFn: () => api.get('/reportes/mejores-vendedores').then(r => r.data),
    enabled: usuario?.rol === 'Administrador',
  });

  const { data: morosos } = useQuery({
    queryKey: ['morosos-dashboard'],
    queryFn: () => api.get('/reportes/morosos').then(r => r.data),
  });

  const { data: usuarios } = useQuery<Usuario[]>({
    queryKey: ['usuarios-filtro'],
    queryFn: async () => {
      const response = await api.get('/usuarios');
      return response.data.data || response.data;
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

  const chartData = dashboardData?.ventas_ultimos_dias.map((v) => ({
    fecha: formatDate(v.fecha),
    Ventas: Number(v.total),
    Cantidad: Number(v.cantidad),
  })) ?? [];

  const topMorosos = (morosos ?? []).slice(0, 5);

  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '13px',
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Print component */}
      <ReporteDashboard
        data={dashboardData}
        chartData={chartData}
        usuario={usuario}
        mejoresVendedores={mejoresVendedores}
        morosos={topMorosos}
      />

      {/* Header */}
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        spacing={4}
        className="no-print"
      >
        <Heading size="lg">Panel de Control</Heading>
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
          <Button
            leftIcon={<FiPrinter />}
            onClick={() => window.print()}
            colorScheme="blue"
            variant="outline"
            size="sm"
          >
            Imprimir Reporte
          </Button>
          {usuario?.rol === 'Administrador' && (
            <Select
              size="sm"
              w={{ base: 'full', sm: '180px' }}
              placeholder="Todos los usuarios"
              value={usuarioFiltro}
              onChange={(e) => setUsuarioFiltro(e.target.value)}
              bg={bg}
              borderRadius="lg"
            >
              {usuarios?.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_usuario}
                </option>
              ))}
            </Select>
          )}
          <Select
            size="sm"
            w={{ base: 'full', sm: '160px' }}
            value={tipoVenta}
            onChange={(e) => setTipoVenta(e.target.value)}
            bg={bg}
            borderRadius="lg"
          >
            <option value="">Todas las Ventas</option>
            <option value="Contado">Contado</option>
            <option value="Credito">Crédito</option>
          </Select>
        </Stack>
      </Stack>

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} className="no-print">
        <StatCard
          title="Ventas del Mes"
          value={formatCurrency(dashboardData?.ventas_mes.total_ventas ?? 0)}
          icon={FiDollarSign}
          colorScheme="brand"
          helpText={`${dashboardData?.ventas_mes.cantidad_ventas ?? 0} operaciones`}
        />
        <StatCard
          title="Clientes con Deuda"
          value={dashboardData?.clientes_deuda ?? 0}
          icon={FiUsers}
          colorScheme="red"
          helpText="Cuotas vencidas"
        />
        <StatCard
          title="Stock Crítico"
          value={dashboardData?.productos_stock_bajo ?? 0}
          icon={FiAlertCircle}
          colorScheme="orange"
          helpText="Productos < 10 und."
        />
        <StatCard
          title="Usuarios"
          value={dashboardData?.total_usuarios ?? 0}
          icon={FiUserCheck}
          colorScheme="green"
          helpText="En el sistema"
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} className="no-print">
        <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
          <Heading size="sm" mb={4} color="gray.600">Ventas — Últimos 7 días</Heading>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="Ventas"
                stroke="#FF6B00"
                strokeWidth={2.5}
                fill="url(#gradVentas)"
                dot={{ fill: '#FF6B00', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
          <Heading size="sm" mb={4} color="gray.600">Cantidad de Operaciones</Heading>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                formatter={(value: number) => [value, 'Ventas']}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="Cantidad" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={index === chartData.length - 1 ? '#FF6B00' : '#003087'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Bottom row: morosos + vendedores + cuotas hoy */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} className="no-print">

        {/* Top Deudores */}
        <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
          <HStack mb={4} spacing={2}>
            <Icon as={FiTrendingDown} color="red.400" />
            <Heading size="sm" color="gray.600">Top Clientes Deudores</Heading>
          </HStack>
          {topMorosos.length === 0 ? (
            <Center py={6}>
              <Text fontSize="sm" color="gray.400">Sin deudas vencidas</Text>
            </Center>
          ) : (
            <VStack spacing={2} align="stretch">
              {topMorosos.map((m: any, i: number) => (
                <HStack key={i} justify="space-between" py={1}>
                  <HStack spacing={2} minW={0}>
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="red.400"
                      w={5}
                      flexShrink={0}
                    >
                      #{i + 1}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {m.nombre_cliente} {m.apell_cliente}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold" color="red.500" flexShrink={0}>
                    {formatCurrency(m.monto_total_deuda)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>

        {/* Mejores Vendedores */}
        {usuario?.rol === 'Administrador' && (
          <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
            <Heading size="sm" mb={4} color="gray.600">Mejores Vendedores</Heading>
            {!mejoresVendedores || mejoresVendedores.length === 0 ? (
              <Center py={6}>
                <Text fontSize="sm" color="gray.400">Sin datos</Text>
              </Center>
            ) : (
              <VStack spacing={2} align="stretch">
                {mejoresVendedores.slice(0, 5).map((v: any, i: number) => (
                  <HStack key={i} justify="space-between">
                    <HStack spacing={2}>
                      <Box
                        bg={i === 0 ? 'yellow.100' : 'gray.100'}
                        borderRadius="full"
                        w={6}
                        h={6}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontSize="xs" fontWeight="bold" color={i === 0 ? 'yellow.700' : 'gray.600'}>
                          {i + 1}
                        </Text>
                      </Box>
                      <Text fontSize="sm" fontWeight="medium">{v.nombre_usuario}</Text>
                    </HStack>
                    <VStack spacing={0} align="end">
                      <Text fontSize="sm" fontWeight="bold">{formatCurrency(v.total_vendido)}</Text>
                      <Text fontSize="xs" color="gray.400">{v.cantidad_ventas} ventas</Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* Cuotas hoy */}
        <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
          <HStack mb={4} justify="space-between">
            <Heading size="sm" color="gray.600">Cuotas que Vencen Hoy</Heading>
            {dashboardData?.cuotas_hoy && dashboardData.cuotas_hoy.length > 0 && (
              <Badge colorScheme="orange" borderRadius="full" px={2}>
                {dashboardData.cuotas_hoy.length}
              </Badge>
            )}
          </HStack>
          {!dashboardData?.cuotas_hoy || dashboardData.cuotas_hoy.length === 0 ? (
            <Center py={6}>
              <Text fontSize="sm" color="gray.400">No hay cuotas hoy</Text>
            </Center>
          ) : (
            <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
              {dashboardData.cuotas_hoy.map((c) => (
                <HStack key={c.id_cuota} justify="space-between" py={1}>
                  <VStack spacing={0} align="start" minW={0}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {(c as any).nombre_cliente} {(c as any).apell_cliente}
                    </Text>
                    <Text fontSize="xs" color="gray.400">Cuota {c.numero_cuota} — #{c.id_venta}</Text>
                  </VStack>
                  <VStack spacing={0} align="end" flexShrink={0}>
                    <Text fontSize="sm" fontWeight="bold">{formatCurrency(c.monto_cuota)}</Text>
                    <Badge
                      fontSize="10px"
                      colorScheme={
                        c.estado_cuota === 'Pagada' ? 'green' :
                        c.estado_cuota === 'Vencida' ? 'red' : 'yellow'
                      }
                    >
                      {c.estado_cuota}
                    </Badge>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>

      {/* Cuotas hoy full table — solo si hay muchas */}
      {dashboardData?.cuotas_hoy && dashboardData.cuotas_hoy.length > 5 && (
        <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border} className="no-print">
          <Heading size="sm" mb={4} color="gray.600">Todas las Cuotas de Hoy</Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Cliente</Th>
                  <Th>Venta</Th>
                  <Th>Cuota</Th>
                  <Th isNumeric>Monto</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData.cuotas_hoy.map((c) => (
                  <Tr key={c.id_cuota}>
                    <Td fontWeight="medium">
                      {(c as any).nombre_cliente} {(c as any).apell_cliente}
                    </Td>
                    <Td>#{c.id_venta}</Td>
                    <Td>Cuota {c.numero_cuota}</Td>
                    <Td isNumeric fontWeight="bold">{formatCurrency(c.monto_cuota)}</Td>
                    <Td>
                      <Badge colorScheme={c.estado_cuota === 'Pagada' ? 'green' : c.estado_cuota === 'Vencida' ? 'red' : 'yellow'}>
                        {c.estado_cuota}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      <Divider className="no-print" />
      <Text fontSize="xs" color="gray.400" textAlign="center" className="no-print">
        Actualización automática cada 60 segundos
      </Text>
    </VStack>
  );
};
