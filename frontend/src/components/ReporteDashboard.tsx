import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, HStack, VStack, Image } from '@chakra-ui/react';
import { DashboardData } from '../types';
import logo from '../assets/logo-recorte.svg';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface ReporteDashboardProps {
  data: DashboardData | undefined;
  chartData: any[];
  usuario: any;
  mejoresVendedores: any;
  morosos?: any[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });

export const ReporteDashboard = ({ data, chartData, usuario, mejoresVendedores, morosos }: ReporteDashboardProps) => {
  if (!data) return null;

  const printDate = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Box
      id="reporte-impresion"
      bg="white"
      color="black"
      // Posicionado fuera de pantalla para que recharts pueda medir el contenedor
      position="absolute"
      left="-9999px"
      top="0"
      width="750px"
      zIndex={-1}
    >
      {/* ── HEADER ── */}
      <HStack justify="space-between" mb={6} pb={4} borderBottom="3px solid #1a365d">
        <HStack spacing={4}>
          <Image src={logo} h="52px" fallback={<Box w="52px" h="52px" bg="gray.200" borderRadius="md" />} />
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="#1a365d" letterSpacing="tight">MUEBLERÍA CETROHOGAR</Heading>
            <Text fontSize="sm" color="gray.500">Sistema de Gestión — Reporte Ejecutivo</Text>
          </VStack>
        </HStack>
        <VStack align="end" spacing={0}>
          <Text fontWeight="bold" fontSize="sm" color="#1a365d">
            {printDate.charAt(0).toUpperCase() + printDate.slice(1)}
          </Text>
          <Text fontSize="xs" color="gray.500">Generado por: {usuario?.nombre_usuario}</Text>
        </VStack>
      </HStack>

      {/* ── KPIs ── */}
      <Box mb={6}>
        <Heading size="sm" mb={3} color="#1a365d" textTransform="uppercase" letterSpacing="wide" fontSize="xs">
          Resumen del Mes
        </Heading>
        <SimpleGrid columns={4} spacing={3}>
          {[
            { label: 'Ventas del Mes', value: formatCurrency(data.ventas_mes.total_ventas), sub: `${data.ventas_mes.cantidad_ventas} operaciones`, accent: '#2b6cb0' },
            { label: 'Clientes con Deuda', value: String(data.clientes_deuda), sub: 'Cuotas vencidas', accent: '#c53030' },
            { label: 'Stock Crítico', value: String(data.productos_stock_bajo), sub: 'Productos < 10 und.', accent: '#c05621' },
            { label: 'Usuarios', value: String(data.total_usuarios), sub: 'En el sistema', accent: '#276749' },
          ].map((kpi, i) => (
            <Box key={i} p={3} border="1px solid #e2e8f0" borderRadius="md" borderTop={`3px solid ${kpi.accent}`}>
              <Text fontSize="10px" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                {kpi.label}
              </Text>
              <Text fontSize="22px" fontWeight="bold" color={kpi.accent} lineHeight={1.2} mt={1}>
                {kpi.value}
              </Text>
              <Text fontSize="10px" color="gray.400" mt={0.5}>{kpi.sub}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* ── CHARTS ── */}
      <Box mb={6}>
        <Heading size="sm" mb={3} color="#1a365d" textTransform="uppercase" letterSpacing="wide" fontSize="xs">
          Evolución últimos 7 días
        </Heading>
        <SimpleGrid columns={2} spacing={4}>
          <Box border="1px solid #e2e8f0" borderRadius="md" p={3}>
            <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={2} textAlign="center">
              Monto de Ventas
            </Text>
            <AreaChart width={310} height={180} data={chartData}>
              <defs>
                <linearGradient id="printGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a365d" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a365d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="fecha" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={38} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="Ventas"
                stroke="#1a365d"
                strokeWidth={2}
                fill="url(#printGrad)"
                dot={{ fill: '#1a365d', r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </Box>

          <Box border="1px solid #e2e8f0" borderRadius="md" p={3}>
            <Text fontSize="11px" fontWeight="semibold" color="gray.600" mb={2} textAlign="center">
              Cantidad de Operaciones
            </Text>
            <BarChart width={310} height={180} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="fecha" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Bar isAnimationActive={false} dataKey="Cantidad" fill="#2b6cb0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </Box>
        </SimpleGrid>
      </Box>

      {/* ── TABLES ── */}
      <SimpleGrid columns={morosos && morosos.length > 0 && mejoresVendedores ? 3 : 2} spacing={4} mb={6}>
        {/* Ventas recientes */}
        <Box>
          <Heading size="sm" mb={2} fontSize="xs" color="#1a365d" textTransform="uppercase" letterSpacing="wide">
            Ventas Recientes
          </Heading>
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th fontSize="9px" py={1} color="gray.600">Fecha</Th>
                <Th isNumeric fontSize="9px" py={1} color="gray.600">Cant.</Th>
                <Th isNumeric fontSize="9px" py={1} color="gray.600">Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.ventas_ultimos_dias.map((v, i) => (
                <Tr key={i}>
                  <Td fontSize="11px" py={1} borderColor="gray.100">{formatDate(v.fecha)}</Td>
                  <Td isNumeric fontSize="11px" py={1} borderColor="gray.100">{v.cantidad}</Td>
                  <Td isNumeric fontSize="11px" py={1} borderColor="gray.100" fontWeight="medium">
                    {formatCurrency(Number(v.total))}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Mejores vendedores */}
        {mejoresVendedores && mejoresVendedores.length > 0 && (
          <Box>
            <Heading size="sm" mb={2} fontSize="xs" color="#1a365d" textTransform="uppercase" letterSpacing="wide">
              Mejores Vendedores
            </Heading>
            <Table size="sm" variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="9px" py={1} color="gray.600">#</Th>
                  <Th fontSize="9px" py={1} color="gray.600">Vendedor</Th>
                  <Th isNumeric fontSize="9px" py={1} color="gray.600">Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mejoresVendedores.slice(0, 6).map((v: any, i: number) => (
                  <Tr key={i}>
                    <Td fontSize="11px" py={1} borderColor="gray.100" color="gray.400" fontWeight="bold">{i + 1}</Td>
                    <Td fontSize="11px" py={1} borderColor="gray.100">{v.nombre_usuario}</Td>
                    <Td isNumeric fontSize="11px" py={1} borderColor="gray.100" fontWeight="medium">
                      {formatCurrency(v.total_vendido)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Top deudores */}
        {morosos && morosos.length > 0 && (
          <Box>
            <Heading size="sm" mb={2} fontSize="xs" color="#c53030" textTransform="uppercase" letterSpacing="wide">
              Clientes con Deuda
            </Heading>
            <Table size="sm" variant="simple">
              <Thead bg="red.50">
                <Tr>
                  <Th fontSize="9px" py={1} color="red.600">Cliente</Th>
                  <Th isNumeric fontSize="9px" py={1} color="red.600">Deuda</Th>
                </Tr>
              </Thead>
              <Tbody>
                {morosos.slice(0, 6).map((m: any, i: number) => (
                  <Tr key={i}>
                    <Td fontSize="11px" py={1} borderColor="red.50">
                      {m.nombre_cliente} {m.apell_cliente}
                    </Td>
                    <Td isNumeric fontSize="11px" py={1} borderColor="red.50" fontWeight="medium" color="red.600">
                      {formatCurrency(m.monto_total_deuda)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </SimpleGrid>

      {/* ── FOOTER ── */}
      <Box pt={3} borderTop="1px solid #e2e8f0" textAlign="center">
        <Text fontSize="9px" color="gray.400">
          Documento generado automáticamente · Sistema de Ventas Cetrohogar · Uso interno
        </Text>
      </Box>
    </Box>
  );
};
