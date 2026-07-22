import { render, type RenderOptions } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  type MemoryRouterProps,
} from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  path?: string;
  routerProps?: MemoryRouterProps;
}

export function renderWithRouter(
  ui: ReactElement,
  {
    route = '/',
    path = '*',
    routerProps,
    ...options
  }: RenderWithRouterOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]} {...routerProps}>
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
