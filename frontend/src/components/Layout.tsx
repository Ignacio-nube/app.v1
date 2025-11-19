import {
  Box,
  Flex,
  IconButton,
  HStack,
  VStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HamburgerIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: string;
}

const NavItem = ({ icon: Icon, label, to, badge }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Button
      as={NavLink}
      to={to}
      leftIcon={<Icon />}
      justifyContent="flex-start"
      variant="ghost"
      w="full"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : 'inherit'}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      fontWeight={isActive ? 'bold' : 'medium'}
      rightIcon={
        badge ? (
          <Badge ml="auto" colorScheme="red" borderRadius="full">
            {badge}
          </Badge>
        ) : undefined
      }
    >
      {label}
    </Button>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  const { usuario, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { icon: FiHome, label: 'Dashboard', to: '/dashboard', roles: ['Administrador', 'Vendedor', 'Encargado de Stock'] },
    { icon: FiUsers, label: 'Clientes', to: '/clientes', roles: ['Administrador', 'Vendedor'] },
    { icon: FiPackage, label: 'Productos', to: '/productos', roles: ['Administrador', 'Vendedor', 'Encargado de Stock'] },
    { icon: FiShoppingCart, label: 'Ventas', to: '/ventas', roles: ['Administrador', 'Vendedor'] },
    { icon: FiDollarSign, label: 'Pagos', to: '/pagos', roles: ['Administrador', 'Vendedor'] },
    { icon: FiBarChart2, label: 'Reportes', to: '/reportes', roles: ['Administrador'] },
    { icon: FiSettings, label: 'Usuarios', to: '/usuarios', roles: ['Administrador'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    usuario ? item.roles.includes(usuario.rol) : false
  );

  const SidebarContent = () => (
    <VStack spacing={6} align="stretch" h="full">
      <Box px={4} py={6}>
        <HStack spacing={3}>
          <Box
            bg="brand.500"
            borderRadius="lg"
            p={2}
            color="white"
            fontSize="xl"
            fontWeight="bold"
          >
            CH
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold">
              CETROHOGAR
            </Text>
            <Text fontSize="xs" color="gray.500">
              Sistema de Ventas
            </Text>
          </VStack>
        </HStack>
      </Box>

      <VStack spacing={1} align="stretch" px={3} flex={1}>
        {filteredNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </VStack>

      <Box px={4} pb={4}>
        <Box
          p={3}
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderRadius="lg"
        >
          <Text fontSize="xs" color="gray.500" mb={1}>
            Sesión activa
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {usuario?.nombre_usuario}
          </Text>
          <Badge mt={1} colorScheme="brand" fontSize="xs">
            {usuario?.rol}
          </Badge>
        </Box>
      </Box>
    </VStack>
  );

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar Desktop */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="260px"
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        overflowY="auto"
      >
        <SidebarContent />
      </Box>

      {/* Sidebar Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg}>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Flex flex={1} direction="column" overflow="hidden">
        {/* Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={6}
          py={4}
          bg={sidebarBg}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <HStack spacing={4}>
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Abrir menú"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
            />
            <Text fontSize="2xl" fontWeight="bold" display={{ base: 'none', sm: 'block' }}>
              {navItems.find((item) => item.to === useLocation().pathname)?.label || 'Dashboard'}
            </Text>
          </HStack>

          <HStack spacing={4}>
            <IconButton
              aria-label="Cambiar tema"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
              >
                <HStack spacing={2}>
                  <Avatar size="sm" name={usuario?.nombre_usuario} bg="brand.500" />
                  <VStack display={{ base: 'none', md: 'flex' }} align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {usuario?.nombre_usuario}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {usuario?.rol}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Mi Perfil</MenuItem>
                <MenuItem>Configuración</MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout} color="red.500">
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box flex={1} overflow="auto" bg={useColorModeValue('gray.50', 'gray.900')} p={6}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};
