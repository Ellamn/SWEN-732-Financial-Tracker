/**
 * App.test.jsx
 * 
 * Unit tests for the main App component.
 * The App component is the root of the application. It wraps everything
 * in a UserProvider for authentication and renders the Sidebar + active page.
 * 
 * Testing framework: Vitest with React Testing Library
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

/**
 * Mock the UserContext to simulate a logged-in user.
 * Also provides a UserProvider wrapper that just renders children directly.
 */
vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        userId: 'test-user-id',
        username: 'tenzin',
        logout: vi.fn(),
    }),
    UserProvider: ({ children }) => children,
}));

/**
 * Mock the API module so no real HTTP requests are made during testing.
 * Returns empty arrays for all data-fetching functions.
 */
vi.mock('../api', () => ({
    getUserByName: vi.fn(),
    createUser: vi.fn(),
    getBalancesByOwner: vi.fn().mockResolvedValue([]),
    createBalanceEvent: vi.fn(),
    updateBalanceEvent: vi.fn(),
    deleteBalanceEvent: vi.fn(),
    getExpenseCategoriesByOwner: vi.fn().mockResolvedValue([]),
    createExpenseCategory: vi.fn(),
    updateExpenseCategory: vi.fn(),
    deleteExpenseCategory: vi.fn(),
    getBudgetGoalsByOwner: vi.fn().mockResolvedValue([]),
    createBudgetGoal: vi.fn(),
    updateBudgetGoal: vi.fn(),
    deleteBudgetGoal: vi.fn(),
    createIncomeSource: vi.fn(),
    updateIncomeSource: vi.fn(),
    deleteIncomeSource: vi.fn(),
}));

import App from '../App';

describe('App', () => {

    /**
     * Verifies that the App component renders without crashing.
     * This is a smoke test to ensure all child components can mount.
     */
    it('renders without crashing', () => {
        render(<App />);
        expect(screen.getByText('FinTrack')).toBeInTheDocument();
    });

    /**
     * Verifies that the Dashboard page is shown by default when the app loads.
     * Dashboard is the initial activePage state.
     */
    /**
      * Verifies that the Dashboard page is shown by default when the app loads.
      * We check for the subtitle text which only appears on the Dashboard page.
      */
    it('shows Dashboard by default', () => {
        render(<App />);
        expect(screen.getByText(/Your financial snapshot/)).toBeInTheDocument();
    });

    /**
     * Verifies that the sidebar navigation is present on the page.
     * All five navigation items should be rendered.
     */
    it('renders the sidebar navigation', () => {
        render(<App />);
        expect(screen.getByText('Transactions')).toBeInTheDocument();
        expect(screen.getByText('Budget')).toBeInTheDocument();
        expect(screen.getByText('Goals')).toBeInTheDocument();
        expect(screen.getByText('Savings Plan')).toBeInTheDocument();
    });

    /**
     * Verifies that clicking a navigation item switches the displayed page.
     * After clicking 'Goals', the Goals page heading should appear.
     */
    it('switches pages when nav item is clicked', async () => {
        render(<App />);
        fireEvent.click(screen.getByText('Goals'));
        expect(await screen.findByText('Savings Goals')).toBeInTheDocument();
    });
});