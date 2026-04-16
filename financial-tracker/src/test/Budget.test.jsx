/**
 * Budget.test.jsx
 * 
 * Unit tests for the Budget page component.
 * The Budget page lets users split their paycheck into categories,
 * set monthly spending limits per category, and track how much
 * they've spent vs their budget.
 * 
 * Testing framework: Vitest with React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Budget from '../pages/Budget';

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
 * Mock the API module. Returns sample expense categories
 * so the budget page has data to display.
 */
vi.mock('../api', () => ({
  getExpenseCategoriesByOwner: vi.fn().mockResolvedValue([
    { category_id: 'c1', owner: 'test-user-id', name: 'Groceries' },
    { category_id: 'c2', owner: 'test-user-id', name: 'Rent' },
    { category_id: 'c3', owner: 'test-user-id', name: 'Transport' },
  ]),
  createExpenseCategory: vi.fn(),
  deleteExpenseCategory: vi.fn().mockResolvedValue({}),
}));

/**
 * Mock fetch for the seedDefaults function which uses raw fetch
 * instead of the API wrapper.
 */
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ category_id: 'new-cat' }),
});

describe('Budget', () => {

  /**
   * Verifies that the Budget page heading is rendered.
   */
  it('renders the Budget heading', () => {
    render(<Budget />);
    expect(screen.getByText('Budget')).toBeInTheDocument();
  });

  /**
   * Verifies that the page subtitle is displayed.
   */
  it('shows the page subtitle', () => {
    render(<Budget />);
    expect(screen.getByText(/Split your paycheck, set spending limits/)).toBeInTheDocument();
  });

  /**
   * Verifies that the Paycheck Splitter section is rendered.
   * This lets users divide their paycheck into budget categories.
   */
  it('shows the Paycheck Splitter section', () => {
    render(<Budget />);
    expect(screen.getByText('Paycheck Splitter')).toBeInTheDocument();
  });

  /**
   * Verifies that the Paycheck Amount input field is present.
   */
  it('shows the paycheck amount input', () => {
    render(<Budget />);
    expect(screen.getByText(/Paycheck Amount/)).toBeInTheDocument();
  });

  /**
   * Verifies that the Monthly Budget Limits section is rendered.
   * This shows each category with spent vs budget progress bars.
   */
  it('shows the Monthly Budget Limits section', () => {
    render(<Budget />);
    expect(screen.getByText('Monthly Budget Limits')).toBeInTheDocument();
  });

  /**
   * Verifies that the Budget Summary section is rendered
   * with the four summary metrics.
   */
  it('shows the Budget Summary section', () => {
    render(<Budget />);
    expect(screen.getByText('Budget Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Budgeted')).toBeInTheDocument();
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Over-budget Categories')).toBeInTheDocument();
  });

  /**
   * Verifies that expense categories loaded from the API
   * are displayed in the budget limits section.
   */
  it('displays categories from the API', async () => {
    render(<Budget />);
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the default paycheck split categories are shown
   * in the Paycheck Splitter section (Needs, Wants, Savings, etc).
   */
  it('shows default paycheck split categories', () => {
    render(<Budget />);
    expect(screen.getByText('Needs')).toBeInTheDocument();
    expect(screen.getByText('Wants')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  /**
   * Verifies that the add category input field is present
   * for users to create new expense categories.
   */
  it('shows the add category input', async () => {
    render(<Budget />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/New category name/)).toBeInTheDocument();
    });
  });


  /**
   * Verifies that the delete button (✕) is present on each category
   * and clicking it removes the category from the list.
   */
  it('deletes a category when delete button is clicked', async () => {
    render(<Budget />);
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });
    const deleteBtns = screen.getAllByText('✕');
    fireEvent.click(deleteBtns[0]);
    await waitFor(() => {
      expect(screen.getAllByText('✕').length).toBeLessThan(deleteBtns.length);
    });
  });

  /**
   * Verifies that the paycheck amount input can be changed.
   * This updates how much money is split across categories.
   */
  it('allows changing the paycheck amount', () => {
    render(<Budget />);
    const inputs = screen.getAllByDisplayValue('600');
    fireEvent.change(inputs[0], { target: { value: '1200' } });
    expect(inputs[0].value).toBe('1200');
  });

  /**
   * Verifies that the allocation percentage is displayed.
   * Default splits should total 100%.
   */
  it('shows allocation percentage', () => {
    render(<Budget />);
    expect(screen.getByText(/100% allocated/)).toBeInTheDocument();
  });
});