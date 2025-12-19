import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { SidebarProvider, useSidebar } from './SidebarContext';

const TestComponent = () => {
  const { isOpen, toggle, close, open } = useSidebar();
  return (
    <div>
      <div data-testid="state">{isOpen ? 'open' : 'closed'}</div>
      <button data-testid="toggle" onClick={toggle}>Toggle</button>
      <button data-testid="close" onClick={close}>Close</button>
      <button data-testid="open" onClick={open}>Open</button>
    </div>
  );
};

describe('SidebarContext provider', () => {
  it('provides initial state as closed', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });

  it('toggles open/closed state', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    const toggleBtn = screen.getByTestId('toggle');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('open');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });

  it('open() sets state to true', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    const openBtn = screen.getByTestId('open');
    fireEvent.click(openBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('open');
  });

  it('close() sets state to false', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    );
    const openBtn = screen.getByTestId('open');
    const closeBtn = screen.getByTestId('close');
    fireEvent.click(openBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('open');
    fireEvent.click(closeBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });

  it('throws an error when useSidebar is used outside of SidebarProvider', () => {
    const errorRender = () =>
      render(
        <div>
          <TestComponent />
        </div>
      );
    expect(errorRender).toThrow(
      /useSidebar must be used within a SidebarProvider component/
    );
  });
});
