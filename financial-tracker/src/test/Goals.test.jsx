/**
 * Goals.test.jsx
 * 
 * Unit tests for the Goals page component.
 * The Goals page lets users create savings goals with a target amount,
 * track progress with contributions, and delete completed goals.
 * 
 * Testing framework: Vitest with React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Goals from '../pages/Goals';

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
 * Mock the API module. getBudgetGoalsByOwner returns one sample goal
 * so the page has data to display.
 */
vi.mock('../api', () => ({
  getBudgetGoalsByOwner: vi.fn().mockResolvedValue([
    {
      goal_id: 'g1', owner: 'test-user-id', name: 'Emergency Fund',
      amount: 100000, achieve_by_date: '2026-12-31', started_on: '2026-01-01'
    },
  ]),
  deleteBudgetGoal: vi.fn().mockResolvedValue({}),
}));

describe('Goals', () => {

  /**
   * Verifies that the Savings Goals heading is rendered.
   */
  it('renders the Goals heading', () => {
    render(<Goals />);
    expect(screen.getByText('Savings Goals')).toBeInTheDocument();
  });

  /**
   * Verifies that the page subtitle is displayed.
   */
  it('shows the page subtitle', () => {
    render(<Goals />);
    expect(screen.getByText(/Set targets, track progress/)).toBeInTheDocument();
  });

  /**
   * Verifies that the New Goal button is present.
   */
  it('shows the New Goal button', () => {
    render(<Goals />);
    expect(screen.getByText('+ New Goal')).toBeInTheDocument();
  });

  /**
   * Verifies that clicking New Goal shows the create goal form
   * with a Goal Name input field.
   */
  it('shows create form when New Goal is clicked', () => {
    render(<Goals />);
    fireEvent.click(screen.getByText('+ New Goal'));
    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Emergency Fund/)).toBeInTheDocument();
  });

  /**
   * Verifies that goals loaded from the API are displayed on the page.
   */
  it('displays goals from the API', async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the goal shows the deadline date.
   */
  it('shows the goal deadline', async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText(/2026-12-31/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that clicking Cancel hides the create goal form.
   */
  it('hides form when Cancel is clicked', () => {
    render(<Goals />);
    fireEvent.click(screen.getByText('+ New Goal'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Create New Goal')).not.toBeInTheDocument();
  });
});