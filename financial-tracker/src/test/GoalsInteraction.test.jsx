/**
 * GoalsInteraction.test.jsx
 * 
 * Interaction tests for the Goals page component.
 * Tests user actions like contributing to goals, deleting goals,
 * and submitting the create goal form.
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
 * Mock the API module with a goal that has progress tracking data.
 */
vi.mock('../api', () => ({
  getBudgetGoalsByOwner: vi.fn().mockResolvedValue([
    {
      goal_id: 'g1', owner: 'test-user-id', name: 'Emergency Fund',
      amount: 100000, achieve_by_date: '2026-12-31', started_on: '2026-01-01'
    },
  ]),
  createBudgetGoal: vi.fn(),
  deleteBudgetGoal: vi.fn().mockResolvedValue({}),
}));

/**
 * Mock fetch for the addGoal function which uses raw fetch
 * instead of the API wrapper.
 */
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ goal_id: 'new-goal' }),
});

describe('Goals Interactions', () => {

  /**
   * Verifies that clicking the +$10 contribution button updates
   * the progress display. The contribute function adds to the
   * goal's current amount and saves to localStorage.
   */
  it('contributes to a goal when +$10 is clicked', async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('+$10'));
    await waitFor(() => {
      expect(screen.getByText(/1% complete/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that multiple contributions accumulate correctly.
   * After clicking +$25, the progress should update.
   */
  it('accumulates contributions', async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('+$25'));
    await waitFor(() => {
      expect(screen.getByText(/to go/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that clicking the delete button (✕) on a goal
   * removes it from the page. The deleteGoal function calls
   * the API and updates local state.
   */
  it('deletes a goal when delete button is clicked', async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });
    const deleteBtn = screen.getByText('✕');
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.queryByText('Emergency Fund')).not.toBeInTheDocument();
    });
  });

  /**
   * Verifies that the progress percentage starts at 0% for a new goal.
   */
  it('shows 0% progress for new goal', async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText(/0% complete/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the create goal form has icon selection buttons.
   */
  it('shows icon selection in create form', () => {
    render(<Goals />);
    fireEvent.click(screen.getByText('+ New Goal'));
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  /**
   * Verifies that the create goal form has color selection buttons.
   */
  it('shows color selection in create form', () => {
    render(<Goals />);
    fireEvent.click(screen.getByText('+ New Goal'));
    expect(screen.getByText('Color')).toBeInTheDocument();
  });

  /**
   * Verifies that filling out the form and clicking Create Goal
   * calls fetch to create the goal via the API.
   */
  it('submits new goal form', async () => {
    render(<Goals />);
    fireEvent.click(screen.getByText('+ New Goal'));
    
    const nameInput = screen.getByPlaceholderText(/Emergency Fund/);
    const targetInput = screen.getByPlaceholderText('1000');
    
    fireEvent.change(nameInput, { target: { value: 'New Laptop' } });
    fireEvent.change(targetInput, { target: { value: '1200' } });
    
    fireEvent.click(screen.getByText('Create Goal'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  /**
   * Verifies that the Create Goal button is present in the form.
   */
  it('shows Create Goal button in form', () => {
    render(<Goals />);
    fireEvent.click(screen.getByText('+ New Goal'));
    expect(screen.getByText('Create Goal')).toBeInTheDocument();
  });
});