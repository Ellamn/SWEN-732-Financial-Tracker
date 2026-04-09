/**
 * Savings.test.jsx
 * 
 * Unit tests for the Savings Plan page component.
 * The Savings page lets users project future savings based on
 * monthly contributions and interest rates. It also shows
 * historical savings rollover from logged transactions.
 * 
 * Testing framework: Vitest with React Testing Library
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Savings from '../pages/Savings';

/**
 * Mock the UserContext to provide a fake logged-in user.
 */
vi.mock('../context/UserContext', () => ({
  useUser: () => ({
    userId: 'test-user-id',
    username: 'tenzin',
    logout: vi.fn(),
  }),
}));

/**
 * Mock the API module. Returns empty transactions array.
 */
vi.mock('../api', () => ({
  getBalancesByOwner: vi.fn().mockResolvedValue([]),
}));

describe('Savings', () => {

  /**
   * Verifies that the Savings Plan heading is rendered.
   */
  it('renders the Savings Plan heading', () => {
    render(<Savings />);
    expect(screen.getByText('Savings Plan')).toBeInTheDocument();
  });

  /**
   * Verifies that the page subtitle is displayed.
   */
  it('shows the page subtitle', () => {
    render(<Savings />);
    expect(screen.getByText(/Project your future savings/)).toBeInTheDocument();
  });

  /**
   * Verifies that the Projection Settings card is displayed
   * with the Current Savings input.
   */
  it('shows projection settings', () => {
    render(<Savings />);
    expect(screen.getByText('Projection Settings')).toBeInTheDocument();
    expect(screen.getByText(/Current Savings/)).toBeInTheDocument();
  });

  /**
   * Verifies that the Monthly Contribution input is present.
   */
  it('shows monthly contribution input', () => {
    render(<Savings />);
    expect(screen.getByText(/Monthly Contribution/)).toBeInTheDocument();
  });

  /**
   * Verifies that the stat cards are rendered showing
   * projected balance, total contributed, interest earned, and months to goal.
   */
  it('renders savings stat cards', () => {
    render(<Savings />);
    expect(screen.getByText('Projected Balance')).toBeInTheDocument();
    expect(screen.getByText('Total Contributed')).toBeInTheDocument();
    expect(screen.getByText('Interest Earned')).toBeInTheDocument();
    expect(screen.getByText('Months to Goal')).toBeInTheDocument();
  });

  /**
   * Verifies that the Savings Projection chart section is rendered.
   */
  it('renders the savings projection chart', () => {
    render(<Savings />);
    expect(screen.getByText('Savings Projection')).toBeInTheDocument();
  });

  /**
   * Verifies that the Historical Savings Rollover section is rendered.
   * This shows net savings per month based on logged transactions.
   */
  it('renders the historical rollover section', () => {
    render(<Savings />);
    expect(screen.getByText('Historical Savings Rollover')).toBeInTheDocument();
  });
  /**
   * Verifies that the Current Savings input accepts new values.
   * Changing this updates the savings projection calculation.
   */
  it('allows changing current savings amount', () => {
    render(<Savings />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '500' } });
    expect(inputs[0].value).toBe('500');
  });

  /**
   * Verifies that the Monthly Contribution input accepts new values.
   * This drives the projection chart calculation.
   */
  it('allows changing monthly contribution', () => {
    render(<Savings />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '200' } });
    expect(inputs[1].value).toBe('200');
  });

  /**
   * Verifies that the Interest Rate input accepts new values.
   */
  it('allows changing interest rate', () => {
    render(<Savings />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[2], { target: { value: '1.5' } });
    expect(inputs[2].value).toBe('1.5');
  });

  /**
   * Verifies that the Savings Goal input accepts new values.
   */
  it('allows changing savings goal', () => {
    render(<Savings />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[3], { target: { value: '10000' } });
    expect(inputs[3].value).toBe('10000');
  });

  /**
   * Verifies that the projection length slider label is shown.
   */
  it('shows projection length slider', () => {
    render(<Savings />);
    expect(screen.getByText(/Projection Length/)).toBeInTheDocument();
  });
});