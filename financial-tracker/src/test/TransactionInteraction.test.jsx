/**
 * TransactionInteraction.test.jsx
 * 
 * Interaction tests for the Transactions page.
 * Tests filtering, form inputs, and data display behaviors.
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
 * Mock the API module with sample transactions including
 * both income and expense types for filter testing.
 */
vi.mock('../api', () => ({
  getBalancesByOwner: vi.fn().mockResolvedValue([
    { event_id: 'tx1', owner: 'test-user-id', name: 'Part-time Job', amount: 150000, date: '2026-04-01' },
    { event_id: 'tx2', owner: 'test-user-id', name: 'Rent Payment', amount: -80000, date: '2026-04-01' },
  ]),
  createBalanceEvent: vi.fn().mockResolvedValue({ event_id: 'tx3' }),
  updateBalanceEvent: vi.fn(),
  deleteBalanceEvent: vi.fn().mockResolvedValue({}),
}));

describe('Transaction Interactions', () => {

  /**
   * Verifies that clicking the income filter button filters the list
   * to only show income transactions. Uses getAllByText because
   * 'income' appears both as a filter button and a type tag in the table.
   */
  it('filters by income type', async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText('Part-time Job')).toBeInTheDocument();
    });
    const filterBtns = screen.getAllByText('income');
    fireEvent.click(filterBtns[0]);
    expect(screen.getByText('Part-time Job')).toBeInTheDocument();
    expect(screen.queryByText('Rent Payment')).not.toBeInTheDocument();
  });

  /**
   * Verifies that clicking the expense filter button filters the list
   * to only show expense transactions. Uses getAllByText because
   * 'expense' appears both as a filter button and a type tag in the table.
   */
  it('filters by expense type', async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText('Rent Payment')).toBeInTheDocument();
    });
    const filterBtns = screen.getAllByText('expense');
    fireEvent.click(filterBtns[0]);
    expect(screen.getByText('Rent Payment')).toBeInTheDocument();
    expect(screen.queryByText('Part-time Job')).not.toBeInTheDocument();
  });

  /**
   * Verifies that the form has a Description input that accepts text.
   */
  it('allows typing in the description field', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    const input = screen.getByPlaceholderText(/Wegmans/);
    fireEvent.change(input, { target: { value: 'Coffee' } });
    expect(input.value).toBe('Coffee');
  });

  /**
   * Verifies that the form has an Amount input that accepts numbers.
   */
  it('allows typing in the amount field', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '25.50' } });
    expect(input.value).toBe('25.50');
  });

  /**
   * Verifies that the form has a category dropdown with default categories.
   */
  it('shows category dropdown in form', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  /**
   * Verifies that the form has a type dropdown to select income or expense.
   */
  it('shows type dropdown in form', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  /**
   * Verifies that the form has a date input field.
   */
  it('shows date input in form', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  /**
   * Verifies that the Add button is present in the form for submitting.
   */
  it('shows Add button in form', () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  /**
   * Verifies that clicking the all filter shows all transactions again
   * after filtering by income. Uses getAllByText for the income button.
   */
  it('shows all transactions when all filter is clicked', async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText('Part-time Job')).toBeInTheDocument();
    });
    const incBtns = screen.getAllByText('income');
    fireEvent.click(incBtns[0]);
    fireEvent.click(screen.getByText('all'));
    expect(screen.getByText('Part-time Job')).toBeInTheDocument();
    expect(screen.getByText('Rent Payment')).toBeInTheDocument();
  });
});
/**
   * Verifies that clicking the delete button (✕) on a transaction
   * removes it from the list. Calls deleteBalanceEvent API.
   */
  it('deletes a transaction when delete button is clicked', async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText('Part-time Job')).toBeInTheDocument();
    });
    const deleteBtns = screen.getAllByText('✕');
    fireEvent.click(deleteBtns[0]);
    await waitFor(() => {
      expect(screen.queryByText('Part-time Job')).not.toBeInTheDocument();
    });
  });

  /**
   * Verifies that filling out the add transaction form and clicking Add
   * calls the createBalanceEvent API and adds the transaction to the list.
   */
  it('submits a new transaction', async () => {
    render(<Transactions />);
    fireEvent.click(screen.getByText('+ Add Transaction'));

    const descInput = screen.getByPlaceholderText(/Wegmans/);
    const amtInput = screen.getByPlaceholderText('0.00');

    fireEvent.change(descInput, { target: { value: 'Coffee' } });
    fireEvent.change(amtInput, { target: { value: '5.50' } });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
    });
  });