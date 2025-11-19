import { HStack, Button, Text, Select, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination = ({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationProps) => {
  return (
    <HStack justify="space-between" p={4} borderTopWidth="1px" borderColor="gray.200">
      <HStack>
        <Text fontSize="sm" color="gray.500">
          Filas por página:
        </Text>
        <Select
          size="sm"
          w="70px"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </Select>
        <Text fontSize="sm" color="gray.500" ml={2}>
          Total: {total}
        </Text>
      </HStack>

      <HStack>
        <Button
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          isDisabled={page === 1}
          leftIcon={<ChevronLeftIcon />}
        >
          Anterior
        </Button>
        <Text fontSize="sm" fontWeight="medium">
          Página {page} de {totalPages || 1}
        </Text>
        <Button
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages || 1, page + 1))}
          isDisabled={page >= (totalPages || 1)}
          rightIcon={<ChevronRightIcon />}
        >
          Siguiente
        </Button>
      </HStack>
    </HStack>
  );
};
