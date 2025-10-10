import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeInput } from '../CodeInput';

// Mock the cn utility
jest.mock('../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('CodeInput', () => {
  const mockOnCodeComplete = jest.fn();
  const mockOnCodeChange = jest.fn();

  beforeEach(() => {
    mockOnCodeComplete.mockClear();
    mockOnCodeChange.mockClear();
  });

  it('renders 4 input fields', () => {
    render(<CodeInput onCodeComplete={mockOnCodeComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
    
    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 4`);
    });
  });

  it('auto-focuses first input when autoFocus is true', () => {
    render(<CodeInput onCodeComplete={mockOnCodeComplete} autoFocus={true} />);
    
    const firstInput = screen.getByLabelText('Digit 1 of 4');
    expect(firstInput).toHaveFocus();
  });

  it('advances to next field when typing a digit', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} onCodeChange={mockOnCodeChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    await user.type(inputs[0], '1');
    expect(inputs[1]).toHaveFocus();
    expect(mockOnCodeChange).toHaveBeenCalledWith('1');
  });

  it('calls onCodeComplete when all 4 digits are entered', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} onCodeChange={mockOnCodeChange} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    await user.type(inputs[2], '3');
    await user.type(inputs[3], '4');
    
    expect(mockOnCodeComplete).toHaveBeenCalledWith('1234');
  });

  it('moves to previous field on backspace when current field is empty', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Type in first field and move to second
    await user.type(inputs[0], '1');
    expect(inputs[1]).toHaveFocus();
    
    // Backspace should move back to first field
    await user.keyboard('{Backspace}');
    expect(inputs[0]).toHaveFocus();
  });

  it('handles arrow key navigation', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Focus first input and use arrow right
    inputs[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(inputs[1]).toHaveFocus();
    
    // Use arrow left to go back
    await user.keyboard('{ArrowLeft}');
    expect(inputs[0]).toHaveFocus();
  });

  it('handles paste functionality', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} onCodeChange={mockOnCodeChange} />);
    
    const firstInput = screen.getByLabelText('Digit 1 of 4');
    firstInput.focus();
    
    // Simulate paste event
    await user.paste('1234');
    
    expect(mockOnCodeChange).toHaveBeenCalledWith('1234');
    expect(mockOnCodeComplete).toHaveBeenCalledWith('1234');
  });

  it('only allows numeric input', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} onCodeChange={mockOnCodeChange} />);
    
    const firstInput = screen.getByLabelText('Digit 1 of 4');
    
    await user.type(firstInput, 'a');
    expect(firstInput).toHaveValue('');
    expect(mockOnCodeChange).not.toHaveBeenCalled();
    
    await user.type(firstInput, '5');
    expect(firstInput).toHaveValue('5');
    expect(mockOnCodeChange).toHaveBeenCalledWith('5');
  });

  it('clears inputs when error prop changes', () => {
    const { rerender } = render(<CodeInput onCodeComplete={mockOnCodeComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Simulate typing
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    
    // Add error - should clear inputs
    rerender(<CodeInput onCodeComplete={mockOnCodeComplete} error="Invalid code" />);
    
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('displays error message', () => {
    render(<CodeInput onCodeComplete={mockOnCodeComplete} error="Invalid verification code" />);
    
    expect(screen.getByText('Invalid verification code')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<CodeInput onCodeComplete={mockOnCodeComplete} loading={true} />);
    
    expect(screen.getByText('Verifying...')).toBeInTheDocument();
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('displays label and helper text', () => {
    render(
      <CodeInput 
        onCodeComplete={mockOnCodeComplete} 
        label="Verification Code"
        helperText="Enter the code from your email"
      />
    );
    
    expect(screen.getByText('Verification Code')).toBeInTheDocument();
    expect(screen.getByText('Enter the code from your email')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<CodeInput onCodeComplete={mockOnCodeComplete} disabled={true} />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('handles Enter key to submit complete code', async () => {
    const user = userEvent.setup();
    render(<CodeInput onCodeComplete={mockOnCodeComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Fill all inputs
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    await user.type(inputs[2], '3');
    await user.type(inputs[3], '4');
    
    // Clear the mock to test Enter key specifically
    mockOnCodeComplete.mockClear();
    
    // Press Enter
    await user.keyboard('{Enter}');
    
    expect(mockOnCodeComplete).toHaveBeenCalledWith('1234');
  });
});