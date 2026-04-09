/**
 * Sidebar.test.jsx
 * 
 * Unit tests for the Sidebar navigation component.
 * The Sidebar is the main navigation element of FinTrack, displayed on every page.
 * It contains the brand logo, navigation links, account balance, and user info.
 * 
 * Testing framework: Vitest with React Testing Library
 * We mock UserContext to simulate a logged-in user without needing the real API.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../components/Sidebar';

/**
 * Mock the UserContext hook so the Sidebar can render without
 * a real authentication flow or API connection.
 * Returns a fake user with id, username, and a mock logout function.
 */
vi.mock('../context/UserContext', () => ({
  useUser: () => ({
    userId: 'test-user-id',
    username: 'tenzin',
    logout: vi.fn(),
  }),
}));

describe('Sidebar', () => {

  /**
   * Verifies the FinTrack brand name appears in the sidebar header.
   * This ensures the branding is visible on every page of the app.
   */
  it('renders the FinTrack brand name', () => {
    render(<Sidebar activePage="dashboard" setActivePage={() => {}} />);
    expect(screen.getByText('FinTrack')).toBeInTheDocument();
  });

  /**
   * Verifies that all five navigation links are rendered:
   * Dashboard, Transactions, Budget, Goals, and Savings Plan.
   * Each link corresponds to a page in the application.
   */
  it('renders all navigation links', () => {
    render(<Sidebar activePage="dashboard" setActivePage={() => {}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Savings Plan')).toBeInTheDocument();
  });

  /**
   * Verifies that the currently active page's button has the 'active' CSS class.
   * This provides visual feedback to the user about which page they are on.
   * We set activePage to 'budget' and check that the Budget button is highlighted.
   */
  it('highlights the active page', () => {
    render(<Sidebar activePage="budget" setActivePage={() => {}} />);
    const budgetBtn = screen.getByText('Budget').closest('button');
    expect(budgetBtn).toHaveClass('active');
  });

  /**
   * Verifies that clicking a navigation item calls the setActivePage callback
   * with the correct page identifier. This is how the app switches between pages.
   * We use a mock function to capture the call and verify the argument.
   */
  it('calls setActivePage when a nav item is clicked', () => {
    const mockSetActive = vi.fn();
    render(<Sidebar activePage="dashboard" setActivePage={mockSetActive} />);
    fireEvent.click(screen.getByText('Transactions'));
    expect(mockSetActive).toHaveBeenCalledWith('transactions');
  });

  /**
   * Verifies that the logged-in user's username is displayed in the sidebar footer.
   * The username comes from UserContext which we mocked with 'tenzin'.
   */
  it('displays the logged in username', () => {
    render(<Sidebar activePage="dashboard" setActivePage={() => {}} />);
    expect(screen.getByText('tenzin')).toBeInTheDocument();
  });

  /**
   * Verifies that a logout button is present in the sidebar footer.
   * Users need this to sign out of their account.
   */
  it('shows a logout button', () => {
    render(<Sidebar activePage="dashboard" setActivePage={() => {}} />);
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });
});