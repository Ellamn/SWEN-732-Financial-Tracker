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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropTypes from 'prop-types';
import * as api from '../api';
import Budget from '../pages/Budget';

vi.mock('recharts', () => {
  const ResponsiveContainer = ({ children }) => <div>{children}</div>;
  const PieChart = ({ children }) => <div>{children}</div>;
  const Pie = ({ children }) => <div>{children}</div>;
  const Cell = () => <div />;
  const Tooltip = ({ formatter }) => {
    const [value, name] = formatter ? formatter(50, 'Needs') : ['', ''];
    return <div data-testid="tooltip-preview">{value} {name}</div>;
  };

  ResponsiveContainer.propTypes = { children: PropTypes.node };
  PieChart.propTypes = { children: PropTypes.node };
  Pie.propTypes = { children: PropTypes.node };
  Tooltip.propTypes = { formatter: PropTypes.func };

  return { ResponsiveContainer, PieChart, Pie, Cell, Tooltip };
});

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

const DEFAULT_API_CATEGORIES = [
  { category_id: 'c1', owner: 'test-user-id', name: 'Groceries' },
  { category_id: 'c2', owner: 'test-user-id', name: 'Rent' },
  { category_id: 'c3', owner: 'test-user-id', name: 'Transport' },
];

describe('Budget', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(api.getExpenseCategoriesByOwner).mockResolvedValue(DEFAULT_API_CATEGORIES);
    vi.mocked(api.createExpenseCategory).mockResolvedValue({ category_id: 'new-cat' });
    vi.mocked(api.deleteExpenseCategory).mockResolvedValue({});
  });

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

  /**
   * Verifies that the chart tooltip formatter shows both
   * percentage and dollar amount using the current paycheck.
   */
  it('formats tooltip values using percentage and paycheck amount', () => {
    render(<Budget />);
    expect(screen.getByTestId('tooltip-preview')).toHaveTextContent('50% - $300.00 Needs');
  });

  /**
   * Verifies that default categories are seeded when the API
   * returns no categories for the user.
   */
  it('seeds default categories when no categories exist', async () => {
    vi.mocked(api.getExpenseCategoriesByOwner).mockResolvedValueOnce([]);
    vi.mocked(api.createExpenseCategory)
      .mockResolvedValueOnce({ category_id: 'seed-1' })
      .mockRejectedValueOnce(new Error('seed failed'))
      .mockResolvedValueOnce({ category_id: 'seed-3' })
      .mockResolvedValueOnce({ category_id: 'seed-4' })
      .mockResolvedValueOnce({ category_id: 'seed-5' });

    render(<Budget />);

    await waitFor(() => {
      expect(api.createExpenseCategory).toHaveBeenCalledTimes(5);
    });

    expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Groceries');
    expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Rent');
    expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Transport');
    expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Entertainment');
    expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Utilities');
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
  });

  /**
   * Verifies that an error message is shown when loading
   * categories from the API fails.
   */
  it('shows an error when categories fail to load', async () => {
    vi.mocked(api.getExpenseCategoriesByOwner).mockRejectedValueOnce(new Error('API down'));

    render(<Budget />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load categories. Is your Flask API running?')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that clicking Add with only whitespace input
   * does not call the create category API.
   */
  it('does not add a category when the input is blank', async () => {
    render(<Budget />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/New category name/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(api.createExpenseCategory).not.toHaveBeenCalled();
  });

  /**
   * Verifies successful category creation updates the list,
   * clears input text, and restores button label.
   */
  it('adds a category and resets the input after success', async () => {
    let resolveCreate;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    vi.mocked(api.createExpenseCategory).mockReturnValueOnce(createPromise);

    render(<Budget />);

    const input = await screen.findByPlaceholderText(/New category name/);
    fireEvent.change(input, { target: { value: '  Travel  ' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));

    expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Travel');
    expect(screen.getByRole('button', { name: '...' })).toBeInTheDocument();

    resolveCreate({ category_id: 'travel-1' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '+ Add' })).toBeInTheDocument();
    });

    expect(input.value).toBe('');
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  /**
   * Verifies pressing Enter in the category input triggers
   * the same add-category behavior as clicking Add.
   */
  it('adds a category when Enter is pressed in the input', async () => {
    render(<Budget />);

    const input = await screen.findByPlaceholderText(/New category name/);
    fireEvent.change(input, { target: { value: 'Dining' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(api.createExpenseCategory).toHaveBeenCalledWith('test-user-id', 'Dining');
    });
  });

  /**
   * Verifies that a failed create category request shows
   * the add-category error state.
   */
  it('shows an error when adding a category fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.createExpenseCategory).mockRejectedValueOnce(new Error('create failed'));

    render(<Budget />);

    const input = await screen.findByPlaceholderText(/New category name/);
    fireEvent.change(input, { target: { value: 'Snacks' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to add category.')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  /**
   * Verifies that a failed delete request shows
   * the delete-category error state.
   */
  it('shows an error when deleting a category fails', async () => {
    vi.mocked(api.deleteExpenseCategory).mockRejectedValueOnce(new Error('delete failed'));

    render(<Budget />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('✕')[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete category.')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that paycheck and split inputs apply numeric
   * parsing and percentage clamping rules.
   */
  it('updates paycheck and split percentages with clamped values', () => {
    render(<Budget />);

    const paycheckInput = screen.getByLabelText('Paycheck Amount ($)');
    fireEvent.change(paycheckInput, { target: { value: '' } });
    expect(paycheckInput.value).toBe('0');

    const firstSplitInput = screen.getByDisplayValue('50');
    fireEvent.change(firstSplitInput, { target: { value: '150' } });
    expect(firstSplitInput.value).toBe('100');

    fireEvent.change(firstSplitInput, { target: { value: 'abc' } });
    expect(firstSplitInput.value).toBe('0');

    fireEvent.change(firstSplitInput, { target: { value: '40' } });
    expect(screen.getByText(/90% allocated/)).toBeInTheDocument();
    expect(screen.getByText(/\(under by 10%\)/)).toBeInTheDocument();
  });

  /**
   * Verifies spent and budget inputs update values and
   * progress styling for over-budget and warning states.
   */
  it('updates spent and budget amounts and changes progress colors', async () => {
    render(<Budget />);

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    const spentInputs = screen.getAllByDisplayValue('0');
    const budgetInputs = screen.getAllByDisplayValue('200');

    fireEvent.change(spentInputs[0], { target: { value: '250' } });
    expect(spentInputs[0].value).toBe('250');
    expect(screen.getByText('over')).toBeInTheDocument();

    let progressBars = document.querySelectorAll('.progress-fill');
    expect(progressBars[0]).toHaveStyle({ background: 'var(--danger)' });

    fireEvent.change(spentInputs[0], { target: { value: '170' } });
    progressBars = document.querySelectorAll('.progress-fill');
    expect(progressBars[0]).toHaveStyle({ background: 'var(--accent4)' });

    fireEvent.change(spentInputs[0], { target: { value: 'abc' } });
    expect(spentInputs[0].value).toBe('0');

    fireEvent.change(budgetInputs[0], { target: { value: '-10' } });
    expect(budgetInputs[0].value).toBe('0');

    fireEvent.change(budgetInputs[0], { target: { value: 'abc' } });
    expect(budgetInputs[0].value).toBe('0');
  });
});