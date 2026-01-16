/**
 * Cash Flow Section
 * Interactive prompts for collecting monthly cash flow information
 */

import { createInterface } from 'readline';
import { validateCurrency } from '../modules/input-validator';
import type { OnboardingState } from '../modules/progress';
import { saveSectionData, markSectionComplete, saveState } from '../modules/progress';

export interface CashFlowData {
  monthly_income: number;
  fixed_expenses: number;
  variable_expenses: number;
  current_savings: number;
  investment_capacity: number;
}

/**
 * Creates a readline interface for prompting user
 */
function createPrompt() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompts user for input with validation
 * @param rl - Readline interface
 * @param question - Question to ask
 * @param validator - Validation function
 * @param allowEmpty - Whether empty input is allowed
 * @returns Validated value
 */
async function promptWithValidation<T>(
  rl: ReturnType<typeof createInterface>,
  question: string,
  validator: (input: string) => T,
  allowEmpty: boolean = false
): Promise<T> {
  return new Promise((resolve) => {
    const ask = () => {
      rl.question(question, (answer) => {
        if (allowEmpty && answer.trim() === '') {
          resolve(null as T);
          return;
        }

        try {
          const validated = validator(answer);
          resolve(validated);
        } catch (error) {
          if (error instanceof Error) {
            console.log(`❌ ${error.message}`);
          }
          console.log('Please try again.');
          ask();
        }
      });
    };
    ask();
  });
}

/**
 * Runs the Cash Flow section
 * @param state - Current onboarding state
 * @returns Updated state with cash flow data
 */
export async function runCashFlowSection(state: OnboardingState): Promise<OnboardingState> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💵 Section 3 of 7: Cash Flow');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log("Let's understand your monthly cash flow (after-tax income and expenses).");
  console.log('');

  const rl = createPrompt();

  try {
    // Prompt for monthly income
    const monthlyIncome = await promptWithValidation(
      rl,
      'What is your monthly after-tax income? $',
      validateCurrency
    );

    // Prompt for fixed expenses
    console.log('');
    console.log('Fixed expenses are recurring bills (rent, insurance, subscriptions, etc.)');
    const fixedExpenses = await promptWithValidation(
      rl,
      'What are your total fixed monthly expenses? $',
      validateCurrency
    );

    // Prompt for variable expenses
    console.log('');
    console.log('Variable expenses include groceries, dining, entertainment, shopping, etc.');
    const variableExpenses = await promptWithValidation(
      rl,
      'What are your average variable monthly expenses? $',
      validateCurrency
    );

    // Prompt for current savings
    console.log('');
    const currentSavings = await promptWithValidation(
      rl,
      'How much do you currently save each month? $',
      validateCurrency
    );

    // Calculate and validate investment capacity
    const totalExpenses = fixedExpenses + variableExpenses;
    const calculatedCapacity = monthlyIncome - totalExpenses;

    console.log('');
    console.log(`Calculated monthly surplus: $${calculatedCapacity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    console.log('');

    // Prompt for investment capacity with validation
    const investmentCapacity = await promptWithValidation(
      rl,
      'What is your monthly investment capacity? $',
      (input: string) => {
        const value = validateCurrency(input);
        if (value > monthlyIncome) {
          throw new Error(
            `Investment capacity ($${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) cannot exceed monthly income ($${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
          );
        }
        return value;
      }
    );

    // Create cash flow data
    const cashFlowData: CashFlowData = {
      monthly_income: monthlyIncome,
      fixed_expenses: fixedExpenses,
      variable_expenses: variableExpenses,
      current_savings: currentSavings,
      investment_capacity: investmentCapacity
    };

    // Save section data
    saveSectionData(state, 'cash_flow', cashFlowData);

    // Mark section as complete
    markSectionComplete(state, 'cash_flow', 'debt');

    // Save state to disk
    saveState(state);

    console.log('');
    console.log('✅ Cash Flow: Complete');
    console.log('');

    return state;
  } finally {
    rl.close();
  }
}
