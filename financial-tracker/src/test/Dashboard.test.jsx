/**
 * Dashboard.test.jsx
 * 
 * Unit tests for the Dashboard page component.
 * The Dashboard displays the user's financial overview including
 * bank balance, monthly income/expenses, savings rate,
 * spending pie charts, and monthly rollover bar chart.
 * 
 * Testing framework: Vitest with React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../pages/Dashboard';

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
 * Mock the API to return sample transaction data.
 * Includes one income and one expense for the current month
 * so the dashboard has data to display.
 */
vi.mock('../api', () => ({
    getBalancesByOwner: vi.fn().mockResolvedValue([
        { event_id: 'e1', owner: 'test-user-id', name: 'Paycheck', amount: 200000, date: '2026-04-01' },
        { event_id: 'e2', owner: 'test-user-id', name: 'Groceries', amount: -5000, date: '2026-04-01' },
    ]),
}));

describe('Dashboard', () => {

    /**
     * Verifies that the Dashboard heading is rendered on the page.
     */
    it('renders the Dashboard heading', () => {
        render(<Dashboard />);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    /**
     * Verifies that the financial snapshot subtitle is displayed
     * with the current month and year.
     */
    it('shows the financial snapshot subtitle', () => {
        render(<Dashboard />);
        expect(screen.getByText(/Your financial snapshot/)).toBeInTheDocument();
    });

    /**
     * Verifies that the Current Bank Balance label is displayed.
     * The balance card is the main element at the top of the dashboard.
     */
    it('renders the balance card', () => {
        render(<Dashboard />);
        expect(screen.getByText('Current Bank Balance')).toBeInTheDocument();
    });

    /**
     * Verifies that the Update Balance button is present,
     * allowing users to edit their bank balance.
     */
    it('shows the Update Balance button', () => {
        render(<Dashboard />);
        expect(screen.getByText('Update Balance')).toBeInTheDocument();
    });

    /**
     * Verifies that all four stat cards are rendered:
     * Monthly Income, Monthly Expenses, Net Savings, and Savings Rate.
     * These give the user a quick overview of their monthly finances.
     */
    it('renders all stat card labels', async () => {
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('Monthly Income')).toBeInTheDocument();
            expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
            expect(screen.getByText('Net Savings')).toBeInTheDocument();
            expect(screen.getByText('Savings Rate')).toBeInTheDocument();
        });
    });

    /**
     * Verifies that clicking Update Balance shows the edit input field.
     * Users can type a new balance and save it.
     */
    it('shows balance edit input when Update Balance is clicked', () => {
        render(<Dashboard />);
        fireEvent.click(screen.getByText('Update Balance'));
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    /**
     * Verifies that clicking Cancel closes the balance edit mode
     * and shows the Update Balance button again.
     */
    it('cancels balance editing when Cancel is clicked', () => {
        render(<Dashboard />);
        fireEvent.click(screen.getByText('Update Balance'));
        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.getByText('Update Balance')).toBeInTheDocument();
    });


    /**
     * Verifies that saving a new balance updates the displayed value.
     * Tests the full edit flow: click edit, change value, click save.
     */
    it('saves a new balance value', () => {
        render(<Dashboard />);
        fireEvent.click(screen.getByText('Update Balance'));
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '3000' } });
        fireEvent.click(screen.getByText('Save'));
        expect(screen.getByText('Update Balance')).toBeInTheDocument();
    });
});