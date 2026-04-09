/**
 * Transaction.test.jsx
 * 
 * Unit tests for the Transactions page component.
 * The Transactions page lets users add, view, filter, and delete
 * income and expense transactions. Each transaction has a description,
 * amount, category, type (income/expense), and date.
 * 
 * Testing framework: Vitest with React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Transactions from '../pages/Transactions';

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
 * Mock the API module. getBalancesByOwner returns two sample transactions
 * so the page has data to display and filter.
 * All other API functions are mocked to prevent real HTTP requests.
 */
vi.mock('../api', () => ({
  getBalancesByOwner: vi.fn().mockResolvedValue([
    { event_id: 'tx1', owner: 'test-user-id', name: 'Part-time Job', amount: 150000, date: '2026-04-01' },
    { event_id: 'tx2', owner: 'test-user-id', name: 'Rent Payment', amount: -4500, date: '2026-04-01' },
  ]),
  createBalanceEvent: vi.fn().mockResolvedValue({ event_id: 'tx3' }),
  updateBalanceEvent: vi.fn(),
  deleteBalanceEvent: vi.fn().mockResolvedValue({}),
}));

describe('Transactions', () => {

  /**
   * Verifies that the Transactions page heading renders correctly.
   */
  it('renders the Transactions heading', () => {
    render(<Transactions />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  /**
   * Verifies that the page subtitle describing the purpose is shown.
   */
  it('shows the page subtitle', () => {
    render(<Transactions />);
    expect(screen.getByText(/Track and categorize every dollar/)).toBeInTheDocument();
  });

  /**
   * Verifies that the Add Transaction button is present on the page.
   * This button opens the form to add a new income or expense.
   */
  it('shows the Add Transaction button', () => {
    render(<Transactions />);
    expect(screen.getByText('+ Add Transaction')).toBeInTheDocument();
  });

  /**
   * Verifies that clicking Add Transaction reveals the new transaction form
   * with a Description input field.
   */
  it('shows the add form when Add Transaction is clicked', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    expect(screen.getByText('New Transaction')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Wegmans/)).toBeInTheDocument();
  });

  /**
   * Verifies that the filter buttons for All, Income, and Expense are rendered.
   * Users use these to filter the transaction list by type.
   */
  it('renders filter buttons', () => {
    render(<Transactions />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('income')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
  });

  /**
   * Verifies that transactions loaded from the API are displayed in the table.
   * We mocked two transactions: Part-time Job and Rent Payment.
   */
  it('displays transactions from the API', async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText('Part-time Job')).toBeInTheDocument();
      expect(screen.getByText('Rent Payment')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the transaction count is displayed at the bottom of the page.
   * With two mocked transactions, it should show "2 transactions".
   */
  it('shows the transaction count', async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText(/2 transactions/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that clicking Cancel closes the add transaction form
   * and hides it from view.
   */
  it('hides form when Cancel is clicked', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('New Transaction')).not.toBeInTheDocument();
  });
});