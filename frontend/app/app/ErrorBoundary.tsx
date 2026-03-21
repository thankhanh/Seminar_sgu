import React from 'react';
import { Text } from 'react-native';

export default class ErrorBoundary extends React.Component<any, any> {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <Text>{String(this.state.error)}</Text>;
    }
    return this.props.children;
  }
}

