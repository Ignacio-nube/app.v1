import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Select,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiDownload, FiDatabase, FiClock } from 'react-icons/fi';
import api from '../config/api';

const BACKUP_KEY = 'backupSettings';

const INTERVAL_OPTIONS = [
  { label: 'Desactivado', value: 0 },
  { label: 'Cada 6 horas', value: 6 * 60 * 60 * 1000 },
  { label: 'Cada 12 horas', value: 12 * 60 * 60 * 1000 },
  { label: 'Cada 24 horas', value: 24 * 60 * 60 * 1000 },
  { label: 'Cada 3 días', value: 3 * 24 * 60 * 60 * 1000 },
  { label: 'Cada 7 días', value: 7 * 24 * 60 * 60 * 1000 },
];

const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_KEY) || '{"interval":0,"lastBackup":0}');
  } catch {
    return { interval: 0, lastBackup: 0 };
  }
};

const formatLastBackup = (ts: number): string => {
  if (!ts) return 'Nunca';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Hace menos de un minuto';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
};

export const downloadBackup = async () => {
  const res = await api.get('/backup', { responseType: 'blob' });
  const fecha = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${fecha}.json`;
  a.click();
  URL.revokeObjectURL(url);
  const s = getSettings();
  localStorage.setItem(BACKUP_KEY, JSON.stringify({ ...s, lastBackup: Date.now() }));
};

export const Backups = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(getSettings);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadBackup();
      const updated = getSettings();
      setSettings(updated);
      toast({ title: 'Backup descargado', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Error al generar backup', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntervalChange = (value: number) => {
    const updated = { ...settings, interval: value };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(updated));
    setSettings(updated);
    toast({
      title: value === 0 ? 'Backup automático desactivado' : 'Backup automático configurado',
      description: value > 0 ? INTERVAL_OPTIONS.find(o => o.value === value)?.label : undefined,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Backups del Sistema</Heading>

      {/* Manual backup */}
      <Box bg={bg} p={6} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
        <HStack mb={4} spacing={3}>
          <Icon as={FiDatabase} color="blue.500" boxSize={5} />
          <Heading size="md">Backup Manual</Heading>
        </HStack>
        <Text color="gray.500" mb={4} fontSize="sm">
          Descarga un archivo JSON con todos los datos del sistema: clientes, productos, ventas,
          cuotas, pagos, proveedores y usuarios.
        </Text>
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={FiClock} color="gray.400" boxSize={4} />
            <Text fontSize="sm" color="gray.500">
              Último backup: <strong>{formatLastBackup(settings.lastBackup)}</strong>
            </Text>
          </HStack>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            onClick={handleDownload}
            isLoading={isLoading}
            loadingText="Generando..."
          >
            Descargar Backup Ahora
          </Button>
        </HStack>
      </Box>

      <Divider />

      {/* Auto backup */}
      <Box bg={bg} p={6} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={border}>
        <HStack mb={4} spacing={3}>
          <Icon as={FiClock} color="green.500" boxSize={5} />
          <Heading size="md">Backup Automático</Heading>
          <Badge colorScheme={settings.interval > 0 ? 'green' : 'gray'}>
            {settings.interval > 0 ? 'Activo' : 'Inactivo'}
          </Badge>
        </HStack>
        <Text color="gray.500" mb={4} fontSize="sm">
          Cuando el admin está conectado, el sistema descarga automáticamente un backup al cumplirse
          el intervalo configurado.
        </Text>
        <HStack spacing={4} align="center">
          <Text fontSize="sm" fontWeight="medium" flexShrink={0}>Intervalo:</Text>
          <Select
            value={settings.interval}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            maxW="220px"
            bg={bg}
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </HStack>
        {settings.interval > 0 && settings.lastBackup > 0 && (
          <Text fontSize="xs" color="gray.400" mt={3}>
            Próximo backup automático en aproximadamente{' '}
            {formatLastBackup(settings.lastBackup + settings.interval - Date.now() * 2).replace('Hace ', '')}
          </Text>
        )}
      </Box>

      <Box bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="lg">
        <Text fontSize="xs" color={useColorModeValue('blue.700', 'blue.200')}>
          Los backups incluyen todos los datos operativos pero <strong>no incluyen contraseñas</strong> por
          seguridad. Los archivos se descargan directamente a tu computadora.
        </Text>
      </Box>
    </VStack>
  );
};
