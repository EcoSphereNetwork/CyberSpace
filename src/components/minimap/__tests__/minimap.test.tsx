import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import { Minimap } from '../index';

// Mock three.js and @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useThree: () => ({
    scene: {
      children: [],
    },
    camera: {
      position: {
        clone: () => ({
          y: 100,
          copy: jest.fn(),
        }),
      },
    },
  }),
}));

jest.mock('three', () => ({
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
  })),
  OrthographicCamera: jest.fn().mockImplementation(() => ({
    position: {
      set: jest.fn(),
      copy: jest.fn(),
    },
    lookAt: jest.fn(),
  })),
  Vector2: jest.fn(),
  Raycaster: jest.fn().mockImplementation(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn().mockReturnValue([]),
  })),
}));

describe('Minimap', () => {
  const mockProps = {
    width: 200,
    height: 200,
    scale: 0.1,
    position: 'bottom-right' as const,
    onPositionClick: jest.fn(),
  };

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <Minimap {...mockProps} />
      </ThemeProvider>
    );
  });

  it('initializes with correct dimensions', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Minimap {...mockProps} />
      </ThemeProvider>
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
