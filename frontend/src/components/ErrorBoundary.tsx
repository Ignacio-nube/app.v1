import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, Code, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={8} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200" my={4}>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="red.600">Algo salió mal.</Heading>
            <Text color="red.700">
              Ha ocurrido un error al renderizar este componente.
            </Text>
            {this.state.error && (
              <Box w="full" overflowX="auto" bg="white" p={4} borderRadius="md" border="1px solid" borderColor="red.100">
                <Code display="block" whiteSpace="pre-wrap" colorScheme="red" bg="transparent">
                  {this.state.error.toString()}
                </Code>
              </Box>
            )}
            <Button 
              colorScheme="red" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
