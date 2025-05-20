import { QuestionTree, QuestionType, OpenEndedInputType } from './types';

export const questionTree: QuestionTree = {
  start_chat: {
    id: 'start_chat',
    text: "Welcome! I'm here to help create your financial report. Ready to start?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Start"],
    next: () => 'details_name',
    dataKey: null
  },

  details_name: {
    id: 'details_name',
    text: "What's your full name?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.TEXT,
    next: () => 'details_email',
    dataKey: 'name',
    placeholder: "e.g., Jane Doe"
  },
  details_email: {
    id: 'details_email',
    text: "What's your email address? (A copy of your report will be sent here)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.EMAIL,
    next: () => 'age_group',
    dataKey: 'email',
    placeholder: "e.g., jane.doe@example.com"
  },

  age_group: {
    id: 'age_group',
    text: "What age group best represents your household (includes all adults living with you)?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["15-24", "25-34", "35-44", "45-54", "55-65", "65 and above"],
    next: () => 'relationship_status',
    dataKey: 'age'
  },

  relationship_status: {
    id: 'relationship_status',
    text: "What's your relationship status?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Single", "Married"],
    next: (response) => {
      if (response?.toLowerCase() === 'married') {
        return 'partner_name';
      }
      return 'income_frequency';
    },
    dataKey: 'relationship_status'
  },
  partner_name: {
    id: 'partner_name',
    text: "What's your partner's full name?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.TEXT,
    next: () => 'income_frequency',
    dataKey: 'partner_name',
    placeholder: "e.g., John Smith"
  },

  income_frequency: {
    id: 'income_frequency',
    text: "What's your pay frequency?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Weekly", "Fortnightly", "Monthly"],
    next: () => 'income_primary',
    dataKey: 'income.frequency'
  },
  income_primary: {
    id: 'income_primary',
    text: "What's your typical take-home income per pay period?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'income_bonus',
    dataKey: 'income.primary',
    placeholder: "e.g., 2000"
  },
  income_bonus: {
    id: 'income_bonus',
    text: "What was the total bonus you received in the last 12 months? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: (response, allResponses) => {
      if (allResponses?.relationship_status?.toLowerCase() === 'married') {
        return 'partner_income_frequency';
      }
      return 'other_income_rental';
    },
    dataKey: 'income.bonus',
    placeholder: "e.g., 5000"
  },

  partner_income_frequency: {
    id: 'partner_income_frequency',
    text: "What's your partner's pay frequency?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Weekly", "Fortnightly", "Monthly"],
    next: () => 'partner_income_primary',
    dataKey: 'partner_income.frequency'
  },
  partner_income_primary: {
    id: 'partner_income_primary',
    text: "What's your partner's typical take-home income per pay period?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'partner_income_bonus',
    dataKey: 'partner_income.primary',
    placeholder: "e.g., 1800"
  },
  partner_income_bonus: {
    id: 'partner_income_bonus',
    text: "What was the total bonus your partner received in the last 12 months? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_income_rental',
    dataKey: 'partner_income.bonus',
    placeholder: "e.g., 0"
  },

  other_income_rental: {
    id: 'other_income_rental',
    text: "What's your total 'weekly' rental income from property/ies, if any? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_income_dividends',
    dataKey: 'other_income.rental.amount',
    placeholder: "e.g., 300"
  },
  other_income_dividends: {
    id: 'other_income_dividends',
    text: "How much in dividends/interest did you receive in the past year, if any? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_income_centrelink',
    dataKey: 'other_income.dividends.amount',
    placeholder: "e.g., 1000"
  },
  other_income_centrelink: {
    id: 'other_income_centrelink',
    text: "What's your total 'fortnightly' Centrelink income (e.g., Family Tax, Allowances), if any? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_income_other',
    dataKey: 'other_income.centrelink.amount',
    placeholder: "e.g., 0"
  },
  other_income_other: {
    id: 'other_income_other',
    text: "Any other passive income in the past year (e.g. from a side business)? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'consumption_monthly_savings',
    dataKey: 'other_income.other.amount',
    placeholder: "e.g., 0"
  },

  consumption_monthly_savings: {
    id: 'consumption_monthly_savings',
    text: "Roughly, how much do you manage to save in a typical month?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'consumption_living_expense',
    dataKey: 'consumption.monthly_savings',
    placeholder: "e.g., 500"
  },
  consumption_living_expense: {
    id: 'consumption_living_expense',
    text: "What's your estimated monthly living expense (excluding loan repayments)?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'consumption_housing_situation',
    dataKey: 'consumption.living_expense',
    placeholder: "e.g., 1500"
  },
  consumption_housing_situation: {
    id: 'consumption_housing_situation',
    text: "What's your current housing situation?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Renting", "Owning Home"],
    next: (response) => {
      if (response?.toLowerCase() === 'renting') {
        return 'consumption_rent_amount';
      }
      return 'consumption_home_value';
    },
    dataKey: 'consumption.housing'
  },
  consumption_rent_amount: {
    id: 'consumption_rent_amount',
    text: "What's your weekly rent amount?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'investment_properties_start_owns',
    dataKey: 'consumption.weekly_rent', // Changed from monthly_rent to weekly_rent to match question
    placeholder: "e.g., 400"
  },
  consumption_home_value: {
    id: 'consumption_home_value',
    text: "What's the current estimated value of your home?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'consumption_home_loan_owed',
    dataKey: 'consumption.home_value',
    placeholder: "e.g., 500000"
  },
  consumption_home_loan_owed: {
    id: 'consumption_home_loan_owed',
    text: "How much do you currently owe on your home loan? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'consumption_home_loan_repayment',
    dataKey: 'consumption.home_loan_amount_owed',
    placeholder: "e.g., 250000"
  },
  consumption_home_loan_repayment: {
    id: 'consumption_home_loan_repayment',
    text: "What's your monthly home loan repayment amount? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'investment_properties_start_owns',
    dataKey: 'consumption.home_loan_monthly_repayment',
    placeholder: "e.g., 1200"
  },

  investment_properties_start_owns: {
    id: 'investment_properties_start_owns',
    text: "Do you own any investment property/ies?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Yes", "No"],
    next: (response) => {
      if (response?.toLowerCase() === 'yes') {
        return 'investment_properties_total_value';
      }
      return 'shares_start_owns';
    },
    dataKey: 'investment_properties.owns'
  },

  investment_properties_total_value: {
    id: 'investment_properties_total_value',
    text: "What is the total current market value of your investment property/ies?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'investment_properties_loan_owed',
    dataKey: 'investment_properties.total_value',
    placeholder: "e.g., 300000"
  },
  investment_properties_loan_owed: {
    id: 'investment_properties_loan_owed',
    text: "How much do you owe in loans for these investment property/ies? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'investment_properties_loan_repayment',
    dataKey: 'investment_properties.total_amount_owed',
    placeholder: "e.g., 150000"
  },
  investment_properties_loan_repayment: {
    id: 'investment_properties_loan_repayment',
    text: "What are your total 'Monthly' loan repayments for these investment property/ies? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'shares_start_owns',
    dataKey: 'investment_properties.total_monthly_repayment',
    placeholder: "e.g., 800"
  },

  shares_start_owns: {
    id: 'shares_start_owns',
    text: "Do you have any shares or investment funds (e.g., ETFs, managed funds, crypto)?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Yes", "No"],
    next: (response) => {
      if (response?.toLowerCase() === 'yes') {
        return 'shares_total_value';
      }
      return 'savings_super_amount';
    },
    dataKey: 'shares.owns'
  },

  shares_total_value: {
    id: 'shares_total_value',
    text: "What's the total current value of your shares/investment funds portfolio?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'shares_loan_owed',
    dataKey: 'shares.total_value',
    placeholder: "e.g., 50000"
  },
  shares_loan_owed: {
    id: 'shares_loan_owed',
    text: "Do you have any loans specifically for investing in these shares/funds (e.g., margin loan)? If yes, how much do you owe? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: (response) => {
      const amountOwed = parseFloat(response || "0");
      if (amountOwed > 0) {
        return 'shares_loan_repayment';
      }
      return 'savings_super_amount';
    },
    dataKey: 'shares.total_loan_owed',
    placeholder: "e.g., 0"
  },
  shares_loan_repayment: {
    id: 'shares_loan_repayment',
    text: "What are your total 'Monthly' repayments on these investment loans? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'savings_super_amount',
    dataKey: 'shares.total_monthly_repayment',
    placeholder: "e.g., 0"
  },

  savings_super_amount: {
    id: 'savings_super_amount',
    text: "What is the total current balance of your superfund(s)? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'savings_cash_amount',
    dataKey: 'savings.super',
    placeholder: "e.g., 100000"
  },
  savings_cash_amount: {
    id: 'savings_cash_amount',
    text: "How much cash savings do you have (e.g., in bank accounts, term deposits, excluding superfunds)? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'savings_lifestyle_assets_value',
    dataKey: 'savings.cash',
    placeholder: "e.g., 20000"
  },
  savings_lifestyle_assets_value: {
    id: 'savings_lifestyle_assets_value',
    text: "What is the estimated total value of your lifestyle assets (e.g., cars, boats, jewelry, valuable contents)? (Enter 0 if none)",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_loans_has_credit_cards',
    dataKey: 'savings.total_lifestyle_assets_value',
    placeholder: "e.g., 30000"
  },

  other_loans_has_credit_cards: {
    id: 'other_loans_has_credit_cards',
    text: "Do you have any outstanding credit card balances that you don't clear in full each month?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Yes", "No"],
    next: (response) => {
      if (response?.toLowerCase() === 'yes') {
        return 'other_loans_cc_balance';
      }
      return 'other_loans_has_hecs';
    },
    dataKey: 'other_loans.has_credit_cards'
  },
  other_loans_cc_balance: {
    id: 'other_loans_cc_balance',
    text: "What is your total outstanding credit card balance?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_loans_cc_repayment',
    dataKey: 'other_loans.credit_cards_balance',
    placeholder: "e.g., 2000"
  },
  other_loans_cc_repayment: {
    id: 'other_loans_cc_repayment',
    text: "What are your total minimum 'Monthly' payments towards these credit card(s)?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_loans_has_hecs',
    dataKey: 'other_loans.credit_cards_min_monthly_payments',
    placeholder: "e.g., 100"
  },
  other_loans_has_hecs: {
    id: 'other_loans_has_hecs',
    text: "Do you or your partner have a HECS-HELP (or similar government study) debt?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Yes", "No"],
    next: (response) => {
      if (response?.toLowerCase() === 'yes') {
        return 'other_loans_hecs_owed';
      }
      return 'other_loans_has_car_loans';
    },
    dataKey: 'other_loans.has_hecs'
  },
  other_loans_hecs_owed: {
    id: 'other_loans_hecs_owed',
    text: "How much is currently owed on HECS-HELP debt(s)?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'other_loans_has_car_loans',
    dataKey: 'other_loans.hecs_owed',
    placeholder: "e.g., 15000"
  },
  other_loans_has_car_loans: {
    id: 'other_loans_has_car_loans',
    text: "Do you or your partner have any car loans or leases?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Yes", "No"],
    next: (response) => {
      if (response?.toLowerCase() === 'yes') {
        return 'other_loans_car_loan_owed';
      }
      return 'results_trigger';
    },
    dataKey: 'other_loans.has_car_loans'
  },
  other_loans_car_loan_owed: {
    id: 'other_loans_car_loan_owed',
    text: "How much is currently owed on car loan(s)/lease(s)?",
    type: QuestionType.OPEN_ENDED,
    inputType: OpenEndedInputType.CURRENCY,
    next: () => 'results_trigger',
    dataKey: 'other_loans.car_loans_owed',
    placeholder: "e.g., 10000"
  },

  results_trigger: {
    id: 'results_trigger',
    text: "Thank you for providing all the information! We're now generating your financial report...",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["See my report"],
    next: () => 'end_chat_final',
    dataKey: null
  },
  end_chat_final: {
    id: 'end_chat_final',
    text: "Your financial report is ready! (This is the end of the chat demo)",
    type: QuestionType.OPEN_ENDED, // No input needed, just a final message
    isEndPoint: true,
    dataKey: null,
    next: () => 'end_chat_final' // No further navigation
  }
};